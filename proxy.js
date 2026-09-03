import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { connectMongoDB } from "@/lib/mongodb";
import MadxClient from "@/models/MadxClient";

const REFERRAL_COOKIE = "madx_ref";
const referralPattern = /^[a-z0-9_-]{3,100}$/i;

async function handleReferral(request) {
  const suppliedReferral = request.nextUrl.searchParams.get("ref");
  if (suppliedReferral === null) return null;

  // Always return visitors to a clean version of the exact URL they opened.
  // URLSearchParams.delete removes duplicate ref parameters but preserves all
  // category filters, search terms, sorting, and other query parameters.
  const cleanUrl = request.nextUrl.clone();
  cleanUrl.searchParams.delete("ref");
  const response = NextResponse.redirect(cleanUrl);
  const referralKey = suppliedReferral.trim();

  if (!referralPattern.test(referralKey)) return response;

  try {
    await connectMongoDB();
    let referralClient = await MadxClient.findOne({ referralKey })
      .select("referralKey")
      .lean();

    // Also accept ?ref=ref-KEY for convenience, while preferring an exact
    // referral-key match if a real key itself happens to begin with "ref-".
    if (!referralClient && /^ref-/i.test(referralKey)) {
      const unprefixedKey = referralKey.replace(/^ref-/i, "");
      if (referralPattern.test(unprefixedKey)) {
        referralClient = await MadxClient.findOne({ referralKey: unprefixedKey })
          .select("referralKey")
          .lean();
      }
    }
    if (!referralClient) return response;

    response.cookies.set(REFERRAL_COOKIE, referralClient.referralKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  } catch (error) {
    console.error("Referral URL lookup failed:", error);
  }

  return response;
}

export async function proxy(request) {
  const referralResponse = await handleReferral(request);
  if (referralResponse) return referralResponse;

  const protectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/admin");
  if (!protectedRoute) return NextResponse.next();

  const authenticated = await verifyAdminSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (authenticated) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/admin"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|map|woff|woff2)$).*)",
  ],
};
