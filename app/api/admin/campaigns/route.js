import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { mongoErrorResponse } from "@/lib/client-api";
import EmailCampaign from "@/models/EmailCampaign";
import MadxClient, { generateReferralKey } from "@/models/MadxClient";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serialize(campaign) {
  const value = campaign.toObject ? campaign.toObject() : campaign;
  return JSON.parse(JSON.stringify(value));
}

export async function GET() {
  try {
    await connectMongoDB();
    const campaigns = await EmailCampaign.find({})
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ campaigns: campaigns.map(serialize) });
  } catch (error) {
    return mongoErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const values = await request.json();
    const clientIds = [...new Set((values.clientIds || []).map(String))];
    if (!clientIds.length || clientIds.length > 50) {
      return NextResponse.json(
        { error: "Select between 1 and 50 leads" },
        { status: 400 },
      );
    }
    const name = String(values.name || "").trim();
    const subject = String(values.subject || "").trim();
    const message = String(values.message || "").trim();
    if (!name || !subject || !message) {
      return NextResponse.json(
        { error: "Campaign name, subject, and message are required" },
        { status: 400 },
      );
    }
    await connectMongoDB();
    const clients = await MadxClient.find({ id: { $in: clientIds } })
      .select("id name company email referralKey")
      .exec();
    for (const client of clients) {
      if (!client.referralKey) {
        client.referralKey = generateReferralKey();
        await client.save();
      }
    }
    const byId = new Map(clients.map((client) => [client.id, client]));
    const seenEmails = new Set();
    const recipients = [];
    const skipped = [];
    for (const id of clientIds) {
      const client = byId.get(id);
      const email = String(client?.email || "")
        .trim()
        .toLowerCase();
      if (
        !client ||
        !emailPattern.test(email) ||
        !client.referralKey ||
        seenEmails.has(email)
      ) {
        skipped.push(client?.company || id);
        continue;
      }
      seenEmails.add(email);
      recipients.push({
        clientId: client.id,
        name: client.name,
        company: client.company,
        email,
        referralKey: client.referralKey,
        referralLink: `https://www.madxsports.com/ref-${client.referralKey}`,
      });
    }
    if (!recipients.length) {
      return NextResponse.json(
        {
          error:
            "None of the selected leads has both a valid email and referral link",
        },
        { status: 400 },
      );
    }
    const campaign = await EmailCampaign.create({
      name,
      subject,
      message,
      recipients,
    });
    return NextResponse.json(
      { campaign: serialize(campaign), skipped },
      { status: 201 },
    );
  } catch (error) {
    return mongoErrorResponse(error);
  }
}
