import mongoose from "mongoose";

const winningStages = [
  "Target Identified",
  "Outreach Planned",
  "Contacted",
  "Responded",
  "Qualified",
  "Samples / Quote Sent",
  "Negotiation",
  "Won",
  "Lost",
];

const RecipientSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, index: true },
    name: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    referralKey: { type: String, required: true, trim: true },
    referralLink: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Sent", "Failed", "Skipped"],
      default: "Pending",
    },
    providerMessageId: { type: String, default: "" },
    error: { type: String, default: "" },
    sentAt: { type: Date, default: null },
  },
  { _id: true },
);

const EmailCampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    subject: { type: String, required: true, trim: true, maxlength: 300 },
    message: { type: String, required: true, maxlength: 50000 },
    winningStage: {
      type: String,
      enum: ["", ...winningStages],
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Sending", "Completed", "Completed with errors"],
      default: "Draft",
      index: true,
    },
    recipients: {
      type: [RecipientSchema],
      validate: {
        validator: (items) => items.length > 0 && items.length <= 50,
        message: "A campaign must contain between 1 and 50 recipients",
      },
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "EmailCampaigns" },
);

EmailCampaignSchema.index({ createdAt: -1 });

export default mongoose.models.EmailCampaign ||
  mongoose.model("EmailCampaign", EmailCampaignSchema, "EmailCampaigns");

const cachedCampaign = mongoose.models.EmailCampaign;
if (cachedCampaign && !cachedCampaign.schema.path("winningStage")) {
  cachedCampaign.schema.add({
    winningStage: { type: String, enum: ["", ...winningStages], default: "" },
  });
}
