import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    company: { type: String, default: "", trim: true, maxlength: 160 },
    country: { type: String, default: "", trim: true, maxlength: 100 },
    product: { type: String, required: true, trim: true, maxlength: 120 },
    quantity: { type: String, default: "", trim: true, maxlength: 100 },
    message: { type: String, default: "", trim: true, maxlength: 5000 },
    source: {
      type: String,
      required: true,
      enum: ["Contact Us", "Get a Quote", "Wholesale Inquiry"],
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved", "Archived"],
      default: "New",
      index: true,
    },
  },
  { timestamps: true, collection: "Messages" },
);

MessageSchema.index({ createdAt: -1 });
MessageSchema.index({
  name: "text",
  email: "text",
  company: "text",
  product: "text",
  message: "text",
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema, "Messages");
