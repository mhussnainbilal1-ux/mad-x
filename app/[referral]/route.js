import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import MadxClient from "@/models/MadxClient";

export async function GET(request, { params }) {
  const { referral } = await params;
  if (!referral.startsWith("ref-")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const match = /^ref-([a-z0-9_-]{3,100})$/i.exec(referral);
  const response = NextResponse.redirect(new URL("/", request.url));

  if (!match) return response;

  try {
    await connectMongoDB();
    const client = await MadxClient.exists({ referralKey: match[1] });
    if (!client) return response;

    response.cookies.set("madx_ref", match[1], {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  } catch (error) {
    console.error("Referral link lookup failed:", error);
  }

  return response;
}
