import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse, serializeClient } from "@/lib/client-api";
import MadxClient, { buildCompanyCountryKey } from "@/models/MadxClient";

export async function GET(_request, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const client = await MadxClient.findOne({
      id: decodeURIComponent(id),
    }).lean();
    if (!client)
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json({ client: serializeClient(client) });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const updates = await request.json();
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    if (updates.company !== undefined || updates.country !== undefined) {
      const current = await MadxClient.findOne({
        id: decodeURIComponent(id),
      }).lean();
      if (!current)
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 },
        );
      const company = updates.company ?? current.company;
      const country = updates.country ?? current.country;
      updates.companyCountryKey = buildCompanyCountryKey(company, country);
      if (
        updates.companyCountryKey &&
        (await MadxClient.exists({
          companyCountryKey: updates.companyCountryKey,
          _id: { $ne: current._id },
        }))
      ) {
        return NextResponse.json(
          { error: `${company} in ${country} is already in the database` },
          { status: 409 },
        );
      }
    }
    const client = await MadxClient.findOneAndUpdate(
      { id: decodeURIComponent(id) },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!client)
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json({ client: serializeClient(client) });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const client = await MadxClient.findOneAndDelete({
      id: decodeURIComponent(id),
    });
    if (!client)
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
