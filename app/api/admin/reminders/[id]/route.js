import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import Reminder from "@/models/Reminder";

const allowedFields = new Set([
  "title",
  "notes",
  "reminderDate",
  "reminderTime",
  "status",
  "clientId",
  "clientCompany",
]);

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const values = await request.json();
    const updates = Object.fromEntries(
      Object.entries(values).filter(([key]) => allowedFields.has(key)),
    );
    if (updates.status) {
      updates.completedAt = updates.status === "completed" ? new Date() : null;
    }
    await connectMongoDB();
    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ reminder });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await connectMongoDB();
    const reminder = await Reminder.findByIdAndDelete(id);
    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
