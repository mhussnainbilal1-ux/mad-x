import { after, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import {
  campaignEmailConfiguration,
  renderCampaignTemplate,
  sendCampaignEmail,
} from "@/lib/email-campaign";
import EmailCampaign from "@/models/EmailCampaign";
import MadxClient from "@/models/MadxClient";

export const maxDuration = 300;

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

async function processCampaign(campaignId) {
  try {
    await connectMongoDB();
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign || campaign.status !== "Sending") return;

    for (const recipient of campaign.recipients) {
      if (recipient.status !== "Pending") continue;
      try {
        const subject = renderCampaignTemplate(campaign.subject, recipient);
        const message = renderCampaignTemplate(campaign.message, recipient);
        const providerMessageId = await sendCampaignEmail({
          to: recipient.email,
          subject,
          text: message,
        });
        const contactedAt = new Date();
        const followUp = new Date(contactedAt);
        followUp.setUTCDate(followUp.getUTCDate() + 6);
        recipient.status = "Sent";
        recipient.providerMessageId = providerMessageId;
        recipient.sentAt = contactedAt;
        recipient.error = "";
        await MadxClient.updateOne(
          { id: recipient.clientId },
          {
            $set: {
              lastContacted: dateOnly(contactedAt),
              nextFollowUp: dateOnly(followUp),
            },
          },
        );
      } catch (error) {
        recipient.status = "Failed";
        recipient.error = String(error.message || "Unable to send email").slice(
          0,
          1000,
        );
      }
      await campaign.save();
    }

    const hasErrors = campaign.recipients.some(
      (recipient) => recipient.status !== "Sent",
    );
    campaign.status = hasErrors ? "Completed with errors" : "Completed";
    campaign.completedAt = new Date();
    await campaign.save();
  } catch (error) {
    console.error("Campaign background sending failed:", error);
    await EmailCampaign.findByIdAndUpdate(campaignId, {
      $set: { status: "Completed with errors", completedAt: new Date() },
    }).catch(() => {});
  }
}

export async function POST(_request, { params }) {
  try {
    if (!campaignEmailConfiguration()) {
      return NextResponse.json(
        {
          error:
            "Email sending is not configured. Add Gmail App Password or Resend credentials.",
        },
        { status: 503 },
      );
    }
    await connectMongoDB();
    const id = (await params).id;
    const existing = await EmailCampaign.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }
    if (existing.status === "Sending") {
      const staleBefore = Date.now() - 60_000;
      if (new Date(existing.updatedAt).getTime() > staleBefore) {
        return NextResponse.json(
          { error: "This campaign is already sending" },
          { status: 409 },
        );
      }
      after(() => processCampaign(existing._id));
      return NextResponse.json({ campaign: existing }, { status: 202 });
    }
    const draft = await EmailCampaign.findOne({ _id: id, status: "Draft" })
      .select("winningStage")
      .lean();
    if (!draft) {
      return NextResponse.json(
        { error: "Only a draft campaign can be started" },
        { status: 409 },
      );
    }
    if (!draft.winningStage) {
      return NextResponse.json(
        { error: "Choose a Winning Stage before starting the campaign" },
        { status: 400 },
      );
    }
    const campaign = await EmailCampaign.findOneAndUpdate(
      { _id: id, status: "Draft" },
      { $set: { status: "Sending", startedAt: new Date() } },
      { new: true },
    );
    if (!campaign) {
      return NextResponse.json(
        { error: "Only a draft campaign can be started" },
        { status: 409 },
      );
    }

    await MadxClient.updateMany(
      { id: { $in: campaign.recipients.map((item) => item.clientId) } },
      { $set: { status: campaign.winningStage } },
    );
    after(() => processCampaign(campaign._id));
    return NextResponse.json({ campaign }, { status: 202 });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
