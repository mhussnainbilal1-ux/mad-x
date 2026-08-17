import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cookies } from "next/headers";

export const CATALOGUE_COOKIE_NAME = "catalogue_access";

const ACCESS_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
const ALLOWLIST_PATH = join(process.cwd(), "private", "catalogue-guids.json");

function readAllowedGuids() {
  try {
    const allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));

    return Array.isArray(allowlist.allowedGuids) ? allowlist.allowedGuids : [];
  } catch (error) {
    console.error("Unable to read the catalogue GUID allowlist:", error);
    return [];
  }
}

export function normalizeGuid(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function isValidGuid(value) {
  return /^[A-Z0-9]{10}$/.test(normalizeGuid(value));
}

export function findActiveAllowedGuid(
  guid,
  now = new Date(),
  allowedGuids = readAllowedGuids(),
) {
  const normalizedGuid = normalizeGuid(guid);
  const matchingGuid = allowedGuids.find(
    (candidate) => normalizeGuid(candidate) === normalizedGuid,
  );

  if (!matchingGuid) return null;

  return {
    guid: normalizedGuid,
    expiresAt: new Date(now.getTime() + ACCESS_DURATION_MS),
  };
}

function getSigningSecret() {
  const secret = process.env.CATALOGUE_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "CATALOGUE_ACCESS_SECRET must contain at least 32 characters.",
    );
  }

  return secret;
}

function guidFingerprint(guid) {
  return createHash("sha256").update(normalizeGuid(guid)).digest("hex");
}

function sign(value) {
  return createHmac("sha256", getSigningSecret())
    .update(value)
    .digest("base64url");
}

export function createCatalogueToken(entry) {
  const expiresAt = entry.expiresAt;

  const payload = `${guidFingerprint(entry.guid)}.${Math.floor(
    expiresAt.getTime() / 1000,
  )}`;

  return {
    token: `${payload}.${sign(payload)}`,
    expiresAt,
  };
}

export function verifyCatalogueToken(token, now = new Date()) {
  if (typeof token !== "string") return false;

  const [fingerprint, expirationValue, suppliedSignature, ...rest] =
    token.split(".");

  if (!fingerprint || !expirationValue || !suppliedSignature || rest.length) {
    return false;
  }

  const payload = `${fingerprint}.${expirationValue}`;
  const expectedSignature = sign(payload);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return false;
  }

  const tokenExpiresAt = Number(expirationValue) * 1000;

  if (!Number.isFinite(tokenExpiresAt) || tokenExpiresAt <= now.getTime()) {
    return false;
  }

  const allowedGuids = readAllowedGuids();

  return allowedGuids.some((guid) => guidFingerprint(guid) === fingerprint);
}

export async function hasCatalogueAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CATALOGUE_COOKIE_NAME)?.value;

  if (!token) return false;

  try {
    return verifyCatalogueToken(token);
  } catch {
    return false;
  }
}
