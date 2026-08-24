import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { isIP } from "node:net";
import { connectMongoDB } from "@/lib/mongodb";
import CatalogueAccessKey from "@/models/CatalogueAccessKey";
import CatalogueAccessLog from "@/models/CatalogueAccessLog";

export const CATALOGUE_ACCESS_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.CATALOGUE_ACCESS_SECRET;
  if (!value || value.length < 32) {
    throw new Error("CATALOGUE_ACCESS_SECRET must contain at least 32 characters.");
  }
  return value;
}

export function normalizeAccessKey(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function hashAccessKey(value) {
  return createHmac("sha256", secret())
    .update(normalizeAccessKey(value))
    .digest("hex");
}

function encryptionKey() {
  return createHash("sha256").update(secret()).digest();
}

export function encryptAccessKey(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(normalizeAccessKey(value), "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptAccessKey(value) {
  if (!value) return null;
  try {
    const [iv, tag, encrypted, extra] = value.split(".");
    if (!iv || !tag || !encrypted || extra) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export function maskAccessKey(value) {
  const normalized = normalizeAccessKey(value);
  const prefix = normalized.startsWith("HBS_") ? "HBS_" : "";
  return `${prefix}••••••${normalized.slice(-4)}`;
}

export function generateAccessKey(accessLevel = "catalogue") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(10);
  let key = "";
  for (const byte of bytes) key += alphabet[byte % alphabet.length];
  return accessLevel === "admin" ? `HBS_${key}` : key;
}

function decodeHeader(value) {
  if (!value) return "Unknown";
  try {
    return decodeURIComponent(value).slice(0, 160);
  } catch {
    return String(value).slice(0, 160);
  }
}

export async function requestLocation(request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const directIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwarded || directIp || "unknown";
  const location = {
    country: decodeHeader(
      request.headers.get("x-vercel-ip-country") ||
        request.headers.get("cf-ipcountry"),
    ),
    region: decodeHeader(request.headers.get("x-vercel-ip-country-region")),
    city: decodeHeader(request.headers.get("x-vercel-ip-city")),
    ipHash:
      ip === "unknown"
        ? ""
        : createHmac("sha256", secret()).update(ip).digest("hex"),
    userAgent: (request.headers.get("user-agent") || "").slice(0, 600),
  };

  if (
    isIP(ip) &&
    location.city === "Unknown" &&
    location.region === "Unknown"
  ) {
    try {
      const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      const result = await response.json();
      if (response.ok && result.success !== false) {
        location.country = String(result.country || location.country).slice(0, 160);
        location.region = String(result.region || location.region).slice(0, 160);
        location.city = String(result.city || location.city).slice(0, 160);
      }
    } catch {
      // Provider headers and Unknown values remain valid fallbacks.
    }
  }

  return location;
}

export function keyStatus(key, now = new Date()) {
  if (key.revokedAt) return "revoked";
  if (!key.firstUsedAt) return "unused";
  if (key.expiresAt && new Date(key.expiresAt) <= now) return "expired";
  return "active";
}

export async function validateAndUseAccessKey(value, request) {
  await connectMongoDB();
  const normalized = normalizeAccessKey(value);
  const keyHash = hashAccessKey(normalized);
  const now = new Date();
  const key = await CatalogueAccessKey.findOne({ keyHash });
  const location = await requestLocation(request);

  if (!key) {
    await CatalogueAccessLog.create({
      keyFingerprint: keyHash.slice(0, 16),
      result: "invalid",
      ...location,
    });
    return { approved: false, reason: "invalid" };
  }

  const status = keyStatus(key, now);
  if (status === "revoked" || status === "expired") {
    await CatalogueAccessLog.create({
      keyId: key._id,
      keyFingerprint: keyHash.slice(0, 16),
      result: status,
      ...location,
    });
    return { approved: false, reason: status };
  }

  if (!key.firstUsedAt) {
    key.firstUsedAt = now;
    key.expiresAt = new Date(now.getTime() + CATALOGUE_ACCESS_DURATION_MS);
  }
  key.lastUsedAt = now;
  key.useCount += 1;
  await key.save();
  await CatalogueAccessLog.create({
    keyId: key._id,
    keyFingerprint: keyHash.slice(0, 16),
    result: "success",
    ...location,
  });

  return {
    approved: true,
    keyId: String(key._id),
    keyHash,
    accessLevel: key.accessLevel,
    expiresAt: key.expiresAt,
  };
}

export async function findValidKeyByHash(keyHash, now = new Date()) {
  await connectMongoDB();
  const key = await CatalogueAccessKey.findOne({ keyHash }).lean();
  if (!key || keyStatus(key, now) !== "active") return null;
  return key;
}

export function serializeAccessKey(key, now = new Date(), includePlainKey = false) {
  const value = key.toObject ? key.toObject() : key;
  return {
    id: String(value._id),
    maskedKey: value.maskedKey,
    plainKey: includePlainKey ? decryptAccessKey(value.encryptedKey) : undefined,
    label: value.label,
    notes: value.notes,
    accessLevel: value.accessLevel,
    status: keyStatus(value, now),
    firstUsedAt: value.firstUsedAt?.toISOString?.() || value.firstUsedAt,
    expiresAt: value.expiresAt?.toISOString?.() || value.expiresAt,
    lastUsedAt: value.lastUsedAt?.toISOString?.() || value.lastUsedAt,
    revokedAt: value.revokedAt?.toISOString?.() || value.revokedAt,
    useCount: value.useCount || 0,
    createdAt: value.createdAt?.toISOString?.() || value.createdAt,
    updatedAt: value.updatedAt?.toISOString?.() || value.updatedAt,
  };
}
