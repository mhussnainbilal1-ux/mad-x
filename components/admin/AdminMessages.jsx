"use client";

import Link from "next/link";
import {
  BarChart3,
  Bell,
  ChevronDown,
  FileDown,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import shell from "./AdminDashboard.module.css";
import styles from "./AdminMessages.module.css";

const sources = ["All", "Contact Us", "Get a Quote", "Wholesale Inquiry"];
const statuses = ["All", "New", "In Progress", "Resolved", "Archived"];

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(new Date(value));
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All");
  const [status, setStatus] = useState("All");
  const [readFilter, setReadFilter] = useState("all");
  const [unread, setUnread] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (query.trim()) params.set("q", query.trim());
      if (source !== "All") params.set("source", source);
      if (status !== "All") params.set("status", status);
      if (readFilter !== "all") params.set("read", readFilter);
      const response = await fetch(`/api/admin/messages?${params}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to load messages");
      setMessages(result.messages || []);
      setUnread(result.unread || 0);
      setTotal(result.total || 0);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [query, readFilter, source, status]);

  useEffect(() => {
    const timeout = window.setTimeout(loadMessages, 250);
    return () => window.clearTimeout(timeout);
  }, [loadMessages]);

  async function patchMessage(id, updates) {
    const response = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Unable to update message");
    setMessages((items) =>
      items?.map((item) => (item._id === id ? result.message : item)),
    );
    setSelected((current) => (current?._id === id ? result.message : current));
    return result.message;
  }

  async function openMessage(message) {
    setSelected(message);
    if (message.isRead) return;
    try {
      await patchMessage(message._id, { isRead: true });
      setUnread((count) => Math.max(0, count - 1));
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function updateStatus(nextStatus) {
    if (!selected) return;
    try {
      await patchMessage(selected._id, { status: nextStatus });
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function toggleRead() {
    if (!selected) return;
    const nextRead = !selected.isRead;
    try {
      await patchMessage(selected._id, { isRead: nextRead });
      setUnread((count) => Math.max(0, count + (nextRead ? -1 : 1)));
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function deleteMessage() {
    if (!selected || !window.confirm("Delete this message permanently?"))
      return;
    try {
      const response = await fetch(`/api/admin/messages/${selected._id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to delete message");
      if (!selected.isRead) setUnread((count) => Math.max(0, count - 1));
      setMessages((items) => items.filter((item) => item._id !== selected._id));
      setTotal((count) => Math.max(0, count - 1));
      setSelected(null);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function clearFilters() {
    setQuery("");
    setSource("All");
    setStatus("All");
    setReadFilter("all");
  }

  return (
    <div className={`${shell.adminRoot} admin-dashboard-root`}>
      {mobileOpen && (
        <button
          className={shell.backdrop}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`${shell.sidebar} ${mobileOpen ? shell.sidebarOpen : ""}`}
      >
        <div className={shell.logoRow}>
          <Link href="/dashboard" className={shell.logo}>
            <span>MX</span>
            <div>
              <strong>MADX</strong>
              <small>ADMIN</small>
            </div>
          </Link>
          <button
            className={shell.closeMenu}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className={shell.workspace}>
          <span className={shell.avatar}>MS</span>
          <div>
            <strong>MADX Sports</strong>
            <small>Administrator</small>
          </div>
          <ChevronDown size={16} />
        </div>
        <nav className={shell.nav} aria-label="Admin navigation">
          <p>WORKSPACE</p>
          <Link href="/dashboard">
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </Link>
          <Link href="/dashboard/analytics">
            <BarChart3 size={19} />
            <span>Analytics</span>
          </Link>
          <Link href="/dashboard/crm">
            <Users size={19} />
            <span>Sales CRM</span>
          </Link>
          <Link href="/dashboard/messages" className={shell.active}>
            <MessageSquareText size={19} />
            <span>Messages</span>
            {unread > 0 && <em>{unread}</em>}
          </Link>
          <Link href="/dashboard/photo-editor">
            <ImageIcon size={19} />
            <span>Photo Editor</span>
          </Link>
          <Link href="/dashboard/image-pdf">
            <FileDown size={19} />
            <span>Image PDF</span>
          </Link>
          <p>MANAGE</p>
          <button type="button">
            <Settings size={19} />
            <span>Settings</span>
          </button>
        </nav>
        <div className={shell.sidebarBottom}>
          <Link href="/" className={shell.viewSite}>
            View public website
          </Link>
        </div>
      </aside>

      <main className={shell.main}>
        <header className={shell.topbar}>
          <button
            className={shell.menu}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <label className={shell.search}>
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search messages..."
            />
          </label>
          <div className={shell.topActions} data-dashboard-header-actions>
            <Link
              href="/dashboard/messages"
              className={styles.notificationButton}
              aria-label={`${unread} unread messages`}
            >
              <Bell size={20} />
              {unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}
            </Link>
            <span className={shell.userIcon}>
              <UserRound size={19} />
            </span>
            <div>
              <strong>Admin</strong>
              <small>admin@madxsports.com</small>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.heading}>
            <div>
              <span>WEBSITE INBOX</span>
              <h1>Messages</h1>
              <p>Review inquiries submitted through your website forms.</p>
            </div>
            <div className={styles.summary}>
              <strong>{unread}</strong>
              <span>Unread</span>
              <strong>{total}</strong>
              <span>Matching</span>
            </div>
          </section>

          <section className={styles.filters}>
            <label>
              Source
              <select
                value={source}
                onChange={(event) => setSource(event.target.value)}
              >
                {sources?.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statuses?.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Read state
              <select
                value={readFilter}
                onChange={(event) => setReadFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </label>
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </section>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <section className={styles.inbox}>
            <div className={styles.list}>
              <div className={styles.listHead}>
                <span>Sender</span>
                <span>Source</span>
                <span>Status</span>
                <span>Received</span>
              </div>
              {loading ? (
                <div className={styles.empty}>Loading messages…</div>
              ) : messages.length ? (
                messages?.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => openMessage(item)}
                    className={`${styles.row} ${!item.isRead ? styles.unread : ""} ${selected?._id === item._id ? styles.selected : ""}`}
                  >
                    <span>
                      <i>{!item.isRead && <b />}</i>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.email}</small>
                        <small>{item.message || "No message provided"}</small>
                      </span>
                    </span>
                    <span>{item.source}</span>
                    <span>{item.status}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </button>
                ))
              ) : (
                <div className={styles.empty}>
                  <Mail size={28} />
                  <strong>No messages found</strong>
                  <span>New website submissions will appear here.</span>
                </div>
              )}
            </div>

            <aside
              className={`${styles.detail} ${selected ? styles.detailOpen : ""}`}
            >
              {selected ? (
                <>
                  <div className={styles.detailHead}>
                    <div>
                      <span>{selected.source}</span>
                      <h2>{selected.name}</h2>
                      <a href={`mailto:${selected.email}`}>{selected.email}</a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      aria-label="Close message"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <dl>
                    <div>
                      <dt>Company</dt>
                      <dd>{selected.company || "—"}</dd>
                    </div>
                    <div>
                      <dt>Country</dt>
                      <dd>{selected.country || "—"}</dd>
                    </div>
                    <div>
                      <dt>Product</dt>
                      <dd>{selected.product || "—"}</dd>
                    </div>
                    <div>
                      <dt>Quantity</dt>
                      <dd>{selected.quantity || "—"}</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>{formatDate(selected.createdAt, true)}</dd>
                    </div>
                  </dl>
                  <div className={styles.messageBody}>
                    <span>MESSAGE / REQUIREMENTS</span>
                    <p>{selected.message || "No message was provided."}</p>
                  </div>
                  <label className={styles.statusField}>
                    Status
                    <select
                      value={selected.status}
                      onChange={(event) => updateStatus(event.target.value)}
                    >
                      {statuses.slice(1)?.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <div className={styles.detailActions}>
                    <button type="button" onClick={toggleRead}>
                      {selected.isRead ? "Mark unread" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      className={styles.delete}
                      onClick={deleteMessage}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.detailEmpty}>
                  <MessageSquareText size={30} />
                  <strong>Select a message</strong>
                  <span>Choose a message to read its full contents.</span>
                </div>
              )}
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
