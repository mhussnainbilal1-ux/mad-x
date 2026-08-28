"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  FileDown,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import DashboardNavigation from "./DashboardNavigation";
import ReminderPanel from "./ReminderPanel";

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Sales CRM", icon: Users, href: "/dashboard/crm" },
  { label: "Messages", icon: MessageSquareText, href: "/dashboard/messages" },
  { label: "Access Keys", icon: KeyRound, href: "/dashboard/catalogue-keys" },
  { label: "Photo Editor", icon: ImageIcon, href: "/dashboard/photo-editor" },
  { label: "Image PDF", icon: FileDown, href: "/dashboard/image-pdf" },
];

export default function AdminDashboard() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [crmSummary, setCrmSummary] = useState(null);
  const [messageSummary, setMessageSummary] = useState({
    configured: null,
    messages: [],
    total: 0,
    unread: 0,
  });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/analytics?days=30", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setAnalytics(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/clients?summary=true", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load leads");
        return response.json();
      })
      .then((result) => {
        if (!cancelled) setCrmSummary(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/messages?limit=5", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load messages");
        return response.json();
      })
      .then((result) => {
        if (!cancelled && result.configured) {
          setMessageSummary({
            configured: true,
            messages: result.messages || [],
            total: result.total || 0,
            unread: result.unread || 0,
          });
        } else if (!cancelled) {
          setMessageSummary((current) => ({ ...current, configured: false }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      label: "Analytics",
      value:
        analytics?.configured && !analytics.error
          ? new Intl.NumberFormat("en", { notation: "compact" }).format(
              analytics.overview?.[0] || 0,
            )
          : "—",
      note:
        analytics?.configured && !analytics.error
          ? `${analytics.overview?.[1] || 0} sessions · last 30 days`
          : "GA4 report is unavailable",
      icon: Activity,
      href: "/dashboard/analytics",
    },
    {
      label: "Sales CRM",
      value: crmSummary?.configured ? String(crmSummary.active || 0) : "—",
      note: crmSummary?.configured
        ? `${crmSummary.total || 0} records · ${crmSummary.won || 0} won`
        : "CRM database is not connected",
      icon: Users,
      href: "/dashboard/crm",
    },
    {
      label: "Messages",
      value: messageSummary.configured ? String(messageSummary.unread) : "—",
      note: messageSummary.configured
        ? `${messageSummary.total} total inquiries`
        : "Message database is not connected",
      icon: TrendingUp,
      href: "/dashboard/messages",
    },
  ];
  const pipelineCounts = {
    Identified: crmSummary?.stages?.["Target Identified"] || 0,
    Contacted: crmSummary?.stages?.Contacted || 0,
    Qualified: crmSummary?.stages?.Qualified || 0,
    Won: crmSummary?.won || 0,
  };
  const recentMessages = messageSummary.messages;
  return (
    <div className={`${styles.adminRoot} admin-dashboard-root`}>
      {mobileOpen && (
        <button
          className={styles.backdrop}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.logoRow}>
          <Link href="/dashboard" className={styles.logo}>
            <span>MX</span>
            <div>
              <strong>MADX</strong>
              <small>ADMIN</small>
            </div>
          </Link>
          <button
            className={styles.closeMenu}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.workspace}>
          <span className={styles.avatar}>MS</span>
          <div>
            <strong>MADX Sports</strong>
            <small>Administrator</small>
          </div>
          <ChevronDown size={16} />
        </div>
        <DashboardNavigation
          activeHref={pathname}
          unreadMessages={messageSummary.unread}
          crmCount={crmSummary?.total}
        />
        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.viewSite}>
            View public website <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menu}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <span className={styles.topbarLabel}>Dashboard overview</span>
          <div className={styles.topActions} data-dashboard-header-actions>
            <Link
              href="/dashboard/messages"
              aria-label={`${messageSummary.unread} unread messages`}
            >
              <Bell size={20} />
              {messageSummary.unread > 0 && (
                <em className={styles.notificationCount}>
                  {messageSummary.unread > 99 ? "99+" : messageSummary.unread}
                </em>
              )}
            </Link>
            <span className={styles.userIcon}>
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
              <span>OVERVIEW</span>
              <h1>Good morning, Admin</h1>
              <p>Here’s what’s happening with your website today.</p>
            </div>
            <span className={styles.liveLabel}>Live operational data</span>
          </section>
          <section className={styles.stats}>
            {stats?.map(({ label, value, note, icon: Icon, href }) => (
              <Link href={href} key={label}>
                <div className={styles.statTop}>
                  <span>{label}</span>
                  <i>
                    <Icon size={19} />
                  </i>
                </div>
                <strong>{value}</strong>
                <small>{note}</small>
                <ArrowUpRight className={styles.cardArrow} size={15} />
              </Link>
            ))}
          </section>
          <section className={styles.grid}>
            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <h2>Website traffic</h2>
                  <p>Visitors and page views over time</p>
                </div>
                <span>GA4</span>
              </div>
              {analytics?.configured && !analytics.error ? (
                <div className={styles.trafficChart}>
                  {(analytics.daily || []).map((row) => {
                    const maximum = Math.max(
                      ...analytics.daily.map((item) => item.metrics[1]),
                      1,
                    );
                    return (
                      <i
                        key={row.dimensions[0]}
                        style={{
                          height: `${Math.max((row.metrics[1] / maximum) * 100, 3)}%`,
                        }}
                        title={`${row.dimensions[0]}: ${row.metrics[1]} page views`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={styles.serviceState}>
                  <BarChart3 size={27} />
                  <strong>GA4 report unavailable</strong>
                  <span>
                    Open Analytics to finish setup or review the connection.
                  </span>
                  <Link href="/dashboard/analytics">
                    Open analytics <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </article>
            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <h2>Lead pipeline</h2>
                  <p>Current leads by stage</p>
                </div>
                <Link href="/dashboard/crm">
                  View CRM <ArrowUpRight size={14} />
                </Link>
              </div>
              {crmSummary?.configured ? (
                <div className={styles.pipeline}>
                  {Object.keys(pipelineCounts).map((stage) => (
                    <div key={stage}>
                      <span>{stage}</span>
                      <strong>{pipelineCounts[stage]}</strong>
                      <i />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.serviceState}>
                  <Users size={27} />
                  <strong>CRM report unavailable</strong>
                  <span>Connect MongoDB to show the live sales pipeline.</span>
                  <Link href="/dashboard/crm">
                    Open CRM <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
              {crmSummary?.configured && !crmSummary.total && (
                <div className={styles.emptyLeads}>
                  <Users size={25} />
                  <div>
                    <strong>No leads yet</strong>
                    <span>New enquiries will show up in this pipeline.</span>
                  </div>
                </div>
              )}
            </article>
          </section>
          <ReminderPanel />
          <section className={`${styles.panel} ${styles.recent}`}>
            <div className={styles.panelHead}>
              <div>
                <h2>Recent messages</h2>
                <p>Your latest website form submissions</p>
              </div>
              <Link href="/dashboard/messages">
                View all messages <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className={styles.tableHead}>
              <span>CONTACT</span>
              <span>SOURCE</span>
              <span>STATUS</span>
              <span>RECEIVED</span>
            </div>
            {recentMessages.length ? (
              <div className={styles.recentRows}>
                {recentMessages?.map((message) => (
                  <Link href="/dashboard/messages" key={message._id}>
                    <span>
                      <strong>{message.name || "Unnamed contact"}</strong>
                      <small>{message.email || message.company || "—"}</small>
                    </span>
                    <span>{message.source}</span>
                    <span>{message.status}</span>
                    <span>
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.tableEmpty}>
                <MessageSquareText size={25} />
                <strong>
                  {messageSummary.configured === null
                    ? "Loading messages…"
                    : messageSummary.configured
                      ? "No messages yet"
                      : "Messages unavailable"}
                </strong>
                <span>
                  {messageSummary.configured
                    ? "New website inquiries will appear here."
                    : "Connect MongoDB to load website inquiries."}
                </span>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
