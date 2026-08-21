import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

const requiredFields = ["name", "email", "product"];
const captchaLifetimeMs = 15 * 60 * 1000;

function getCaptchaSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

function signCaptcha(payload) {
  return createHmac("sha256", getCaptchaSecret())
    .update(payload)
    .digest("base64url");
}

function createCaptcha() {
  const first = Math.floor(Math.random() * 8) + 2;
  const second = Math.floor(Math.random() * 8) + 2;
  const payload = Buffer.from(
    JSON.stringify({ first, second, createdAt: Date.now() }),
  ).toString("base64url");
  return {
    question: `What is ${first} + ${second}?`,
    token: `${payload}.${signCaptcha(payload)}`,
  };
}

function isCaptchaValid(token, answer) {
  try {
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature) return false;
    const expected = Buffer.from(signCaptcha(payload));
    const received = Buffer.from(signature);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    )
      return false;
    const challenge = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return (
      Date.now() - challenge.createdAt <= captchaLifetimeMs &&
      Number(answer) === challenge.first + challenge.second
    );
  } catch {
    return false;
  }
}

export async function GET() {
  if (!getCaptchaSecret())
    return NextResponse.json(
      { error: "Security check is not configured" },
      { status: 500 },
    );
  return NextResponse.json(createCaptcha());
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request) {
  try {
    const values = await request.json();
    if (!getCaptchaSecret()) {
      console.error("Missing ADMIN_SESSION_SECRET for inquiry CAPTCHA");
      return NextResponse.json(
        { error: "Security check is not configured" },
        { status: 500 },
      );
    }
    if (!isCaptchaValid(values.captchaToken, values.captcha)) {
      return NextResponse.json(
        { error: "Security check failed. Please try again" },
        { status: 400 },
      );
    }

    const missingField = requiredFields.find(
      (field) => !String(values[field] || "").trim(),
    );

    if (missingField) {
      return NextResponse.json(
        { error: `Missing required field: ${missingField}` },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.INQUIRY_TO_EMAIL;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !to || !from) {
      console.error("Missing Resend environment configuration");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 },
      );
    }

    const fields = [
      ["Name", values.name],
      ["Business email", values.email],
      ["Company / Brand", values.company],
      ["Country", values.country],
      ["Product type", values.product],
      ["Estimated quantity", values.quantity],
      ["Requirements", values.message],
    ];
    const html = fields
      .map(
        ([label, value]) =>
          `<p><strong>${label}:</strong><br>${escapeHtml(value || "Not provided")}</p>`,
      )
      .join("");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: values.email,
        subject: `New ${values.product} inquiry from ${values.name}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: "Email delivery failed" },
        { status: 502 },
      );
    }

    const result = await resendResponse.json();
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
