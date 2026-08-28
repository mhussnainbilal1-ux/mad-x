import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import { mongoErrorResponse, serializeClient } from "@/lib/client-api";
import MadxClient, {
  buildCompanyCountryKey,
  generateReferralKey,
} from "@/models/MadxClient";

async function backfillReferralKeys() {
  const clients = await MadxClient.find({
    $or: [
      { referralKey: { $exists: false } },
      { referralKey: null },
      { referralKey: "" },
    ],
  })
    .select("_id")
    .lean();
  if (!clients.length) return;
  await MadxClient.bulkWrite(
    clients.map((client) => ({
      updateOne: {
        filter: { _id: client._id },
        update: { $set: { referralKey: generateReferralKey() } },
      },
    })),
    { ordered: false },
  );
}

export async function GET(request) {
  if (!isMongoConfigured())
    return NextResponse.json({ configured: false, clients: [] });
  try {
    await connectMongoDB();
    await backfillReferralKeys();
    const params = request.nextUrl.searchParams;
    if (params.get("summary") === "true") {
      const [total, active, won, overdue, stages] = await Promise.all([
        MadxClient.countDocuments(),
        MadxClient.countDocuments({ status: { $nin: ["Won", "Lost"] } }),
        MadxClient.countDocuments({ status: "Won" }),
        MadxClient.countDocuments({
          status: { $ne: "Lost" },
          nextFollowUp: {
            $exists: true,
            $nin: [null, ""],
            $lt: new Date().toISOString().slice(0, 10),
          },
        }),
        MadxClient.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);
      return NextResponse.json({
        configured: true,
        total,
        active,
        won,
        overdue,
        stages: Object.fromEntries(
          stages.map((stage) => [stage._id || "Unassigned", stage.count]),
        ),
      });
    }
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 25));
    const filter = {};
    if (params.get("status") && params.get("status") !== "All")
      filter.status = params.get("status");
    if (params.get("quality") && params.get("quality") !== "All")
      filter.contactQuality = params.get("quality");
    if (params.get("region") && params.get("region") !== "All")
      filter.country = params.get("region");
    if (params.get("businessType") && params.get("businessType") !== "All")
      filter.businessType = params.get("businessType");
    if (params.get("starred") === "true") filter.starred = true;
    if (params.get("starred") === "false") filter.starred = false;
    const search = params.get("q")?.trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        "company",
        "country",
        "businessType",
        "name",
        "publicContactRole",
        "decisionMaker",
        "researchSource",
        "source",
        "message",
      ]?.map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
    }
    const [clients, total] = await Promise.all([
      MadxClient.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MadxClient.countDocuments(filter),
    ]);
    return NextResponse.json({
      configured: true,
      clients: clients?.map(serializeClient),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();
    const values = await request.json();
    const companyCountryKey = buildCompanyCountryKey(
      values.company,
      values.country,
    );
    if (companyCountryKey && (await MadxClient.exists({ companyCountryKey }))) {
      return NextResponse.json(
        {
          error: `${values.company} in ${values.country} is already in the database`,
        },
        { status: 409 },
      );
    }
    const client = await MadxClient.create({ ...values, companyCountryKey });
    return NextResponse.json(
      { client: serializeClient(client) },
      { status: 201 },
    );
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
