import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { findValidKeyByHash, hashAccessKey } from "@/lib/catalogue-key-service";
import { isPublicCatalogueEnabled } from "@/lib/catalogue-settings";

export const CATALOGUE_COOKIE_NAME = "catalogue_access";

export function normalizeGuid(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function isValidGuid(value) {
  return /^(?:[A-Z0-9]{10}|HBS_[A-Z0-9]{10})$/.test(normalizeGuid(value));
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

function sign(value) {
  return createHmac("sha256", getSigningSecret())
    .update(value)
    .digest("base64url");
}

export function createCatalogueToken(entry) {
  const expiresAt = entry.expiresAt;
  const keyHash = entry.keyHash || hashAccessKey(entry.guid);
  const payload = `${keyHash}.${Math.floor(expiresAt.getTime() / 1000)}`;

  return {
    token: `${payload}.${sign(payload)}`,
    expiresAt,
  };
}

export async function verifyCatalogueToken(token, now = new Date()) {
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

  const key = await findValidKeyByHash(fingerprint, now);
  if (!key) return null;
  return {
    hasCatalogueAccess: true,
    hasAdminAccess: key.accessLevel === "admin",
  };
}

export const getCatalogueAccess = cache(async function () {
  const isPublicCatalogue = await isPublicCatalogueEnabled();
  const cookieStore = await cookies();
  const token = cookieStore.get(CATALOGUE_COOKIE_NAME)?.value;

  if (!token) {
    return {
      hasCatalogueAccess: isPublicCatalogue,
      hasAdminAccess: false,
      isPublicCatalogue,
    };
  }

  try {
    const keyAccess = await verifyCatalogueToken(token);
    return {
      hasCatalogueAccess:
        isPublicCatalogue || Boolean(keyAccess?.hasCatalogueAccess),
      hasAdminAccess: Boolean(keyAccess?.hasAdminAccess),
      isPublicCatalogue,
    };
  } catch {
    return {
      hasCatalogueAccess: isPublicCatalogue,
      hasAdminAccess: false,
      isPublicCatalogue,
    };
  }
});

export async function hasCatalogueAccess() {
  const access = await getCatalogueAccess();
  return access.hasCatalogueAccess;
}
