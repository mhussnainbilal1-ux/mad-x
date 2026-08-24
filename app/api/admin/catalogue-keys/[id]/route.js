import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import {
  encryptAccessKey,
  generateAccessKey,
  hashAccessKey,
  maskAccessKey,
  serializeAccessKey,
} from "@/lib/catalogue-key-service";
import CatalogueAccessKey from "@/models/CatalogueAccessKey";
import CatalogueAccessLog from "@/models/CatalogueAccessLog";

function serializeLog(log) {
  return {
    id: String(log._id),
    result: log.result,
    country: log.country,
    region: log.region,
    city: log.city,
    userAgent: log.userAgent,
    createdAt: log.createdAt?.toISOString?.() || log.createdAt,
  };
}

export async function GET(_request, { params }) {
  await connectMongoDB();
  const { id } = await params;
  try {
    const [key, logs] = await Promise.all([
      CatalogueAccessKey.findById(id).lean(),
      CatalogueAccessLog.find({ keyId: id }).sort({ createdAt: -1 }).lean(),
    ]);
    if (!key) return NextResponse.json({ error: "Access key not found." }, { status: 404 });
    return NextResponse.json({ key: serializeAccessKey(key, new Date(), true), logs: logs.map(serializeLog) });
  } catch {
    return NextResponse.json({ error: "Access key not found." }, { status: 404 });
  }
}

export async function PATCH(request, { params }) {
  await connectMongoDB();
  const { id } = await params;
  try {
    const body = await request.json();
    if (body.regenerate === true) {
      const current = await CatalogueAccessKey.findById(id);
      if (!current)
        return NextResponse.json({ error: "Access key not found." }, { status: 404 });
      const plainKey = generateAccessKey(current.accessLevel);
      current.keyHash = hashAccessKey(plainKey);
      current.encryptedKey = encryptAccessKey(plainKey);
      current.maskedKey = maskAccessKey(plainKey);
      current.firstUsedAt = null;
      current.expiresAt = null;
      current.lastUsedAt = null;
      current.useCount = 0;
      current.revokedAt = null;
      await current.save();
      return NextResponse.json({
        key: serializeAccessKey(current, new Date(), true),
        plainKey,
      });
    }
    const update = {};
    if (typeof body.revoked === "boolean") update.revokedAt = body.revoked ? new Date() : null;
    if (typeof body.label === "string") update.label = body.label.trim().slice(0, 160);
    if (typeof body.notes === "string") update.notes = body.notes.trim().slice(0, 2000);
    const key = await CatalogueAccessKey.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!key) return NextResponse.json({ error: "Access key not found." }, { status: 404 });
    return NextResponse.json({ key: serializeAccessKey(key, new Date(), true) });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update access key." }, { status: 400 });
  }
}
