import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import MadxClient, {
  buildCompanyCountryKey,
  generateReferralKey,
} from "@/models/MadxClient";

export async function POST(request) {
  try {
    await connectMongoDB();
    const { clients } = await request.json();
    if (!Array.isArray(clients) || !clients.length) {
      return NextResponse.json(
        { error: "No client records supplied" },
        { status: 400 },
      );
    }
    if (clients.length > 5000) {
      return NextResponse.json(
        { error: "A maximum of 5,000 records can be imported at once" },
        { status: 400 },
      );
    }
    const keys = clients
      ?.map((client) => buildCompanyCountryKey(client.company, client.country))
      .filter(Boolean);
    const ids = clients?.map((client) => client.id).filter(Boolean);
    const existing = await MadxClient.find({
      $or: [{ companyCountryKey: { $in: keys } }, { id: { $in: ids } }],
    })
      .select("id company country companyCountryKey")
      .lean();
    const seenKeys = new Set(
      existing?.map((client) => client.companyCountryKey).filter(Boolean),
    );
    const seenIds = new Set(
      existing?.map((client) => client.id).filter(Boolean),
    );
    const duplicates = [];
    const accepted = [];
    for (const client of clients) {
      const companyCountryKey = buildCompanyCountryKey(
        client.company,
        client.country,
      );
      if (
        (companyCountryKey && seenKeys.has(companyCountryKey)) ||
        seenIds.has(client.id)
      ) {
        duplicates.push(
          `${client.company || "Unnamed company"} (${client.country || "No country"})`,
        );
        continue;
      }
      if (companyCountryKey) seenKeys.add(companyCountryKey);
      seenIds.add(client.id);
      accepted.push({
        ...client,
        companyCountryKey,
        referralKey: client.referralKey || generateReferralKey(),
      });
    }
    if (!accepted.length) {
      return NextResponse.json({
        success: true,
        processed: 0,
        inserted: 0,
        updated: 0,
        acceptedIds: [],
        duplicates,
      });
    }
    const operations = accepted?.map((client) => ({
      updateOne: {
        filter: { id: client.id },
        update: { $set: client },
        upsert: true,
      },
    }));
    const result = await MadxClient.bulkWrite(operations, { ordered: false });
    return NextResponse.json({
      success: true,
      processed: accepted.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      acceptedIds: accepted?.map((client) => client.id),
      duplicates,
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
