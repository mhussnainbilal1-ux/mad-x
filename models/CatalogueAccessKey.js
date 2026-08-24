import mongoose from "mongoose";

const CatalogueAccessKeySchema = new mongoose.Schema(
  {
    keyHash: { type: String, required: true, unique: true, index: true },
    encryptedKey: { type: String, default: "" },
    maskedKey: { type: String, required: true },
    label: { type: String, default: "", trim: true, maxlength: 160, index: true },
    notes: { type: String, default: "", trim: true, maxlength: 2000 },
    accessLevel: {
      type: String,
      enum: ["catalogue", "admin"],
      default: "catalogue",
      index: true,
    },
    firstUsedAt: { type: Date, default: null, index: true },
    expiresAt: { type: Date, default: null, index: true },
    lastUsedAt: { type: Date, default: null },
    useCount: { type: Number, default: 0, min: 0 },
    revokedAt: { type: Date, default: null, index: true },
    createdBy: { type: String, default: "Dashboard admin", trim: true },
  },
  { timestamps: true, collection: "CatalogueAccessKeys" },
);

CatalogueAccessKeySchema.index({ createdAt: -1 });
CatalogueAccessKeySchema.index({ label: "text", notes: "text", maskedKey: "text" });

const existingCatalogueAccessKey = mongoose.models.CatalogueAccessKey;
if (
  existingCatalogueAccessKey &&
  !existingCatalogueAccessKey.schema.path("encryptedKey")
) {
  existingCatalogueAccessKey.schema.add({
    encryptedKey: { type: String, default: "" },
  });
}

export default existingCatalogueAccessKey ||
  mongoose.model(
    "CatalogueAccessKey",
    CatalogueAccessKeySchema,
    "CatalogueAccessKeys",
  );
