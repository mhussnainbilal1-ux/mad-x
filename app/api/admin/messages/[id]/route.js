import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import Message from "@/models/Message";

const allowedStatuses = new Set(["New", "In Progress", "Resolved", "Archived"]);

function serializeMessage(message) {
  return {
    ...message.toObject(),
    _id: String(message._id),
    createdAt: message.createdAt?.toISOString?.() || message.createdAt,
    updatedAt: message.updatedAt?.toISOString?.() || message.updatedAt,
  };
}

export async function PATCH(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const values = await request.json();
    const updates = {};

    if (typeof values.isRead === "boolean") updates.isRead = values.isRead;
    if (values.status !== undefined) {
      if (!allowedStatuses.has(values.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = values.status;
    }
    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "No valid changes supplied" },
        { status: 400 },
      );
    }

    const message = await Message.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    return NextResponse.json({ message: serializeMessage(message) });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
