import { NextResponse } from "next/server";
import { adminSessionCookie, createAdminSession } from "@/lib/admin-auth";

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function valuesMatch(left, right) {
  const [leftHash, rightHash] = await Promise.all([digest(left), digest(right)]);
  let difference = 0;
  for (let index = 0; index < leftHash.length; index += 1) difference |= leftHash[index] ^ rightHash[index];
  return difference === 0;
}

export async function POST(request) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!adminEmail || !adminPassword || !sessionSecret) {
    console.error("Admin authentication environment variables are missing");
    return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
  }
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const emailValid = await valuesMatch(email, adminEmail.trim().toLowerCase());
  const passwordValid = await valuesMatch(password, adminPassword);
  if (!emailValid || !passwordValid)
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  const { token, lifetime } = await createAdminSession(adminEmail, body.remember);
  const response = NextResponse.json({ success: true });
  response.cookies.set(adminSessionCookie(token, lifetime));
  return response;
}
