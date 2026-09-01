import nodemailer from "nodemailer";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendInquiryEmail({ source, fields }) {
  const to = "admin.madx@gmail.com";
  const subject = `${source || "Website"} inquiry from ${fields.name || "Anonymous visitor"}`;
  const entries = [
    ["Source", source],
    ["Name", fields.name],
    ["Email", fields.email],
    ["Company / Brand", fields.company],
    ["Country", fields.country],
    ["Product", fields.product],
    ["Estimated quantity", fields.quantity],
    ["Requirements", fields.message],
  ];
  const text = entries
    .map(([label, value]) => `${label}: ${value || "—"}`)
    .join("\n");
  const html = entries
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || "—").replaceAll("\n", "<br>")}</p>`,
    )
    .join("");
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (gmailUser && gmailPassword) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPassword },
    });
    await transporter.sendMail({
      from: gmailUser,
      to,
      subject,
      text,
      html,
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.CAMPAIGN_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Inquiry email is not configured");
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
      html,
    }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.message || `Email provider returned ${response.status}`,
    );
  }
}
