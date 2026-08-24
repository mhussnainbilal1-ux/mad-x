"use client";

import Link from "next/link";
import { BarChart3, Bell, ChevronDown, FileDown, Image as ImageIcon, KeyRound, LayoutDashboard, Menu, MessageSquareText, UserRound, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import shell from "./AdminDashboard.module.css";

const links = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Analytics", "/dashboard/analytics", BarChart3],
  ["Sales CRM", "/dashboard/crm", Users],
  ["Messages", "/dashboard/messages", MessageSquareText],
  ["Access Keys", "/dashboard/catalogue-keys", KeyRound],
  ["Photo Editor", "/dashboard/photo-editor", ImageIcon],
  ["Image PDF", "/dashboard/image-pdf", FileDown],
];

export default function DashboardToolShell({ activeHref, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/admin/messages?countOnly=true", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => setUnread(result?.unread || 0))
      .catch(() => {});
  }, []);

  return <div className={`${shell.adminRoot} admin-dashboard-root`}>
    {mobileOpen && <button className={shell.backdrop} onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <aside className={`${shell.sidebar} ${mobileOpen ? shell.sidebarOpen : ""}`}>
      <div className={shell.logoRow}><Link href="/dashboard" className={shell.logo}><span>MX</span><div><strong>MADX</strong><small>ADMIN</small></div></Link><button className={shell.closeMenu} onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className={shell.workspace}><span className={shell.avatar}>MS</span><div><strong>MADX Sports</strong><small>Administrator</small></div><ChevronDown size={16} /></div>
      <nav className={shell.nav} aria-label="Admin navigation"><p>WORKSPACE</p>{links.map(([label, href, Icon]) => <Link href={href} className={activeHref === href ? shell.active : ""} key={href}><Icon size={19} /><span>{label}</span>{label === "Messages" && unread > 0 && <em>{unread}</em>}</Link>)}</nav>
      <div className={shell.sidebarBottom}><Link href="/" className={shell.viewSite}>View public website</Link></div>
    </aside>
    <main className={shell.main}>
      <header className={shell.topbar}><button className={shell.menu} onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button><span className={shell.topbarLabel}>Dashboard tools</span><div className={shell.topActions} data-dashboard-header-actions><Link href="/dashboard/messages" aria-label={`${unread} unread messages`}><Bell size={20} />{unread > 0 && <em className={shell.notificationCount}>{unread > 99 ? "99+" : unread}</em>}</Link><span className={shell.userIcon}><UserRound size={19} /></span><div><strong>Admin</strong><small>admin@madxsports.com</small></div></div></header>
      {children}
    </main>
  </div>;
}
