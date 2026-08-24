import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { connectMongoDB } from "@/lib/mongodb";
import Message from "@/models/Message";

const requiredFields = ["name", "email", "product"];
const captchaLifetimeMs = 15 * 60 * 1000;
const inquirySources = new Set([
  "Contact Us",
  "Get a Quote",
  "Wholesale Inquiry",
]);
const fieldLimits = {
  name: 120,
  email: 254,
  company: 160,
  country: 100,
  product: 120,
  quantity: 100,
  message: 5000,
};

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

function normalizeFields(values) {
  return Object.fromEntries(
    Object.entries(fieldLimits).map(([field, limit]) => [
      field,
      String(values[field] || "")
        .trim()
        .slice(0, limit),
    ]),
  );
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

    const fields = normalizeFields(values);
    const missingField = requiredFields.find((field) => !fields[field]);

    if (missingField) {
      return NextResponse.json(
        { error: `Missing required field: ${missingField}` },
        { status: 400 },
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 },
      );
    }
    if (!inquirySources.has(values.source)) {
      return NextResponse.json(
        { error: "Invalid inquiry source" },
        { status: 400 },
      );
    }

    await connectMongoDB();
    const inquiry = await Message.create({
      name: fields.name,
      email: fields.email,
      company: fields.company,
      country: fields.country,
      product: fields.product,
      quantity: fields.quantity,
      message: fields.message,
      source: values.source,
    });

    return NextResponse.json(
      { success: true, id: String(inquiry._id) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Inquiry API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (error.code === "MONGODB_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Inquiry storage is not configured" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Unable to save your inquiry. Please try again" },
      { status: 500 },
    );
  }
}
