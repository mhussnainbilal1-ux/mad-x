"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function visitorId() {
  const key = "madx_foreign_visitor_id";
  let value = window.sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    window.sessionStorage.setItem(key, value);
  }
  return value;
}

function sendActivity(activity) {
  fetch("/api/visitor-activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...activity, visitorId: visitorId() }),
    keepalive: true,
  }).catch(() => {});
}

function elementLabel(element) {
  return String(
    element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.textContent ||
      element.value ||
      element.id ||
      element.tagName,
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function ActivityListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPage = useRef("");

  useEffect(() => {
    if (pathname.startsWith("/dashboard") || pathname === "/login") return;
    const query = searchParams.toString();
    const pagePath = `${pathname}${query ? `?${query}` : ""}`;
    if (previousPage.current === pagePath) return;
    previousPage.current = pagePath;
    sendActivity({ eventType: "page_view", label: document.title, pagePath });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname.startsWith("/dashboard") || pathname === "/login") return;

    function onClick(event) {
      const element = event.target.closest("a[href], button, [role='button']");
      if (!element || element.closest("[data-no-activity-tracking]")) return;
      const link = element.matches("a[href]") ? element : null;
      const explicitEventType = element.getAttribute("data-activity-event");
      sendActivity({
        eventType: explicitEventType || (link ? "link_click" : "button_click"),
        label: elementLabel(element),
        pagePath: `${window.location.pathname}${window.location.search}`,
        destination: link?.href || "",
        elementId: element.id || "",
      });
    }

    function onSubmit(event) {
      const form = event.target;
      sendActivity({
        eventType: "form_submit",
        label:
          form.getAttribute("aria-label") ||
          form.id ||
          form.getAttribute("action") ||
          "Form",
        pagePath: `${window.location.pathname}${window.location.search}`,
        destination: form.getAttribute("action") || "",
        elementId: form.id || "",
      });
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [pathname]);

  return null;
}

export default function VisitorActivityTracker() {
  return (
    <Suspense fallback={null}>
      <ActivityListener />
    </Suspense>
  );
}
