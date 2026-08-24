"use client";

import { useEffect } from "react";

export default function DashboardBodyClass() {
  useEffect(() => {
    document.body.classList.add("dashboard-active");
    return () => document.body.classList.remove("dashboard-active");
  }, []);
  return null;
}
