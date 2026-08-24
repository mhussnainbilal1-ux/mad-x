"use client";

import { Check, Clipboard, KeyRound, MapPin, Plus, RefreshCw, Search, ShieldBan, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardToolShell from "./DashboardToolShell";
import styles from "./CatalogueKeyManager.module.css";

const emptyFilters = { q: "", status: "all", accessLevel: "all", used: "all" };

function date(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function CatalogueKeyManager() {
  const [filters, setFilters] = useState(emptyFilters);
  const [result, setResult] = useState({ keys: [], total: 0, counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [page, setPage] = useState(1);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
    });
    params.set("page", String(page));
    params.set("limit", "25");
    try {
      const response = await fetch(`/api/admin/catalogue-keys?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load keys");
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters.q, filters.status, filters.accessLevel, filters.used]);

  useEffect(() => {
    const timer = setTimeout(loadKeys, filters.q ? 250 : 0);
    return () => clearTimeout(timer);
  }, [loadKeys, filters.q]);

  async function createKey(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/catalogue-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create key");
      setNewKey(data);
      form.reset();
      loadKeys();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  async function loadDetail(id) {
    setDetailLoading(true);
    setSelected({ key: result.keys.find((key) => key.id === id), logs: [] });
    try {
      const response = await fetch(`/api/admin/catalogue-keys/${id}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSelected(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleRevoked(key) {
    const response = await fetch(`/api/admin/catalogue-keys/${key.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revoked: key.status !== "revoked" }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Unable to update key");
    setSelected((current) => current ? { ...current, key: data.key } : current);
    loadKeys();
  }

  async function migrateLegacy() {
    if (!window.confirm("Import the keys from the previous static JSON file into MongoDB?")) return;
    const response = await fetch("/api/admin/catalogue-keys/migrate", { method: "POST" });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Migration failed");
    window.alert(`${data.imported} legacy keys imported. ${data.total - data.imported} already existed.`);
    loadKeys();
  }

  async function copyPlainKey() {
    await navigator.clipboard.writeText(newKey.plainKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function copyTableKey(event, key) {
    event.stopPropagation();
    if (!key.plainKey) return;
    await navigator.clipboard.writeText(key.plainKey);
    setCopiedKeyId(key.id);
    setTimeout(() => setCopiedKeyId(null), 1800);
  }

  async function replaceUnavailableKey(event, key) {
    event.stopPropagation();
    if (!window.confirm(`Replace the unrecoverable key for ${key.label}? The old key will stop working.`)) return;
    const response = await fetch(`/api/admin/catalogue-keys/${key.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate: true }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Unable to replace key");
    setNewKey(data);
    loadKeys();
  }

  return <DashboardToolShell activeHref="/dashboard/catalogue-keys">
    <div className={styles.content}>
      <header className={styles.heading}><div><span>PRIVATE CATALOGUE</span><h1>Access key management</h1><p>Create three-day customer access keys and review every use.</p></div><button className={styles.migrate} onClick={migrateLegacy}>Import legacy keys</button></header>

      {error && <div className={styles.error}>{error}<button onClick={() => setError("")}><X size={15} /></button></div>}

      <section className={styles.stats}>{["unused", "active", "expired", "revoked"].map((status) => <button key={status} className={filters.status === status ? styles.selectedStat : ""} onClick={() => setFilters((current) => ({ ...current, status }))}><span>{status}</span><strong>{result.counts?.[status] || 0}</strong></button>)}</section>

      <section className={styles.createPanel}><div><KeyRound size={22} /><div><h2>Generate a customer key</h2><p>The three-day timer starts at first successful use.</p></div></div><form onSubmit={createKey}><input name="label" required maxLength="160" placeholder="Customer or campaign label" /><select name="accessLevel" defaultValue="catalogue"><option value="catalogue">Catalogue access</option><option value="admin">Catalogue admin</option></select><input name="notes" maxLength="2000" placeholder="Optional notes" /><button disabled={creating}><Plus size={16} /> {creating ? "Creating…" : "Create key"}</button></form></section>

      <section className={styles.filters}><label><Search size={16} /><input value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Search label, notes or masked key" /></label><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="all">All statuses</option><option value="unused">Unused</option><option value="active">Active</option><option value="expired">Expired</option><option value="revoked">Revoked</option></select><select value={filters.accessLevel} onChange={(event) => setFilters((current) => ({ ...current, accessLevel: event.target.value }))}><option value="all">All access levels</option><option value="catalogue">Catalogue</option><option value="admin">Admin</option></select><select value={filters.used} onChange={(event) => setFilters((current) => ({ ...current, used: event.target.value }))}><option value="all">Used or unused</option><option value="yes">Used</option><option value="no">Never used</option></select><button onClick={() => setFilters(emptyFilters)}>Clear</button><button onClick={loadKeys} aria-label="Refresh"><RefreshCw size={16} /></button></section>

      <section className={styles.tablePanel}><div className={styles.tableMeta}><strong>{result.total || 0} access keys</strong><span>{loading ? "Loading…" : "Click a key to copy it; click its row for full history"}</span></div><div className={styles.tableWrap}><table><thead><tr><th>KEY</th><th>LABEL</th><th>LEVEL</th><th>STATUS</th><th>USED</th><th>LATEST LOCATION</th><th>FIRST USED</th><th>EXPIRES</th><th>LAST USED</th></tr></thead><tbody>{result.keys.map((key) => <tr key={key.id} onClick={() => loadDetail(key.id)}><td>{key.plainKey ? <button type="button" className={styles.tableKey} onClick={(event) => copyTableKey(event, key)} title="Copy access key"><code>{key.plainKey}</code>{copiedKeyId === key.id ? <Check size={14} /> : <Clipboard size={14} />}</button> : <button type="button" className={styles.replaceKey} onClick={(event) => replaceUnavailableKey(event, key)}>Generate replacement</button>}</td><td>{key.label}</td><td>{key.accessLevel}</td><td><span className={`${styles.status} ${styles[key.status]}`}>{key.status}</span></td><td>{key.useCount}</td><td>{key.latestLocation ? <span className={styles.locationCell}><MapPin size={13} />{[key.latestLocation.city, key.latestLocation.region, key.latestLocation.country].filter((value) => value && value !== "Unknown").join(", ") || "Unknown"}</span> : "Not used"}</td><td>{date(key.firstUsedAt)}</td><td>{date(key.expiresAt)}</td><td>{date(key.lastUsedAt)}</td></tr>)}</tbody></table>{!loading && !result.keys.length && <div className={styles.empty}>No access keys match these filters.</div>}</div><footer className={styles.pagination}><button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button><span>Page {page}</span><button disabled={!result.hasMore} onClick={() => setPage((value) => value + 1)}>Next</button></footer></section>
    </div>

    {newKey && <div className={styles.backdrop}><section className={styles.keyDialog}><button className={styles.close} onClick={() => setNewKey(null)}><X /></button><Check className={styles.successIcon} /><h2>Access key created</h2><p>This key will remain fully visible and copyable from the authenticated dashboard.</p><code>{newKey.plainKey}</code><button className={styles.copy} onClick={copyPlainKey}>{copied ? <Check size={17} /> : <Clipboard size={17} />} {copied ? "Copied" : "Copy key"}</button></section></div>}

    {selected && <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><section className={styles.detail}><header><div><span>ACCESS KEY</span><h2>{selected.key?.label}</h2><button type="button" className={styles.detailKey} onClick={(event) => copyTableKey(event, selected.key)} disabled={!selected.key?.plainKey}><code>{selected.key?.plainKey || selected.key?.maskedKey}</code>{selected.key?.plainKey && (copiedKeyId === selected.key.id ? <Check size={14} /> : <Clipboard size={14} />)}</button><p>{selected.key?.accessLevel} access</p></div><button onClick={() => setSelected(null)}><X /></button></header>{detailLoading ? <div className={styles.detailLoading}>Loading complete history…</div> : <><div className={styles.detailGrid}><div><span>Status</span><strong className={`${styles.status} ${styles[selected.key.status]}`}>{selected.key.status}</strong></div><div><span>Uses</span><strong>{selected.key.useCount}</strong></div><div><span>Created</span><strong>{date(selected.key.createdAt)}</strong></div><div><span>First used</span><strong>{date(selected.key.firstUsedAt)}</strong></div><div><span>Expires</span><strong>{date(selected.key.expiresAt)}</strong></div><div><span>Last used</span><strong>{date(selected.key.lastUsedAt)}</strong></div></div>{selected.key.notes && <p className={styles.notes}>{selected.key.notes}</p>}<div className={styles.detailActions}><button className={selected.key.status === "revoked" ? styles.restore : styles.revoke} onClick={() => toggleRevoked(selected.key)}><ShieldBan size={16} /> {selected.key.status === "revoked" ? "Restore key" : "Revoke key"}</button></div><h3>Usage and location log</h3><div className={styles.logs}>{selected.logs.length ? selected.logs.map((log) => <article key={log.id}><MapPin size={16} /><div><strong>{log.city}, {log.region}, {log.country}</strong><span>{date(log.createdAt)} · {log.result}</span><small>{log.userAgent || "Device unavailable"}</small></div></article>) : <p>No usage has been recorded for this key.</p>}</div></>}</section></div>}
  </DashboardToolShell>;
}
