import mongoose from "mongoose";

const VisitorActivitySchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, maxlength: 100, index: true },
    clientId: { type: String, default: "", maxlength: 160, index: true },
    clientCompany: { type: String, default: "", maxlength: 300, index: true },
    referralKey: { type: String, default: "", maxlength: 100, index: true },
    eventType: {
      type: String,
      required: true,
      enum: [
        "page_view",
        "section_view",
        "button_click",
        "link_click",
        "form_submit",
        "catalogue_unlock_click",
      ],
      index: true,
    },
    label: { type: String, default: "", trim: true, maxlength: 300 },
    pagePath: { type: String, required: true, maxlength: 1000, index: true },
    destination: { type: String, default: "", maxlength: 1500 },
    elementId: { type: String, default: "", maxlength: 160 },
    countryCode: { type: String, required: true, maxlength: 8, index: true },
    country: { type: String, required: true, maxlength: 160, index: true },
    region: { type: String, default: "Unknown", maxlength: 160 },
    city: { type: String, default: "Unknown", maxlength: 160 },
    userAgent: { type: String, default: "", maxlength: 600 },
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true, collection: "VisitorActivities" },
);

VisitorActivitySchema.index({ occurredAt: -1, countryCode: 1 });
VisitorActivitySchema.index({ eventType: 1, occurredAt: -1 });

export default mongoose.models.VisitorActivity ||
  mongoose.model("VisitorActivity", VisitorActivitySchema, "VisitorActivities");
