import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse, serializeClient } from "@/lib/client-api";
import MadxClient, { buildCompanyCountryKey } from "@/models/MadxClient";

const allowedFields = new Set([
  "country",
  "businessType",
  "name",
  "publicContactRole",
  "decisionMaker",
  "contactQuality",
  "message",
  "researchSource",
  "lastContacted",
  "source",
  "notes",
  "email",
  "phone",
  "status",
  "nextFollowUp",
  "dealValue",
  "owner",
  "priority",
  "product",
  "quantity",
]);

function companyKey(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

export async function POST(request) {
  try {
    const { rows } = await request.json();
    if (!Array.isArray(rows) || !rows.length) {
      return NextResponse.json(
        { error: "No update rows supplied" },
        { status: 400 },
      );
    }
    if (rows.length > 5000) {
      return NextResponse.json(
        { error: "A maximum of 5,000 records can be updated at once" },
        { status: 400 },
      );
    }

    const duplicateInput = [];
    const requested = new Map();
    for (const row of rows) {
      const key = companyKey(row.company);
      if (!key) continue;
      if (requested.has(key)) {
        duplicateInput.push(row.company);
        requested.delete(key);
        continue;
      }
      if (duplicateInput.some((name) => companyKey(name) === key)) continue;
      requested.set(key, row);
    }
    if (!requested.size) {
      return NextResponse.json(
        { error: "No unique company names were supplied", duplicateInput },
        { status: 400 },
      );
    }

    await connectMongoDB();
    const clients = await MadxClient.find({
      $expr: {
        $in: [
          { $toLower: { $trim: { input: "$company" } } },
          [...requested.keys()],
        ],
      },
    }).lean();
    const matches = new Map();
    for (const client of clients) {
      const key = companyKey(client.company);
      const values = matches.get(key) || [];
      values.push(client);
      matches.set(key, values);
    }

    const unmatched = [];
    const ambiguous = [];
    const unchanged = [];
    const operations = [];
    const updatedIds = [];
    for (const [key, row] of requested) {
      const candidates = matches.get(key) || [];
      if (!candidates.length) {
        unmatched.push(row.company);
        continue;
      }
      if (candidates.length > 1) {
        ambiguous.push(row.company);
        continue;
      }
      const client = candidates[0];
      const updates = Object.fromEntries(
        Object.entries(row.updates || {}).filter(
          ([field, value]) =>
            allowedFields.has(field) && String(value).trim() !== "",
        ),
      );
      if (!Object.keys(updates).length) {
        unchanged.push(row.company);
        continue;
      }
      if (updates.country !== undefined) {
        updates.companyCountryKey = buildCompanyCountryKey(
          client.company,
          updates.country,
        );
      }
      operations.push({
        updateOne: {
          filter: { _id: client._id },
          update: { $set: updates },
        },
      });
      updatedIds.push(client._id);
    }

    if (operations.length) {
      await MadxClient.bulkWrite(operations, { ordered: false });
    }
    const updatedClients = updatedIds.length
      ? await MadxClient.find({ _id: { $in: updatedIds } }).lean()
      : [];
    return NextResponse.json({
      success: true,
      updated: updatedClients.length,
      clients: updatedClients.map(serializeClient),
      unmatched,
      ambiguous,
      duplicateInput,
      unchanged,
    });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
