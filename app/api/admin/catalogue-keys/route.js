import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import {
  generateAccessKey,
  encryptAccessKey,
  hashAccessKey,
  maskAccessKey,
  serializeAccessKey,
} from "@/lib/catalogue-key-service";
import CatalogueAccessKey from "@/models/CatalogueAccessKey";
import CatalogueAccessLog from "@/models/CatalogueAccessLog";

function statusFilter(status, now) {
  if (status === "unused") return { revokedAt: null, firstUsedAt: null };
  if (status === "active")
    return { revokedAt: null, firstUsedAt: { $ne: null }, expiresAt: { $gt: now } };
  if (status === "expired") return { revokedAt: null, expiresAt: { $lte: now } };
  if (status === "revoked") return { revokedAt: { $ne: null } };
  return {};
}

export async function GET(request) {
  if (!isMongoConfigured())
    return NextResponse.json({ configured: false, keys: [], total: 0 });

  await connectMongoDB();
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 25));
  const now = new Date();
  const filter = { ...statusFilter(params.get("status"), now) };
  if (["catalogue", "admin"].includes(params.get("accessLevel")))
    filter.accessLevel = params.get("accessLevel");
  if (params.get("used") === "yes") filter.firstUsedAt = { $ne: null };
  if (params.get("used") === "no") filter.firstUsedAt = null;
  const search = params.get("q")?.trim();
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["label", "notes", "maskedKey"].map((field) => ({
      [field]: { $regex: escaped, $options: "i" },
    }));
  }

  const [keys, total, counts] = await Promise.all([
    CatalogueAccessKey.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CatalogueAccessKey.countDocuments(filter),
    Promise.all([
      CatalogueAccessKey.countDocuments(statusFilter("unused", now)),
      CatalogueAccessKey.countDocuments(statusFilter("active", now)),
      CatalogueAccessKey.countDocuments(statusFilter("expired", now)),
      CatalogueAccessKey.countDocuments(statusFilter("revoked", now)),
    ]),
  ]);

  const latestLocations = keys.length
    ? await CatalogueAccessLog.aggregate([
        { $match: { keyId: { $in: keys.map((key) => key._id) }, result: "success" } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$keyId", location: { $first: { city: "$city", region: "$region", country: "$country", usedAt: "$createdAt" } } } },
      ])
    : [];
  const locationByKey = new Map(
    latestLocations.map((entry) => [String(entry._id), entry.location]),
  );

  return NextResponse.json({
    configured: true,
    keys: keys.map((key) => ({
      ...serializeAccessKey(key, now, true),
      latestLocation: locationByKey.get(String(key._id)) || null,
    })),
    total,
    page,
    hasMore: page * limit < total,
    counts: {
      unused: counts[0],
      active: counts[1],
      expired: counts[2],
      revoked: counts[3],
    },
  });
}

export async function POST(request) {
  try {
    await connectMongoDB();
    const body = await request.json();
    const accessLevel = body.accessLevel === "admin" ? "admin" : "catalogue";
    const label = String(body.label || "").trim().slice(0, 160);
    const notes = String(body.notes || "").trim().slice(0, 2000);
    if (!label)
      return NextResponse.json({ error: "A customer or reference label is required." }, { status: 400 });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const plainKey = generateAccessKey(accessLevel);
      try {
        const key = await CatalogueAccessKey.create({
          keyHash: hashAccessKey(plainKey),
          encryptedKey: encryptAccessKey(plainKey),
          maskedKey: maskAccessKey(plainKey),
          label,
          notes,
          accessLevel,
        });
        return NextResponse.json(
          { key: serializeAccessKey(key), plainKey },
          { status: 201 },
        );
      } catch (error) {
        if (error.code !== 11000 || attempt === 4) throw error;
      }
    }
  } catch (error) {
    console.error("Unable to create catalogue key:", error);
    return NextResponse.json({ error: "Unable to create the access key." }, { status: 500 });
  }
}
