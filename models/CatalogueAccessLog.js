import mongoose from "mongoose";

const CatalogueAccessLogSchema = new mongoose.Schema(
  {
    keyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogueAccessKey",
      default: null,
      index: true,
    },
    keyFingerprint: { type: String, default: "", index: true },
    result: {
      type: String,
      enum: ["success", "invalid", "expired", "revoked"],
      required: true,
      index: true,
    },
    country: { type: String, default: "Unknown", trim: true, index: true },
    region: { type: String, default: "Unknown", trim: true },
    city: { type: String, default: "Unknown", trim: true },
    ipHash: { type: String, default: "" },
    userAgent: { type: String, default: "", maxlength: 600 },
  },
  { timestamps: true, collection: "CatalogueAccessLogs" },
);

CatalogueAccessLogSchema.index({ keyId: 1, createdAt: -1 });
CatalogueAccessLogSchema.index({ createdAt: -1, result: 1 });

export default mongoose.models.CatalogueAccessLog ||
  mongoose.model(
    "CatalogueAccessLog",
    CatalogueAccessLogSchema,
    "CatalogueAccessLogs",
  );
