import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import Message from "@/models/Message";

function serializeMessage(message) {
  const value = message.toObject ? message.toObject() : message;
  return {
    ...value,
    _id: String(value._id),
    createdAt: value.createdAt?.toISOString?.() || value.createdAt,
    updatedAt: value.updatedAt?.toISOString?.() || value.updatedAt,
  };
}

export async function GET(request) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false, messages: [], unread: 0 });
  }

  try {
    await connectMongoDB();
    const params = request.nextUrl.searchParams;
    const unread = await Message.countDocuments({ isRead: false });

    if (params.get("countOnly") === "true") {
      return NextResponse.json({ configured: true, unread });
    }

    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 25));
    const filter = {};
    if (params.get("source") && params.get("source") !== "All") {
      filter.source = params.get("source");
    }
    if (params.get("status") && params.get("status") !== "All") {
      filter.status = params.get("status");
    }
    if (params.get("read") === "read") filter.isRead = true;
    if (params.get("read") === "unread") filter.isRead = false;

    const search = params.get("q")?.trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["name", "email", "company", "product", "message"]?.map(
        (field) => ({ [field]: { $regex: escaped, $options: "i" } }),
      );
    }

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);

    return NextResponse.json({
      configured: true,
      messages: messages?.map(serializeMessage),
      unread,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
