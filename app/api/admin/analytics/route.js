import { NextResponse } from "next/server";
import { getGa4Report } from "@/lib/ga4-reporting";

export async function GET(request) {
  const requestedDays = Number(new URL(request.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;

  try {
    return NextResponse.json(await getGa4Report(days));
  } catch (error) {
    console.error("GA4 reporting failed:", error);
    return Response.json({
    configured: true,
    error: error.message,
  });
    return NextResponse.json(
      { configured: true, error: "Analytics data is temporarily unavailable." },
      { status: 502 },
    );
  }
}
