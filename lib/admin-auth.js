const SESSION_COOKIE = "madx_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const REMEMBERED_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

function toBase64Url(value) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function createAdminSession(email, remember = false) {
  const lifetime = remember ? REMEMBERED_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS;
  const payload = toBase64Url(JSON.stringify({ email, expiresAt: Date.now() + lifetime * 1000 }));
  return { token: `${payload}.${toBase64Url(await hmac(payload))}`, lifetime };
}

export async function verifyAdminSession(token) {
  try {
    if (!token) return false;
    const [payload, suppliedSignature, extra] = token.split(".");
    if (!payload || !suppliedSignature || extra) return false;
    const expected = await hmac(payload);
    const supplied = fromBase64Url(suppliedSignature);
    if (expected.length !== supplied.length) return false;
    let difference = 0;
    for (let index = 0; index < expected.length; index += 1) difference |= expected[index] ^ supplied[index];
    if (difference !== 0) return false;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return Boolean(session.email && session.expiresAt > Date.now());
  } catch {
    return false;
  }
}

export function adminSessionCookie(token, maxAge) {
  return { name: SESSION_COOKIE, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge };
}

export { SESSION_COOKIE };
