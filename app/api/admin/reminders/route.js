import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import Reminder from "@/models/Reminder";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function clean(value, limit) {
  return String(value || "")
    .trim()
    .slice(0, limit);
}

function serialize(reminder) {
  const value = reminder.toObject ? reminder.toObject() : reminder;
  return {
    ...value,
    _id: String(value._id),
    createdAt: value.createdAt?.toISOString?.() || value.createdAt,
    updatedAt: value.updatedAt?.toISOString?.() || value.updatedAt,
    completedAt: value.completedAt?.toISOString?.() || value.completedAt,
  };
}

export async function GET(request) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false, reminders: [] });
  }
  const date = request.nextUrl.searchParams.get("date") || "";
  if (!datePattern.test(date)) {
    return NextResponse.json(
      { error: "A valid date is required" },
      { status: 400 },
    );
  }
  try {
    await connectMongoDB();
    const reminders = await Reminder.find({ reminderDate: date })
      .sort({ status: 1, reminderTime: 1, createdAt: 1 })
      .lean();
    return NextResponse.json({
      configured: true,
      reminders: reminders.map(serialize),
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const values = await request.json();
    const title = clean(values.title, 200);
    const reminderDate = clean(values.reminderDate, 10);
    if (!title || !datePattern.test(reminderDate)) {
      return NextResponse.json(
        { error: "Title and a valid reminder date are required" },
        { status: 400 },
      );
    }
    await connectMongoDB();
    const reminder = await Reminder.create({
      title,
      reminderDate,
      reminderTime: clean(values.reminderTime, 5),
      notes: clean(values.notes, 2000),
      clientId: clean(values.clientId, 160),
      clientCompany: clean(values.clientCompany, 300),
    });
    return NextResponse.json(
      { reminder: serialize(reminder) },
      { status: 201 },
    );
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
