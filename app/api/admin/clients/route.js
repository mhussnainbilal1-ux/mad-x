import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import { mongoErrorResponse, serializeClient } from "@/lib/client-api";
import MadxClient, { buildCompanyCountryKey } from "@/models/MadxClient";

export async function GET(request) {
  if (!isMongoConfigured())
    return NextResponse.json({ configured: false, clients: [] });
  try {
    await connectMongoDB();
    const params = request.nextUrl.searchParams;
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
      ].map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
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
      clients: clients.map(serializeClient),
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
