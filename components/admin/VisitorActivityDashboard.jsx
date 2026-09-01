"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardToolShell from "./DashboardToolShell";
import styles from "./VisitorActivityDashboard.module.css";

const eventTypes = [
  "All",
  "page_view",
  "section_view",
  "button_click",
  "link_click",
  "form_submit",
  "catalogue_unlock_click",
];

function eventName(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function classifyUserAgent(value) {
  const userAgent = String(value || "");
  const botPatterns = [
    ["Googlebot", /googlebot/i],
    ["Bingbot", /bingbot/i],
    ["OpenAI crawler", /gptbot|oai-searchbot|chatgpt-user/i],
    ["ClaudeBot", /claudebot|claude-web/i],
    ["PerplexityBot", /perplexitybot/i],
    ["Applebot", /applebot/i],
    ["Amazonbot", /amazonbot/i],
    ["Bytespider", /bytespider/i],
    ["PetalBot", /petalbot/i],
    ["YandexBot", /yandexbot/i],
    ["Baiduspider", /baiduspider/i],
    ["DuckDuckBot", /duckduckbot/i],
    ["FacebookBot", /facebookexternalhit|facebot/i],
    ["AhrefsBot", /ahrefsbot/i],
    ["SemrushBot", /semrushbot/i],
    ["MJ12bot", /mj12bot/i],
    ["DotBot", /dotbot/i],
    ["Common Crawl", /ccbot/i],
    ["DataForSeoBot", /dataforseobot/i],
    ["Automated browser", /headless|phantomjs|selenium/i],
  ];
  let bot = botPatterns.find(([, pattern]) => pattern.test(userAgent));
  if (!bot && /bot|crawler|spider|slurp/i.test(userAgent)) {
    const agentToken = userAgent.match(
      /(?:^|[\s;(])([^\s;/()]+(?:bot|crawler|spider|slurp))(?=\/|[\s;)]|$)/i,
    );
    bot = [agentToken?.[1] || "Unknown crawler"];
  }

  let device = "Desktop";
  if (!userAgent) device = "Unknown";
  else if (/ipad|tablet|kindle|silk|playbook/i.test(userAgent))
    device = "Tablet";
  else if (/mobi|iphone|ipod|android/i.test(userAgent)) device = "Mobile";

  return {
    device,
    visitorType: bot ? "Bot" : userAgent ? "Human" : "Unknown",
    botName: bot?.[0] || "",
  };
}

export default function VisitorActivityDashboard() {
  const [activities, setActivities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState("All");
  const [country, setCountry] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copying, setCopying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (query.trim()) params.set("q", query.trim());
      if (eventType !== "All") params.set("eventType", eventType);
      if (country !== "All") params.set("country", country);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const response = await fetch(`/api/admin/visitor-activity?${params}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to load visitor activity");
      setActivities(result.activities || []);
      setCountries(result.countries || []);
      setTotal(result.total || 0);
      setHasMore(Boolean(result.hasMore));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [country, eventType, from, page, query, to]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 250);
    return () => window.clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function updateFilter(setter, value) {
    setPage(1);
    setter(value);
  }

  async function copyRecords() {
    const headers = [
      "Date & time (PKT)",
      "Attributed client",
      "Location",
      "Activity",
        "Section / button / link / page",
      "Page",
      "Destination",
      "Device",
      "Visitor type",
      "Bot name",
      "Visitor ID",
    ];
    const clean = (value) =>
      String(value ?? "")
        .replaceAll("\t", " ")
        .replace(/[\r\n]+/g, " ")
        .trim();
    const rows = activities.map((item) => {
      const visitor = classifyUserAgent(item.userAgent);
      const location = [item.country, item.city, item.region]
        .filter((value) => value && value !== "Unknown")
        .join(", ");
      return [
        formatDate(item.occurredAt),
        item.clientCompany,
        location,
        eventName(item.eventType),
        item.label,
        item.pagePath,
        item.destination,
        visitor.device,
        visitor.visitorType,
        visitor.botName,
        item.visitorId,
      ].map(clean);
    });
    const output = [headers, ...rows].map((row) => row.join("\t")).join("\n");

    setCopying(true);
    setError("");
    try {
      await navigator.clipboard.writeText(output);
      setNotice(
        `${activities.length} record${activities.length === 1 ? "" : "s"} copied with column headers.`,
      );
    } catch {
      setError(
        "Unable to copy records. Please allow clipboard access and try again.",
      );
    } finally {
      setCopying(false);
    }
  }

  async function clearActivity(scope) {
    const clearAll = scope === "all";
    const confirmed = window.confirm(
      clearAll
        ? "Permanently delete all visitor activity? This cannot be undone."
        : "Permanently delete visitor activity older than three weeks? This cannot be undone.",
    );
    if (!confirmed) return;

    setClearing(scope);
    setError("");
    try {
      const response = await fetch("/api/admin/visitor-activity", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to clear activity");
      setPage(1);
      await load();
    } catch (clearError) {
      setError(clearError.message);
    } finally {
      setClearing("");
    }
  }

  async function deleteActivity(item) {
    const detail =
      item.clientCompany || item.label || eventName(item.eventType);
    const confirmed = window.confirm(
      `Delete this activity for ${detail}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(item._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/visitor-activity", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to delete activity");

      setActivities((current) =>
        current.filter((activity) => activity._id !== item._id),
      );
      setTotal((current) => Math.max(0, current - 1));
      setNotice("Visitor activity deleted successfully.");
      if (activities.length === 1 && page > 1) setPage((value) => value - 1);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <DashboardToolShell activeHref="/dashboard/activity">
      <section className={styles.page}>
        <div className={styles.heading}>
          <div>
            <span>FOREIGN VISITOR TRACKING</span>
            <h1>Visitor activity</h1>
            <p>
              Clicks and page activity from confirmed foreign visitors and
              attributed client referrals. Times are shown in Pakistan Standard
              Time.
            </p>
          </div>
          <div className={styles.headingActions}>
            <strong>{total.toLocaleString()} events · last 3 weeks</strong>
            <button
              type="button"
              disabled={loading || copying || activities.length === 0}
              onClick={copyRecords}
            >
              {copying ? "Copying…" : `Copy records (${activities.length})`}
            </button>
            <button
              type="button"
              disabled={Boolean(clearing)}
              onClick={() => clearActivity("older_than_three_weeks")}
            >
              {clearing === "older_than_three_weeks"
                ? "Clearing…"
                : "Clear older than 3 weeks"}
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              disabled={Boolean(clearing)}
              onClick={() => clearActivity("all")}
            >
              {clearing === "all" ? "Clearing…" : "Clear all"}
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          <input
            aria-label="Search activity"
            placeholder="Search company, label, page or city"
            value={query}
            onChange={(event) => updateFilter(setQuery, event.target.value)}
          />
          <select
            aria-label="Event type"
            value={eventType}
            onChange={(event) => updateFilter(setEventType, event.target.value)}
          >
            {eventTypes.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All activities" : eventName(item)}
              </option>
            ))}
          </select>
          <select
            aria-label="Country"
            value={country}
            onChange={(event) => updateFilter(setCountry, event.target.value)}
          >
            <option value="All">All countries</option>
            {countries.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <label>
            From
            <input
              type="date"
              value={from}
              onChange={(event) => updateFilter(setFrom, event.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={to}
              onChange={(event) => updateFilter(setTo, event.target.value)}
            />
          </label>
        </div>

        {notice && (
          <p className={styles.success} role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Date & time (PKT)</th>
                <th>Attributed client</th>
                <th>Location</th>
                <th>Activity</th>
                <th>Section / button / link / page</th>
                <th>Page</th>
                <th>Destination</th>
                <th>Device</th>
                <th>Visitor / agent</th>
                <th>Visitor ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && activities.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan="11">
                    No visitor activity found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className={styles.empty} colSpan="11">
                    Loading activity…
                  </td>
                </tr>
              )}
              {!loading &&
                activities.map((item) => {
                  const visitor = classifyUserAgent(item.userAgent);
                  return (
                    <tr key={item._id} title={item.userAgent || undefined}>
                      <td className={styles.date}>
                        {formatDate(item.occurredAt)}
                      </td>
                      <td>
                        {item.clientCompany ? (
                          <>
                            <strong>{item.clientCompany}</strong>
                            <small>Referral attributed</small>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <strong>{item.country}</strong>
                        <small>
                          {[item.city, item.region]
                            .filter((value) => value && value !== "Unknown")
                            .join(", ") || "Location unavailable"}
                        </small>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${styles[item.eventType]}`}
                        >
                          {eventName(item.eventType)}
                        </span>
                      </td>
                      <td className={styles.label}>{item.label || "—"}</td>
                      <td>
                        <code>{item.pagePath}</code>
                      </td>
                      <td>
                        {item.destination ? (
                          <a
                            href={item.destination}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open link
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${styles.deviceBadge}`}
                        >
                          {visitor.device}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            visitor.visitorType === "Bot"
                              ? styles.botBadge
                              : visitor.visitorType === "Human"
                                ? styles.humanBadge
                                : styles.unknownBadge
                          }`}
                        >
                          {visitor.visitorType}
                        </span>
                        {visitor.botName && <small>{visitor.botName}</small>}
                      </td>
                      <td>
                        <code title={item.visitorId}>
                          {item.visitorId.slice(0, 8)}
                        </code>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.deleteRowButton}
                          disabled={deletingId === item._id}
                          onClick={() => deleteActivity(item)}
                          aria-label={`Delete ${eventName(item.eventType)} activity`}
                          title="Delete activity"
                        >
                          {deletingId === item._id ? (
                            <LoaderCircle
                              className={styles.spinning}
                              size={15}
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className={styles.pagination}>
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={!hasMore || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </DashboardToolShell>
  );
}
