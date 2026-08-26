"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardToolShell from "./DashboardToolShell";
import styles from "./VisitorActivityDashboard.module.css";

const eventTypes = [
  "All",
  "page_view",
  "button_click",
  "link_click",
  "form_submit",
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
  const [error, setError] = useState("");

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

  function updateFilter(setter, value) {
    setPage(1);
    setter(value);
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

  return (
    <DashboardToolShell activeHref="/dashboard/activity">
      <section className={styles.page}>
        <div className={styles.heading}>
          <div>
            <span>FOREIGN VISITOR TRACKING</span>
            <h1>Visitor activity</h1>
            <p>
              Clicks and page activity from confirmed visitors outside Pakistan.
              Times are shown in Pakistan Standard Time.
            </p>
          </div>
          <div className={styles.headingActions}>
            <strong>{total.toLocaleString()} events · last 3 weeks</strong>
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
            placeholder="Search label, page or city"
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

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Date & time (PKT)</th>
                <th>Location</th>
                <th>Activity</th>
                <th>Button / link / page</th>
                <th>Page</th>
                <th>Destination</th>
                <th>Visitor</th>
              </tr>
            </thead>
            <tbody>
              {!loading && activities.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan="7">
                    No visitor activity found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className={styles.empty} colSpan="7">
                    Loading activity…
                  </td>
                </tr>
              )}
              {!loading &&
                activities.map((item) => (
                  <tr key={item._id}>
                    <td className={styles.date}>
                      {formatDate(item.occurredAt)}
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
                      <code title={item.visitorId}>
                        {item.visitorId.slice(0, 8)}
                      </code>
                    </td>
                  </tr>
                ))}
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
