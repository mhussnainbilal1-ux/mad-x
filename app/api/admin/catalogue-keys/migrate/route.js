import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { encryptAccessKey, hashAccessKey, maskAccessKey } from "@/lib/catalogue-key-service";
import CatalogueAccessKey from "@/models/CatalogueAccessKey";
import legacyKeys from "@/private/catalogue-guids.json";

export async function POST() {
  await connectMongoDB();
  const entries = [
    ...(legacyKeys.allowedGuids || []).map((key) => ({ key, accessLevel: "catalogue" })),
    ...(legacyKeys.adminGuid || []).map((key) => ({ key, accessLevel: "admin" })),
  ];
  let imported = 0;
  for (const entry of entries) {
    const result = await CatalogueAccessKey.updateOne(
      { keyHash: hashAccessKey(entry.key) },
      {
        $set: { encryptedKey: encryptAccessKey(entry.key) },
        $setOnInsert: {
          maskedKey: maskAccessKey(entry.key),
          label: `Legacy ${entry.accessLevel} key`,
          notes: "Imported from the previous static key configuration.",
          accessLevel: entry.accessLevel,
          createdBy: "Legacy migration",
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount) imported += 1;
  }
  return NextResponse.json({ imported, total: entries.length });
}
