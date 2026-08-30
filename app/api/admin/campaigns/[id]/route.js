import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import EmailCampaign from "@/models/EmailCampaign";

const winningStages = new Set([
  "Target Identified",
  "Outreach Planned",
  "Contacted",
  "Responded",
  "Qualified",
  "Samples / Quote Sent",
  "Negotiation",
  "Won",
  "Lost",
]);

export async function GET(_request, { params }) {
  try {
    await connectMongoDB();
    const campaign = await EmailCampaign.findById((await params).id).lean();
    if (!campaign)
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    return NextResponse.json({ campaign });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { winningStage } = await request.json();
    if (!winningStages.has(winningStage)) {
      return NextResponse.json(
        { error: "Choose a valid Winning Stage" },
        { status: 400 },
      );
    }
    await connectMongoDB();
    const campaign = await EmailCampaign.findOneAndUpdate(
      { _id: (await params).id, status: "Draft" },
      { $set: { winningStage } },
      { new: true, runValidators: true },
    );
    if (!campaign) {
      return NextResponse.json(
        { error: "Only a draft campaign can be changed" },
        { status: 409 },
      );
    }
    return NextResponse.json({ campaign });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectMongoDB();
    const id = (await params).id;
    const campaign = await EmailCampaign.findById(id).select("status name");
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }
    if (campaign.status === "Sending") {
      return NextResponse.json(
        { error: "A campaign cannot be deleted while it is sending" },
        { status: 409 },
      );
    }
    await campaign.deleteOne();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
