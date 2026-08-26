import "server-only";

function clean(value, fallback = "Unknown") {
  if (!value) return fallback;
  try {
    return decodeURIComponent(value).trim().slice(0, 160) || fallback;
  } catch {
    return String(value).trim().slice(0, 160) || fallback;
  }
}

export function getVisitorLocation(headers) {
  const countryCode = clean(
    headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry"),
    "",
  ).toUpperCase();

  let country = countryCode;
  try {
    country = countryCode
      ? new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode)
      : "Unknown";
  } catch {
    country = countryCode || "Unknown";
  }

  return {
    countryCode,
    country: clean(headers.get("x-vercel-ip-country-name") || country),
    region: clean(headers.get("x-vercel-ip-country-region")),
    city: clean(headers.get("x-vercel-ip-city")),
  };
}

export function isTrackableForeignVisitor(location) {
  return Boolean(location?.countryCode && location.countryCode !== "PK");
}
