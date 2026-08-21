import { NextResponse } from "next/server";

export function mongoErrorResponse(error) {
  console.error("MongoDB CRM error:", error);
  if (error.code === "MONGODB_NOT_CONFIGURED") {
    return NextResponse.json(
      { configured: false, error: "MongoDB is not configured" },
      { status: 503 },
    );
  }
  if (error.code === 11000) {
    return NextResponse.json(
      { error: "A client with this record ID already exists" },
      { status: 409 },
    );
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(
    { error: "Unable to complete the database request" },
    { status: 500 },
  );
}

export function serializeClient(client) {
  const value = client.toObject ? client.toObject() : client;
  return {
    ...value,
    _id: String(value._id),
    receivedAt: value.receivedAt?.toISOString?.() || value.receivedAt,
  };
}
