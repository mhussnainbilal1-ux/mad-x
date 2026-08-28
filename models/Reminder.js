import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    notes: { type: String, default: "", trim: true, maxlength: 2000 },
    reminderDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    reminderTime: { type: String, default: "", match: /^$|^\d{2}:\d{2}$/ },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true,
    },
    clientId: { type: String, default: "", trim: true, maxlength: 160 },
    clientCompany: { type: String, default: "", trim: true, maxlength: 300 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "Reminders" },
);

ReminderSchema.index({ reminderDate: 1, reminderTime: 1 });

export default mongoose.models.Reminder ||
  mongoose.model("Reminder", ReminderSchema, "Reminders");
