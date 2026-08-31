const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|slurp|headless|phantomjs|selenium|facebookexternalhit|facebot|google-inspectiontool|lighthouse|pagespeed|pingdom|uptimerobot|preview|fetcher|scrapy|curl|wget|python-requests|python-urllib|go-http-client|java\//i;

export function isBotUserAgent(value) {
  const userAgent = String(value || "").trim();
  return !userAgent || BOT_USER_AGENT_PATTERN.test(userAgent);
}
