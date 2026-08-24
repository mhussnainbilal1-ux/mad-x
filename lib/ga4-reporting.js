import "server-only";
import { createSign } from "node:crypto";

const analyticsScope = "https://www.googleapis.com/auth/analytics.readonly";
const tokenEndpoint = "https://oauth2.googleapis.com/token";
const reportEndpoint = "https://analyticsdata.googleapis.com/v1beta";
const conversionEvents = [
  "quote_form_submit",
  "contact_form_submit",
  "catalogue_unlock_request",
  "request_quote_click",
];

let cachedToken = null;
const reportCache = new Map();

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function getConfiguration() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return { propertyId, clientEmail, privateKey };
}

export function getGa4ConfigurationStatus() {
  const config = getConfiguration();
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  return { configured: missing.length === 0, missing };
}

async function getAccessToken() {
  if (cachedToken?.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const { clientEmail, privateKey } = getConfiguration();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: analyticsScope,
      aud: tokenEndpoint,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKey, "base64url");

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedToken}.${signature}`,
    }),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error_description || "Google authentication failed");

  cachedToken = {
    value: result.access_token,
    expiresAt: Date.now() + Number(result.expires_in || 3600) * 1000,
  };
  return cachedToken.value;
}

async function runReport(body) {
  const { propertyId } = getConfiguration();
  const accessToken = await getAccessToken();
  const response = await fetch(`${reportEndpoint}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || "Google Analytics report request failed");
  }
  return result;
}

function values(report) {
  return (report.rows || []).map((row) => ({
    dimensions: (row.dimensionValues || []).map((item) => item.value),
    metrics: (row.metricValues || []).map((item) => Number(item.value || 0)),
  }));
}

function previousRange(days) {
  return { startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo` };
}

export async function getGa4Report(days = 30) {
  const status = getGa4ConfigurationStatus();
  if (!status.configured) return { configured: false, missing: status.missing };

  const cached = reportCache.get(days);
  if (cached?.expiresAt > Date.now()) return cached.value;

  const currentRange = { startDate: `${days - 1}daysAgo`, endDate: "today" };
  const overviewMetrics = [
    { name: "activeUsers" },
    { name: "sessions" },
    { name: "screenPageViews" },
    { name: "engagementRate" },
    { name: "averageSessionDuration" },
  ];

  const [overview, previous, daily, pages, sources, countries, devices, events] =
    await Promise.all([
      runReport({ dateRanges: [currentRange], metrics: overviewMetrics }),
      runReport({ dateRanges: [previousRange(days)], metrics: overviewMetrics }),
      runReport({
        dateRanges: [currentRange],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      runReport({
        dateRanges: [currentRange],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "10",
      }),
      runReport({
        dateRanges: [currentRange],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "10",
      }),
      runReport({
        dateRanges: [currentRange],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: "10",
      }),
      runReport({
        dateRanges: [currentRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
      runReport({
        dateRanges: [currentRange],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: { values: conversionEvents },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      }),
    ]);

  const result = {
    configured: true,
    days,
    generatedAt: new Date().toISOString(),
    overview: values(overview)[0]?.metrics || [0, 0, 0, 0, 0],
    previous: values(previous)[0]?.metrics || [0, 0, 0, 0, 0],
    daily: values(daily),
    pages: values(pages),
    sources: values(sources),
    countries: values(countries),
    devices: values(devices),
    events: values(events),
  };
  reportCache.set(days, { value: result, expiresAt: Date.now() + 5 * 60_000 });
  return result;
}
