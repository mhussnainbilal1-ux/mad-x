import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import catalogueGuids from "@/private/catalogue-guids.json";

export const CATALOGUE_COOKIE_NAME = "catalogue_access";

const ACCESS_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
function readAccessGuids() {
  return {
    allowedGuids: Array.isArray(catalogueGuids.allowedGuids)
      ? catalogueGuids.allowedGuids
      : [],
    adminGuids: Array.isArray(catalogueGuids.adminGuid)
      ? catalogueGuids.adminGuid
      : [],
  };
}

export function normalizeGuid(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function isValidGuid(value) {
  return /^(?:[A-Z0-9]{10}|HBS_[A-Z0-9]{10})$/.test(normalizeGuid(value));
}

export function findActiveAllowedGuid(
  guid,
  now = new Date(),
  accessGuids = readAccessGuids(),
) {
  const normalizedGuid = normalizeGuid(guid);
  const matchingAdminGuid = accessGuids.adminGuids.find(
    (candidate) => normalizeGuid(candidate) === normalizedGuid,
  );
  const matchingAllowedGuid = accessGuids.allowedGuids.find(
    (candidate) => normalizeGuid(candidate) === normalizedGuid,
  );
  const matchingGuid = matchingAdminGuid || matchingAllowedGuid;

  if (!matchingGuid) return null;

  return {
    guid: normalizedGuid,
    accessLevel: matchingAdminGuid ? "admin" : "catalogue",
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
  if (typeof token !== "string") return null;

  const [fingerprint, expirationValue, suppliedSignature, ...rest] =
    token.split(".");

  if (!fingerprint || !expirationValue || !suppliedSignature || rest.length) {
    return null;
  }

  const payload = `${fingerprint}.${expirationValue}`;
  const expectedSignature = sign(payload);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return null;
  }

  const tokenExpiresAt = Number(expirationValue) * 1000;

  if (!Number.isFinite(tokenExpiresAt) || tokenExpiresAt <= now.getTime()) {
    return null;
  }

  const { allowedGuids, adminGuids } = readAccessGuids();
  const isAdmin = adminGuids.some(
    (guid) => guidFingerprint(guid) === fingerprint,
  );
  const hasCatalogueAccess =
    isAdmin ||
    allowedGuids.some((guid) => guidFingerprint(guid) === fingerprint);

  if (!hasCatalogueAccess) return null;

  return { hasCatalogueAccess: true, hasAdminAccess: isAdmin };
}

export async function getCatalogueAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CATALOGUE_COOKIE_NAME)?.value;

  if (!token) {
    return { hasCatalogueAccess: false, hasAdminAccess: false };
  }

  try {
    return (
      verifyCatalogueToken(token) || {
        hasCatalogueAccess: false,
        hasAdminAccess: false,
      }
    );
  } catch {
    return { hasCatalogueAccess: false, hasAdminAccess: false };
  }
}

export async function hasCatalogueAccess() {
  const access = await getCatalogueAccess();
  return access.hasCatalogueAccess;
}
