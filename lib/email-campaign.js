import nodemailer from "nodemailer";

const variables = ["name", "company", "referral_link"];

export function renderCampaignTemplate(template, recipient) {
  const values = {
    name: recipient.name && recipient.name !== "—" ? recipient.name : "there",
    company: recipient.company || "",
    referral_link: recipient.referralLink,
  };
  return String(template || "").replace(
    /{{\s*([a-z_]+)\s*}}/gi,
    (match, key) =>
      variables.includes(key.toLowerCase()) ? values[key.toLowerCase()] : match,
  );
}

export function messageToHtml(message) {
  return String(message || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replace(
      /https:\/\/[^\s<]+/g,
      (url) =>
        `<a href="${url}" style="color:#0066cc;font-weight:700;text-decoration:underline">${url}</a>`,
    )
    .replaceAll("\n", "<br>");
}

export async function sendCampaignEmail({ to, subject, text }) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (gmailUser && gmailAppPassword) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    });
    const result = await transporter.sendMail({
      from: process.env.CAMPAIGN_FROM_NAME
        ? `"${process.env.CAMPAIGN_FROM_NAME.replaceAll('"', "")}" <${gmailUser}>`
        : gmailUser,
      to,
      subject,
      text,
      html: messageToHtml(text),
      replyTo: process.env.CAMPAIGN_REPLY_TO || gmailUser,
    });
    return result.messageId || "";
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CAMPAIGN_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Email sending is not configured");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html: messageToHtml(text),
      reply_to: process.env.CAMPAIGN_REPLY_TO || undefined,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.message || `Email provider returned ${response.status}`,
    );
  return result.id || "";
}

export function campaignEmailConfiguration() {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return "gmail";
  if (
    process.env.RESEND_API_KEY &&
    (process.env.CAMPAIGN_FROM_EMAIL || process.env.RESEND_FROM_EMAIL)
  )
    return "resend";
  return "";
}
