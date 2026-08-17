import { NextResponse } from "next/server";
import {
  CATALOGUE_COOKIE_NAME,
  createCatalogueToken,
  findActiveAllowedGuid,
  isValidGuid,
} from "@/lib/catalogue-access";

const attempts = new Map();
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function isRateLimited(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientId = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recentAttempts = (attempts.get(clientId) || []).filter(
    (timestamp) => now - timestamp < ATTEMPT_WINDOW_MS,
  );

  recentAttempts.push(now);
  attempts.set(clientId, recentAttempts);

  return recentAttempts.length > MAX_ATTEMPTS;
}

export async function POST(request) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let guid;

  try {
    ({ guid } = await request.json());
  } catch {
    return NextResponse.json(
      { message: "Please provide a valid catalogue access code." },
      { status: 400 },
    );
  }

  if (!isValidGuid(guid)) {
    return NextResponse.json(
      { message: "Please provide a valid catalogue access code." },
      { status: 400 },
    );
  }

  const entry = findActiveAllowedGuid(guid);

  if (!entry) {
    return NextResponse.json(
      { message: "This access code is invalid or has expired." },
      { status: 403 },
    );
  }

  try {
    const { token, expiresAt } = createCatalogueToken(entry);
    const response = NextResponse.json({ approved: true });

    response.cookies.set(CATALOGUE_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Unable to create catalogue access cookie:", error);

    return NextResponse.json(
      { message: "Catalogue access is temporarily unavailable." },
      { status: 500 },
    );
  }
}
