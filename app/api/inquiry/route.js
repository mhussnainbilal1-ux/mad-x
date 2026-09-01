import { NextResponse } from "next/server";
import { sendInquiryEmail } from "@/lib/inquiry-email";

const fieldNames = [
  "name",
  "email",
  "company",
  "country",
  "product",
  "quantity",
  "message",
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const values = await request.json();
    const fields = Object.fromEntries(
      fieldNames.map((field) => [field, String(values?.[field] || "").trim()]),
    );
    if (!fields.email) {
      return NextResponse.json(
        { error: "Please enter your email address." },
        { status: 400 },
      );
    }
    if (!emailPattern.test(fields.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    await sendInquiryEmail({ source: values?.source, fields });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry email error:", error);
    return NextResponse.json(
      { error: "Unable to send your inquiry. Please try again" },
      { status: 500 },
    );
  }
}
