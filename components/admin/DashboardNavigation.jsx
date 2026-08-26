"use client";

import Link from "next/link";
import {
  BarChart3,
  FileDown,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  MousePointerClick,
  Users,
} from "lucide-react";
import shell from "./AdminDashboard.module.css";

const dashboardLinks = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Analytics", "/dashboard/analytics", BarChart3],
  ["Visitor Activity", "/dashboard/activity", MousePointerClick],
  ["Sales CRM", "/dashboard/crm", Users],
  ["Messages", "/dashboard/messages", MessageSquareText],
  ["Access Keys", "/dashboard/catalogue-keys", KeyRound],
  ["Photo Editor", "/dashboard/photo-editor", ImageIcon],
  ["Image PDF", "/dashboard/image-pdf", FileDown],
];

export default function DashboardNavigation({
  activeHref,
  unreadMessages = 0,
  crmCount,
}) {
  return (
    <nav className={shell.nav} aria-label="Admin navigation">
      <p>WORKSPACE</p>
      {dashboardLinks.map(([label, href, Icon]) => {
        const badge =
          label === "Messages" && unreadMessages > 0
            ? unreadMessages
            : label === "Sales CRM" && crmCount !== undefined
              ? crmCount
              : null;
        return (
          <Link
            href={href}
            className={activeHref === href ? shell.active : ""}
            key={href}
          >
            <Icon size={19} />
            <span>{label}</span>
            {badge !== null && <em>{badge > 99 ? "99+" : badge}</em>}
          </Link>
        );
      })}
    </nav>
  );
}
