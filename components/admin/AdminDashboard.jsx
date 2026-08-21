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
import { useState } from "react";
import styles from "./AdminDashboard.module.css";

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  { label: "Analytics", icon: BarChart3, badge: "Soon", href: "#" },
  { label: "Sales CRM", icon: Users, href: "/dashboard/crm" },
  { label: "Messages", icon: MessageSquareText },
  { label: "Photo Editor", icon: ImageIcon, href: "/dashboard/photo-editor" },
  { label: "Image PDF", icon: FileDown, href: "/dashboard/image-pdf" },
];

const stats = [
  {
    label: "Total visitors",
    value: "—",
    note: "Connect Google Analytics",
    icon: Activity,
  },
  {
    label: "Active prospects",
    value: "0",
    note: "No CRM records yet",
    icon: Users,
  },
  {
    label: "Conversion rate",
    value: "—",
    note: "Awaiting analytics data",
    icon: TrendingUp,
  },
  {
    label: "Clients won",
    value: "0",
    note: "No completed deals yet",
    icon: MessageSquareText,
  },
];

export default function AdminDashboard() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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
                {badge && <em>{badge}</em>}
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
            <button aria-label="Notifications">
              <Bell size={20} />
              <i />
            </button>
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
                <h3>Connect Google Analytics</h3>
                <p>
                  Your traffic, acquisition, and audience data will appear here.
                </p>
                <button type="button">
                  Set up analytics <ArrowUpRight size={16} />
                </button>
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
                    <strong>0</strong>
                    <i />
                  </div>
                ))}
              </div>
              <div className={styles.emptyLeads}>
                <Users size={25} />
                <div>
                  <strong>No leads yet</strong>
                  <span>New enquiries will show up in this pipeline.</span>
                </div>
              </div>
            </article>
          </section>
          <section className={`${styles.panel} ${styles.recent}`}>
            <div className={styles.panelHead}>
              <div>
                <h2>Recent leads</h2>
                <p>Your latest website enquiries</p>
              </div>
              <button type="button">
                View all leads <ArrowUpRight size={15} />
              </button>
            </div>
            <div className={styles.tableHead}>
              <span>CONTACT</span>
              <span>SOURCE</span>
              <span>STATUS</span>
              <span>RECEIVED</span>
            </div>
            <div className={styles.tableEmpty}>
              <MessageSquareText size={25} />
              <strong>No leads to display</strong>
              <span>
                Once your forms are connected, submitted leads will appear here.
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
