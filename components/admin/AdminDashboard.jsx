"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileDown,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Sales CRM", icon: Users, href: "/dashboard/crm" },
  { label: "Messages", icon: MessageSquareText, href: "/dashboard/messages" },
  { label: "Photo Editor", icon: ImageIcon, href: "/dashboard/photo-editor" },
  { label: "Image PDF", icon: FileDown, href: "/dashboard/image-pdf" },
];

export default function AdminDashboard() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [messageSummary, setMessageSummary] = useState({
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
    fetch("/api/admin/clients?limit=100")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load leads");
        return response.json();
      })
      .then((result) => {
        if (!cancelled && result.configured) setLeads(result.clients || []);
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
            messages: result.messages || [],
            total: result.total || 0,
            unread: result.unread || 0,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const activeProspects = leads.filter(
    (lead) => !["Won", "Lost"].includes(lead.status),
  ).length;
  const won = leads.filter((lead) => lead.status === "Won").length;
  const stats = [
    {
      label: "Total visitors",
      value: analytics?.configured
        ? new Intl.NumberFormat("en", { notation: "compact" }).format(analytics.overview?.[0] || 0)
        : "—",
      note: analytics?.configured ? "Last 30 days from GA4" : "Connect Google Analytics",
      icon: Activity,
    },
    {
      label: "Active prospects",
      value: String(activeProspects),
      note: `${leads.length} total CRM records`,
      icon: Users,
    },
    {
      label: "Website inquiries",
      value: String(messageSummary.total),
      note: `${messageSummary.unread} unread messages`,
      icon: TrendingUp,
    },
    {
      label: "Clients won",
      value: String(won),
      note: "Completed deals",
      icon: MessageSquareText,
    },
  ];
  const pipelineCounts = {
    New: leads.filter((lead) => lead.status === "Target Identified").length,
    Contacted: leads.filter((lead) => lead.status === "Contacted").length,
    Qualified: leads.filter((lead) => lead.status === "Qualified").length,
    Won: won,
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
        <nav className={styles.nav} aria-label="Admin navigation">
          <p>WORKSPACE</p>
          {navigation.map(({ label, icon: Icon, badge, href }) =>
            href ? (
              <Link
                href={href}
                className={pathname === href ? styles.active : ""}
                key={label}
              >
                <Icon size={19} />
                <span>{label}</span>
                {label === "Messages" && messageSummary.unread > 0 ? (
                  <em>{messageSummary.unread}</em>
                ) : (
                  badge && <em>{badge}</em>
                )}
              </Link>
            ) : (
              <button key={label} type="button">
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ),
          )}
          <p>MANAGE</p>
          <button type="button">
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <button type="button">
            <CircleHelp size={19} />
            <span>Help & support</span>
          </button>
        </nav>
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
          <label className={styles.search}>
            <Search size={18} />
            <input placeholder="Search dashboard..." />
          </label>
          <div className={styles.topActions}>
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
            <button type="button">
              <Clock3 size={17} /> Last 30 days <ChevronDown size={16} />
            </button>
          </section>
          <section className={styles.stats}>
            {stats.map(({ label, value, note, icon: Icon }) => (
              <article key={label}>
                <div className={styles.statTop}>
                  <span>{label}</span>
                  <i>
                    <Icon size={19} />
                  </i>
                </div>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
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
              <div className={styles.emptyChart}>
                <div className={styles.chartIcon}>
                  <BarChart3 size={30} />
                </div>
                <h3>{analytics?.configured ? "Analytics is connected" : "Connect Google Analytics"}</h3>
                <p>
                  {analytics?.configured
                    ? `${new Intl.NumberFormat("en").format(analytics.overview?.[2] || 0)} page views recorded in the last 30 days.`
                    : "Your traffic, acquisition, and audience data will appear here."}
                </p>
                <Link href="/dashboard/analytics">
                  {analytics?.configured ? "Open analytics report" : "Set up analytics"} <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
            <article className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <h2>Lead pipeline</h2>
                  <p>Current leads by stage</p>
                </div>
                <button type="button">View all</button>
              </div>
              <div className={styles.pipeline}>
                {["New", "Contacted", "Qualified", "Won"].map((stage) => (
                  <div key={stage}>
                    <span>{stage}</span>
                    <strong>{pipelineCounts[stage]}</strong>
                    <i />
                  </div>
                ))}
              </div>
              {!leads.length && (
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
                {recentMessages.map((message) => (
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
                <strong>No messages to display</strong>
                <span>New website inquiries will appear here.</span>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
