import mongoose from "mongoose";

const AppSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, collection: "AppSettings" },
);

export default mongoose.models.AppSetting ||
  mongoose.model("AppSetting", AppSettingSchema, "AppSettings");
