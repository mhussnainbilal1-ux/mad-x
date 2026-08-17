import { NextResponse } from "next/server";
import { CATALOGUE_COOKIE_NAME } from "@/lib/catalogue-access";

export async function POST() {
  const response = NextResponse.json({ locked: true });

  response.cookies.set(CATALOGUE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
