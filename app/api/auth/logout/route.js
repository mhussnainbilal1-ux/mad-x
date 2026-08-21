import { NextResponse } from "next/server";
import { adminSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(adminSessionCookie("", 0));
  return response;
}
