import { NextResponse } from "next/server";
import {
  isPublicCatalogueEnabled,
  setPublicCatalogueEnabled,
} from "@/lib/catalogue-settings";

export async function GET() {
  return NextResponse.json({
    publicCatalogueEnabled: await isPublicCatalogueEnabled(),
  });
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (typeof body.publicCatalogueEnabled !== "boolean") {
      return NextResponse.json(
        { error: "A valid catalogue visibility value is required." },
        { status: 400 },
      );
    }

    const publicCatalogueEnabled = await setPublicCatalogueEnabled(
      body.publicCatalogueEnabled,
    );
    return NextResponse.json({ publicCatalogueEnabled });
  } catch (error) {
    console.error("Unable to update catalogue visibility:", error);
    return NextResponse.json(
      { error: "Unable to update catalogue visibility." },
      { status: 500 },
    );
  }
}
