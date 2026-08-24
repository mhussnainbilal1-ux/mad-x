"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function isExcludedRoute(pathname) {
  return pathname.startsWith("/dashboard") || pathname === "/login";
}

function AnalyticsNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPath = useRef(null);

  useEffect(() => {
    if (!measurementId || isExcludedRoute(pathname)) return;

    function sendPageView() {
      if (typeof window.gtag !== "function") return;
      const query = searchParams.toString();
      const pagePath = `${pathname}${query ? `?${query}` : ""}`;
      if (previousPath.current === pagePath) return;
      previousPath.current = pagePath;

      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });

      if (/^\/products\/[^/]+$/.test(pathname)) {
        trackEvent("view_product", { product_slug: pathname.split("/").pop() });
      }
    }

    sendPageView();
    window.addEventListener("ga4-ready", sendPageView);
    return () => window.removeEventListener("ga4-ready", sendPageView);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isExcludedRoute(pathname)) return;

    function trackBusinessClick(event) {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";

      if (href.startsWith("/quote")) trackEvent("request_quote_click");
      else if (href.startsWith("mailto:")) trackEvent("email_click");
      else if (href.startsWith("tel:") || href.includes("wa.me"))
        trackEvent("whatsapp_click");
    }

    document.addEventListener("click", trackBusinessClick);
    return () => document.removeEventListener("click", trackBusinessClick);
  }, [pathname]);

  return null;
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathname);

  useEffect(() => {
    if (!measurementId) return;
    window[`ga-disable-${measurementId}`] = excluded;
  }, [excluded]);

  if (!measurementId || excluded) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-configuration" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:false});window.dispatchEvent(new Event('ga4-ready'));`}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsNavigation />
      </Suspense>
    </>
  );
}
