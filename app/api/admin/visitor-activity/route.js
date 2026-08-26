import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import VisitorActivity from "@/models/VisitorActivity";

export async function GET(request) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false, activities: [], total: 0 });
  }

  try {
    await connectMongoDB();
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 50));
    const filter = {};
    const eventType = params.get("eventType");
    const country = params.get("country")?.trim();
    const query = params.get("q")?.trim();
    const from = params.get("from");
    const to = params.get("to");

    if (eventType && eventType !== "All") filter.eventType = eventType;
    if (country && country !== "All") filter.country = country;
    if (from || to) {
      filter.occurredAt = {};
      if (from) filter.occurredAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) filter.occurredAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }
    if (query) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["label", "pagePath", "destination", "city", "region"].map(
        (field) => ({ [field]: { $regex: escaped, $options: "i" } }),
      );
    }

    const [activities, total, countries] = await Promise.all([
      VisitorActivity.find(filter)
        .sort({ occurredAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VisitorActivity.countDocuments(filter),
      VisitorActivity.distinct("country"),
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
