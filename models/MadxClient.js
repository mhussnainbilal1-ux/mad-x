import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

export function generateReferralKey() {
  return randomBytes(6).toString("base64url").toLowerCase();
}

const MadxClientSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true, trim: true },
    company: { type: String, default: "", trim: true, index: true },
    country: { type: String, default: "", trim: true, index: true },
    companyCountryKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    referralKey: {
      type: String,
      default: generateReferralKey,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    businessType: { type: String, default: "", trim: true, index: true },
    name: { type: String, default: "", trim: true },
    publicContactRole: { type: String, default: "", trim: true },
    decisionMaker: { type: String, default: "", trim: true },
    contactQuality: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
      index: true,
    },
    message: { type: String, default: "" },
    researchSource: { type: String, default: "", trim: true },
    lastContacted: { type: String, default: "" },
    source: { type: String, default: "", trim: true },
    notes: { type: String, default: "" },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: [
        "Target Identified",
        "Outreach Planned",
        "Contacted",
        "Responded",
        "Qualified",
        "Samples / Quote Sent",
        "Negotiation",
        "Won",
        "Lost",
      ],
      default: "Target Identified",
      index: true,
    },
    nextFollowUp: { type: String, default: "", index: true },
    dealValue: { type: Number, default: 0, min: 0 },
    owner: { type: String, default: "Unassigned", trim: true, index: true },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    product: { type: String, default: "", trim: true },
    quantity: { type: String, default: "", trim: true },
    starred: { type: Boolean, default: false, index: true },
    pakistanFlagged: { type: Boolean, default: false, index: true },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "MadxClients" },
);

MadxClientSchema.pre("validate", function setCompanyCountryKey() {
  this.companyCountryKey = buildCompanyCountryKey(this.company, this.country);
});

MadxClientSchema.index({
  company: "text",
  name: "text",
  country: "text",
  businessType: "text",
  decisionMaker: "text",
});

// Next.js keeps compiled Mongoose models across development hot reloads. Add
// newly introduced paths to that cached schema so PATCH does not silently
// discard them until the dev server is restarted.
const existingMadxClient = mongoose.models.MadxClient;
if (existingMadxClient && !existingMadxClient.schema.path("pakistanFlagged")) {
  existingMadxClient.schema.add({
    pakistanFlagged: { type: Boolean, default: false, index: true },
  });
}
if (existingMadxClient && !existingMadxClient.schema.path("referralKey")) {
  existingMadxClient.schema.add({
    referralKey: {
      type: String,
      default: generateReferralKey,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
  });
}

export default existingMadxClient ||
  mongoose.model("MadxClient", MadxClientSchema, "MadxClients");

export function buildCompanyCountryKey(company = "", country = "") {
  const normalizedCompany = String(company).trim().toLocaleLowerCase();
  const normalizedCountry = String(country).trim().toLocaleLowerCase();
  return normalizedCompany && normalizedCountry
    ? `${normalizedCompany}::${normalizedCountry}`
    : undefined;
}
