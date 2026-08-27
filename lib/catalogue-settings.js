import "server-only";

import { cache } from "react";
import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb";
import AppSetting from "@/models/AppSetting";

const PUBLIC_CATALOGUE_KEY = "publicCatalogueEnabled";

export const isPublicCatalogueEnabled = cache(async function () {
  if (!isMongoConfigured()) return false;

  try {
    await connectMongoDB();
    const setting = await AppSetting.findOne({ key: PUBLIC_CATALOGUE_KEY })
      .select({ value: 1 })
      .lean();
    return setting?.value === true;
  } catch (error) {
    console.error("Unable to read the public catalogue setting:", error);
    return false;
  }
});

export async function setPublicCatalogueEnabled(enabled) {
  await connectMongoDB();
  const setting = await AppSetting.findOneAndUpdate(
    { key: PUBLIC_CATALOGUE_KEY },
    { $set: { value: enabled === true } },
    { upsert: true, new: true, runValidators: true },
  ).lean();

  return setting.value === true;
}
