"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./DashboardLogout.module.css";

export default function DashboardLogout() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [headerActions, setHeaderActions] = useState(null);

  useEffect(() => {
    function findHeaderActions() {
      setHeaderActions(document.querySelector("[data-dashboard-header-actions]"));
    }

    findHeaderActions();
    const observer = new MutationObserver(findHeaderActions);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const button = (
    <button
      type="button"
      className={`${styles.button} ${headerActions ? "" : styles.fallback}`}
      data-dashboard-logout
      onClick={signOut}
      disabled={signingOut}
      aria-label={signingOut ? "Signing out" : "Sign out"}
    >
      <LogOut size={17} />
      <span>{signingOut ? "Signing out…" : "Sign out"}</span>
    </button>
  );

  return headerActions ? createPortal(button, headerActions) : button;
}
