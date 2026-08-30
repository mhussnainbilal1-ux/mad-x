"use client";

import Link from "next/link";
import {
  ArrowLeft,
  LoaderCircle,
  Mail,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardToolShell from "./DashboardToolShell";
import styles from "./EmailCampaignDashboard.module.css";

const winningStages = [
  "Target Identified",
  "Outreach Planned",
  "Contacted",
  "Responded",
  "Qualified",
  "Samples / Quote Sent",
  "Negotiation",
  "Won",
  "Lost",
];

function displayDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function render(template, recipient) {
  const values = {
    name: recipient.name && recipient.name !== "—" ? recipient.name : "there",
    company: recipient.company || "",
    referral_link: recipient.referralLink,
  };
  return String(template || "").replace(
    /{{\s*([a-z_]+)\s*}}/gi,
    (match, key) =>
      Object.hasOwn(values, key.toLowerCase())
        ? values[key.toLowerCase()]
        : match,
  );
}

export default function EmailCampaignDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => campaigns.find((campaign) => campaign._id === selectedId) || null,
    [campaigns, selectedId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/campaigns", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to load campaigns");
      setCampaigns(result.campaigns || []);
      setSelectedId((current) => current || result.campaigns?.[0]?._id || "");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!campaigns.some((campaign) => campaign.status === "Sending")) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch("/api/admin/campaigns", {
          cache: "no-store",
        });
        const result = await response.json();
        if (response.ok) setCampaigns(result.campaigns || []);
      } catch {}
    }, 3000);
    return () => window.clearInterval(interval);
  }, [campaigns]);

  async function startCampaign() {
    if (!selected || starting) return;
    const resuming = selected.status === "Sending";
    if (
      !window.confirm(
        resuming
          ? `Resume pending emails for “${selected.name}”? Already sent recipients will not be sent again.`
          : `Start “${selected.name}” for ${selected.recipients.length} recipients and move all clients to “${selected.winningStage}”? It cannot be started twice.`,
      )
    )
      return;
    setStarting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/campaigns/${selected._id}/start`,
        { method: "POST" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to start campaign");
      setCampaigns((current) =>
        current.map((item) =>
          item._id === result.campaign._id ? result.campaign : item,
        ),
      );
    } catch (startError) {
      setError(startError.message);
      await load();
    } finally {
      setStarting(false);
    }
  }

  async function deleteCampaign() {
    if (!selected || deleting || selected.status === "Sending") return;
    if (
      !window.confirm(
        `Permanently delete “${selected.name}” and its recipient history? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/campaigns/${selected._id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to delete campaign");
      const remaining = campaigns.filter((item) => item._id !== selected._id);
      setCampaigns(remaining);
      setSelectedId(remaining[0]?._id || "");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeleting(false);
    }
  }

  async function updateWinningStage(winningStage) {
    if (!selected || selected.status !== "Draft" || savingStage) return;
    setSavingStage(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/campaigns/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winningStage }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to save Winning Stage");
      setCampaigns((current) =>
        current.map((item) =>
          item._id === result.campaign._id ? result.campaign : item,
        ),
      );
    } catch (stageError) {
      setError(stageError.message);
    } finally {
      setSavingStage(false);
    }
  }

  const previewRecipient = selected?.recipients?.[0];
  const canResume =
    selected?.status === "Sending" &&
    Date.now() - new Date(selected.updatedAt).getTime() > 60_000;

  return (
    <DashboardToolShell activeHref="/dashboard/campaigns">
      <section className={styles.page}>
        <header className={styles.heading}>
          <div>
            <span>CRM OUTREACH</span>
            <h1>Email campaigns</h1>
            <p>
              Review saved campaigns, personalized recipients, and delivery
              results.
            </p>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={load} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <Link href="/dashboard/crm">
              <ArrowLeft size={16} /> Select leads in CRM
            </Link>
          </div>
        </header>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.layout}>
          <aside className={styles.list}>
            {loading && <p>Loading campaigns…</p>}
            {!loading && campaigns.length === 0 && (
              <div className={styles.empty}>
                <Mail size={28} />
                <strong>No campaigns yet</strong>
                <span>Select leads in the CRM to create one.</span>
              </div>
            )}
            {campaigns.map((campaign) => {
              const sent = campaign.recipients.filter(
                (item) => item.status === "Sent",
              ).length;
              return (
                <button
                  type="button"
                  key={campaign._id}
                  className={selectedId === campaign._id ? styles.active : ""}
                  onClick={() => setSelectedId(campaign._id)}
                >
                  <strong>{campaign.name}</strong>
                  <span>{campaign.status}</span>
                  <small>
                    {campaign.recipients.length} recipients · {sent} sent
                  </small>
                </button>
              );
            })}
          </aside>
          {selected && (
            <main className={styles.detail}>
              <div className={styles.detailHead}>
                <div>
                  <span>{selected.status}</span>
                  <h2>{selected.name}</h2>
                  <small>Created {displayDate(selected.createdAt)}</small>
                </div>
                <div className={styles.detailActions}>
                  <button
                    className={styles.delete}
                    type="button"
                    onClick={deleteCampaign}
                    disabled={selected.status === "Sending" || deleting}
                  >
                    {deleting ? (
                      <LoaderCircle className={styles.spin} size={17} />
                    ) : (
                      <Trash2 size={17} />
                    )}
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                  <button
                    className={styles.start}
                    type="button"
                    onClick={startCampaign}
                    disabled={
                      (selected.status !== "Draft" && !canResume) ||
                      (selected.status === "Draft" && !selected.winningStage) ||
                      starting
                    }
                    title={
                      selected.status === "Sending" && !canResume
                        ? "Sending is in progress"
                        : !selected.winningStage
                          ? "Choose a Winning Stage before starting"
                          : "Start this campaign"
                    }
                  >
                    {starting ? (
                      <LoaderCircle className={styles.spin} size={17} />
                    ) : (
                      <Play size={17} />
                    )}
                    {starting
                      ? "Sending…"
                      : canResume
                        ? "Resume sending"
                        : selected.status === "Draft"
                          ? "Start campaign"
                          : selected.status === "Sending"
                            ? "Sending…"
                            : "Campaign started"}
                  </button>
                </div>
              </div>
              <section className={styles.preview}>
                <label className={styles.stageField}>
                  <span>Winning Stage for all selected clients</span>
                  <select
                    value={selected.winningStage || ""}
                    onChange={(event) => updateWinningStage(event.target.value)}
                    disabled={selected.status !== "Draft" || savingStage}
                  >
                    <option value="" disabled>
                      Select stage before starting
                    </option>
                    {winningStages.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                  <small>
                    {savingStage
                      ? "Saving stage…"
                      : "Applied to every campaign client when the campaign starts."}
                  </small>
                </label>
                <h3>Email preview</h3>
                <strong>
                  Subject:{" "}
                  {previewRecipient
                    ? render(selected.subject, previewRecipient)
                    : selected.subject}
                </strong>
                <p>
                  {previewRecipient
                    ? render(selected.message, previewRecipient)
                    : selected.message}
                </p>
                {previewRecipient && (
                  <small>
                    Previewing for{" "}
                    {previewRecipient.company || previewRecipient.email}
                  </small>
                )}
              </section>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Referral link</th>
                      <th>Status</th>
                      <th>Sent</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.recipients.map((recipient) => (
                      <tr key={recipient._id}>
                        <td>
                          <strong>{recipient.company || "—"}</strong>
                        </td>
                        <td>{recipient.name || "—"}</td>
                        <td>{recipient.email}</td>
                        <td>
                          <a
                            href={recipient.referralLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open link
                          </a>
                        </td>
                        <td>{recipient.status}</td>
                        <td>{displayDate(recipient.sentAt)}</td>
                        <td>
                          {recipient.error ||
                            recipient.providerMessageId ||
                            "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          )}
        </div>
      </section>
    </DashboardToolShell>
  );
}
