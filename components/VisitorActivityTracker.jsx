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

  useEffect(() => {
    if (pathname !== "/") return;

    const sections = document.querySelectorAll("[data-activity-section]");
    const viewedSections = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = entry.target;
          const label = section.getAttribute("data-activity-section");
          if (!label || viewedSections.has(label)) return;

          viewedSections.add(label);
          sendActivity({
            eventType: "section_view",
            label,
            pagePath: `${window.location.pathname}${window.location.search}`,
            elementId: section.id || "",
          });
        });
      },
      {
        // Count a section when it reaches the central part of the viewport.
        // This also works for sections taller than the viewport.
        rootMargin: "-20% 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
