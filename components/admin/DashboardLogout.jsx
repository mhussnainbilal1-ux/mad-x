"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./DashboardLogout.module.css";

export default function DashboardLogout() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <button
      type="button"
      className={styles.button}
      onClick={signOut}
      disabled={signingOut}
      aria-label={signingOut ? "Signing out" : "Sign out"}
    >
      <LogOut size={17} />
      <span>{signingOut ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
