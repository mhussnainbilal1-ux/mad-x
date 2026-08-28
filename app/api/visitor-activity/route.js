import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import {
  getVisitorLocation,
  isTrackableForeignVisitor,
} from "@/lib/visitor-location";
import VisitorActivity from "@/models/VisitorActivity";
import MadxClient from "@/models/MadxClient";

const eventTypes = new Set([
  "page_view",
  "button_click",
  "link_click",
  "form_submit",
  "catalogue_unlock_click",
]);

function text(value, limit) {
  return String(value || "")
    .trim()
    .slice(0, limit);
}

export async function POST(request) {
  const location = getVisitorLocation(request.headers);
  const referralKey = text(request.cookies.get("madx_ref")?.value, 100);
  const isForeignVisitor = isTrackableForeignVisitor(location);

  // Ordinary domestic traffic remains excluded. A valid client referral is
  // retained so its activity can still be attributed when geo headers fail.
  if (!isForeignVisitor && !referralKey) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const values = await request.json();
    if (!eventTypes.has(values.eventType)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 },
      );
    }

    const pagePath = text(values.pagePath, 1000);
    const visitorId = text(values.visitorId, 100);
    if (!pagePath || !visitorId) {
      return NextResponse.json({ error: "Invalid activity" }, { status: 400 });
    }
    if (pagePath.startsWith("/dashboard") || pagePath.startsWith("/login")) {
      return new NextResponse(null, { status: 204 });
    }

    await connectMongoDB();
    const referralClient = referralKey
      ? await MadxClient.findOne({ referralKey })
          .select("id company referralKey")
          .lean()
      : null;
    if (!isForeignVisitor && !referralClient) {
      return new NextResponse(null, { status: 204 });
    }
    await VisitorActivity.create({
      visitorId,
      clientId: referralClient?.id || "",
      clientCompany: referralClient?.company || "",
      referralKey: referralClient?.referralKey || "",
      eventType: values.eventType,
      label: text(values.label, 300),
      pagePath,
      destination: text(values.destination, 1500),
      elementId: text(values.elementId, 160),
      ...location,
      userAgent: text(request.headers.get("user-agent"), 600),
      occurredAt: new Date(),
    });

    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error) {
    console.error("Visitor activity tracking failed:", error);
    return NextResponse.json(
      { error: "Unable to save activity" },
      { status: 500 },
    );
  }
}
