import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import VisitorActivity from "@/models/VisitorActivity";

const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

function retentionCutoff() {
  return new Date(Date.now() - THREE_WEEKS_MS);
}

export async function GET(request) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false, activities: [], total: 0 });
  }

  try {
    await connectMongoDB();
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 50));
    const cutoff = retentionCutoff();
    const filter = { occurredAt: { $gte: cutoff } };
    const eventType = params.get("eventType");
    const country = params.get("country")?.trim();
    const query = params.get("q")?.trim();
    const from = params.get("from");
    const to = params.get("to");

    if (eventType && eventType !== "All") filter.eventType = eventType;
    if (country && country !== "All") filter.country = country;
    if (from || to) {
      if (from) {
        const requestedFrom = new Date(`${from}T00:00:00.000Z`);
        if (!Number.isNaN(requestedFrom.getTime()) && requestedFrom > cutoff) {
          filter.occurredAt.$gte = requestedFrom;
        }
      }
      if (to) filter.occurredAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }
    if (query) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        "label",
        "pagePath",
        "destination",
        "city",
        "region",
        "clientCompany",
        "referralKey",
      ].map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
    }

    const [activities, total, countries] = await Promise.all([
      VisitorActivity.find(filter)
        .sort({ occurredAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VisitorActivity.countDocuments(filter),
      VisitorActivity.distinct("country", { occurredAt: { $gte: cutoff } }),
    ]);

    return NextResponse.json({
      configured: true,
      activities: activities.map((item) => ({
        ...item,
        _id: String(item._id),
        occurredAt: item.occurredAt?.toISOString?.() || item.occurredAt,
      })),
      countries: countries.filter(Boolean).sort(),
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function DELETE(request) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Visitor activity storage is not configured" },
      { status: 503 },
    );
  }

  try {
    const { scope } = await request.json();
    if (!["older_than_three_weeks", "all"].includes(scope)) {
      return NextResponse.json(
        { error: "Invalid deletion scope" },
        { status: 400 },
      );
    }

    await connectMongoDB();
    const filter =
      scope === "all" ? {} : { occurredAt: { $lt: retentionCutoff() } };
    const result = await VisitorActivity.deleteMany(filter);

    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
