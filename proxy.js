import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

export async function proxy(request) {
  const authenticated = await verifyAdminSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (authenticated) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/admin"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/dashboard/:path*", "/api/admin/:path*"] };
