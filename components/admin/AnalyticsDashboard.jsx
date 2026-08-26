"use client";

import Link from "next/link";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Eye,
  FileDown,
  Gauge,
  Globe2,
  Image as ImageIcon,
  LayoutDashboard,
  KeyRound,
  Menu,
  MessageSquareText,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Timer,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AnalyticsDashboard.module.css";
import shell from "./AdminDashboard.module.css";

const metricNames = [
  "Users",
  "Sessions",
  "Page views",
  "Engagement",
  "Avg. engagement",
];
const conversionLabels = {
  quote_form_submit: "Quote forms submitted",
  contact_form_submit: "Contact forms submitted",
  catalogue_unlock_request: "Catalogue unlocks",
  request_quote_click: "Quote button clicks",
};

function compact(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function percent(value) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function duration(value) {
  const seconds = Math.round(value || 0);
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function comparison(current, previous) {
  if (!previous) return current ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/analytics?days=${days}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to load analytics");
      setReport(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const maxViews = useMemo(
    () => Math.max(...(report?.daily || [])?.map((row) => row.metrics[1]), 1),
    [report],
  );

  const downloadPdf = async () => {
    if (!report?.configured || exporting) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 42;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (height) => {
        if (y + height <= pageHeight - margin) return;
        pdf.addPage();
        y = margin;
      };
      const addSection = (title, headings, rows) => {
        ensureSpace(55);
        pdf.setTextColor(23, 32, 51);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(title, margin, y);
        y += 18;

        const columnWidth = contentWidth / headings.length;
        const drawRow = (cells, header = false) => {
          const wrapped = cells.map((cell) =>
            pdf.splitTextToSize(String(cell ?? ""), columnWidth - 12),
          );
          const rowHeight = Math.max(
            24,
            ...wrapped.map((lines) => lines.length * 11 + 10),
          );
          ensureSpace(rowHeight);
          pdf.setFillColor(
            header ? 239 : 255,
            header ? 242 : 255,
            header ? 246 : 255,
          );
          pdf.rect(margin, y, contentWidth, rowHeight, "F");
          pdf.setDrawColor(226, 231, 238);
          pdf.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);
          pdf.setFont("helvetica", header ? "bold" : "normal");
          pdf.setFontSize(header ? 8 : 9);
          pdf.setTextColor(
            header ? 103 : 75,
            header ? 116 : 88,
            header ? 136 : 108,
          );
          wrapped.forEach((lines, index) =>
            pdf.text(lines, margin + index * columnWidth + 6, y + 15),
          );
          y += rowHeight;
        };

        drawRow(headings, true);
        (rows?.length
          ? rows
          : [["No data for this period.", ...headings.slice(1).map(() => "")]]
        ).forEach((row) => drawRow(row));
        y += 20;
      };

      pdf.setFillColor(224, 30, 47);
      pdf.rect(0, 0, pageWidth, 8, "F");
      pdf.setTextColor(23, 32, 51);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("Website analytics", margin, y + 16);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(104, 117, 138);
      pdf.text(
        `Google Analytics 4 · Last ${days} days · Generated ${new Date().toLocaleString()}`,
        margin,
        y + 35,
      );
      y += 65;

      const overview = report.overview || [];
      addSection(
        "Overview",
        ["Metric", "Current", "Change vs previous"],
        metricNames.map((name, index) => [
          name,
          index === 3
            ? percent(overview[index])
            : index === 4
              ? duration(overview[index])
              : compact(overview[index]),
          comparison(overview[index], report.previous?.[index]),
        ]),
      );
      addSection(
        "Daily traffic",
        ["Date", "Users", "Page views"],
        (report.daily || []).map((row) => [
          row.dimensions[0],
          compact(row.metrics[0]),
          compact(row.metrics[1]),
        ]),
      );
      addSection(
        "Active visitors now",
        ["City", "Country", "Users"],
        (report.realtimeLocations || []).map((row) => [
          row.dimensions[0] || "Not available",
          row.dimensions[1] || "Not available",
          compact(row.metrics[0]),
        ]),
      );
      addSection(
        "Top pages",
        ["Page", "Views", "Users"],
        (report.pages || []).map((row) => [
          row.dimensions[1] || row.dimensions[0],
          compact(row.metrics[0]),
          compact(row.metrics[1]),
        ]),
      );
      addSection(
        "Traffic channels",
        ["Channel", "Sessions", "Users"],
        (report.sources || []).map((row) => [
          row.dimensions[0],
          compact(row.metrics[0]),
          compact(row.metrics[1]),
        ]),
      );
      addSection(
        "Countries",
        ["Country", "Users"],
        (report.countries || []).map((row) => [
          row.dimensions[0],
          compact(row.metrics[0]),
        ]),
      );
      addSection(
        "Cities",
        ["City", "Country", "Users"],
        (report.cities || []).map((row) => [
          row.dimensions[0],
          row.dimensions[1],
          compact(row.metrics[0]),
        ]),
      );
      addSection(
        "Devices",
        ["Device", "Users"],
        (report.devices || []).map((row) => [
          row.dimensions[0],
          compact(row.metrics[0]),
        ]),
      );
      addSection(
        "Conversions",
        ["Action", "Count"],
        (report.events || []).map((row) => [
          conversionLabels[row.dimensions[0]] || row.dimensions[0],
          compact(row.metrics[0]),
        ]),
      );

      const pageCount = pdf.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.setTextColor(137, 147, 162);
        pdf.text(
          `MADX Sports Analytics · Page ${page} of ${pageCount}`,
          margin,
          pageHeight - 18,
        );
      }
      pdf.save(`madx-analytics-${days}-days.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`${shell.adminRoot} admin-dashboard-root`}>
      {mobileOpen && (
        <button
          className={shell.backdrop}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`${shell.sidebar} ${mobileOpen ? shell.sidebarOpen : ""}`}
      >
        <div className={shell.logoRow}>
          <Link href="/dashboard" className={shell.logo}>
            <span>MX</span>
            <div>
              <strong>MADX</strong>
              <small>ADMIN</small>
            </div>
          </Link>
          <button
            className={shell.closeMenu}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className={shell.workspace}>
          <span className={shell.avatar}>MS</span>
          <div>
            <strong>MADX Sports</strong>
            <small>Administrator</small>
          </div>
          <ChevronDown size={16} />
        </div>
        <nav className={shell.nav} aria-label="Admin navigation">
          <p>WORKSPACE</p>
          <Link href="/dashboard">
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </Link>
          <Link href="/dashboard/analytics" className={shell.active}>
            <BarChart3 size={19} />
            <span>Analytics</span>
          </Link>
          <Link href="/dashboard/crm">
            <Users size={19} />
            <span>Sales CRM</span>
          </Link>
          <Link href="/dashboard/messages">
            <MessageSquareText size={19} />
            <span>Messages</span>
          </Link>
          <Link href="/dashboard/catalogue-keys">
            <KeyRound size={19} />
            <span>Access Keys</span>
          </Link>
          <Link href="/dashboard/photo-editor">
            <ImageIcon size={19} />
            <span>Photo Editor</span>
          </Link>
          <Link href="/dashboard/image-pdf">
            <FileDown size={19} />
            <span>Image PDF</span>
          </Link>
        </nav>
        <div className={shell.sidebarBottom}>
          <Link href="/" className={shell.viewSite}>
            View public website
          </Link>
        </div>
      </aside>

      <main className={shell.main}>
        <header className={shell.topbar}>
          <button
            className={shell.menu}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <span className={shell.topbarLabel}>Analytics report</span>
          <div className={shell.topActions} data-dashboard-header-actions>
            <Link href="/dashboard/messages" aria-label="Open messages">
              <Bell size={20} />
            </Link>
            <span className={shell.userIcon}>
              <UserRound size={19} />
            </span>
            <div>
              <strong>Admin</strong>
              <small>admin@madxsports.com</small>
            </div>
          </div>
        </header>
        <div className={styles.main}>
          <header className={styles.header}>
            <div>
              <span>GOOGLE ANALYTICS 4</span>
              <h1>Website analytics</h1>
              <p>
                Traffic, audience, content and conversion performance.{" "}
                {report?.configured
                  ? `Property ${report.propertyId} · ${report.realtimeActiveUsers || 0} active now`
                  : ""}
              </p>
            </div>
            <div className={styles.actions}>
              <label>
                <CalendarDays size={17} />
                <select
                  value={days}
                  onChange={(event) => setDays(Number(event.target.value))}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </label>
              <button
                className={styles.download}
                onClick={downloadPdf}
                disabled={!report?.configured || exporting}
                aria-label="Download analytics PDF"
              >
                <FileDown size={17} />
                <span>{exporting ? "Preparing…" : "Download PDF"}</span>
              </button>
              <button
                onClick={loadReport}
                disabled={loading}
                aria-label="Refresh analytics"
              >
                <RefreshCw size={17} className={loading ? styles.spin : ""} />
              </button>
            </div>
          </header>

          {loading && !report ? (
            <div className={styles.state}>
              <RefreshCw className={styles.spin} />
              <h2>Loading analytics</h2>
            </div>
          ) : null}
          {error ? (
            <div className={styles.state}>
              <Gauge />
              <h2>Analytics unavailable</h2>
              <p>{error}</p>
              <button onClick={loadReport}>Try again</button>
            </div>
          ) : null}
          {!loading && report && !report.configured ? (
            <SetupState missing={report.missing} />
          ) : null}
          {report?.configured && !error ? (
            <>
              <section className={styles.cards}>
                {report?.overview?.map((value, index) => {
                  const display =
                    index === 3
                      ? percent(value)
                      : index === 4
                        ? duration(value)
                        : compact(value);
                  const Icon = [Users, Gauge, Eye, MousePointerClick, Timer][
                    index
                  ];
                  return (
                    <article key={metricNames[index]}>
                      <div>
                        <span>{metricNames[index]}</span>
                        <Icon size={19} />
                      </div>
                      <strong>{display}</strong>
                      <small>
                        {comparison(value, report.previous[index])} vs previous
                        period
                      </small>
                    </article>
                  );
                })}
              </section>

              <section className={styles.chartPanel}>
                <div className={styles.panelTitle}>
                  <div>
                    <h2>Traffic over time</h2>
                    <p>Daily users and page views</p>
                  </div>
                  <span>{days} days</span>
                </div>
                <div className={styles.chart}>
                  {report?.daily?.map((row) => (
                    <div
                      key={row.dimensions[0]}
                      title={`${row.dimensions[0]}: ${row.metrics[1]} views`}
                    >
                      <i
                        style={{
                          height: `${Math.max((row.metrics[1] / maxViews) * 100, 3)}%`,
                        }}
                      />
                      <span>{days <= 7 ? row.dimensions[0].slice(4) : ""}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.grid}>
                <ReportTable
                  title="Active visitors now"
                  icon={Globe2}
                  headings={["City", "Country", "Users"]}
                  rows={(report.realtimeLocations || []).map((row) => [
                    row.dimensions[0] || "Not available",
                    row.dimensions[1] || "Not available",
                    compact(row.metrics[0]),
                  ])}
                  wide
                />
                <ReportTable
                  title="Top pages"
                  icon={Eye}
                  headings={["Page", "Views", "Users"]}
                  rows={report?.pages?.map((row) => [
                    row.dimensions[1] || row.dimensions[0],
                    compact(row.metrics[0]),
                    compact(row.metrics[1]),
                  ])}
                />
                <ReportTable
                  title="Traffic channels"
                  icon={Globe2}
                  headings={["Channel", "Sessions", "Users"]}
                  rows={report.sources?.map((row) => [
                    row.dimensions[0],
                    compact(row.metrics[0]),
                    compact(row.metrics[1]),
                  ])}
                />
                <ReportTable
                  title="Countries"
                  icon={Globe2}
                  headings={["Country", "Users"]}
                  rows={report.countries?.map((row) => [
                    row.dimensions[0],
                    compact(row.metrics[0]),
                  ])}
                />
                <ReportTable
                  title="Cities"
                  icon={Globe2}
                  headings={["City", "Country", "Users"]}
                  rows={(report.cities || []).map((row) => [
                    row.dimensions[0],
                    row.dimensions[1],
                    compact(row.metrics[0]),
                  ])}
                />
                <ReportTable
                  title="Devices"
                  icon={MonitorSmartphone}
                  headings={["Device", "Users"]}
                  rows={report.devices?.map((row) => [
                    row.dimensions[0],
                    compact(row.metrics[0]),
                  ])}
                />
                <ReportTable
                  title="Conversions"
                  icon={MousePointerClick}
                  headings={["Action", "Count"]}
                  rows={report.events?.map((row) => [
                    conversionLabels[row.dimensions[0]] || row.dimensions[0],
                    compact(row.metrics[0]),
                  ])}
                  wide
                />
              </section>
              <p className={styles.updated}>
                Updated {new Date(report.generatedAt).toLocaleString()} ·
                Reports are cached for five minutes.
              </p>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function ReportTable({ title, icon: Icon, headings, rows, wide = false }) {
  return (
    <article className={`${styles.tablePanel} ${wide ? styles.wide : ""}`}>
      <div className={styles.panelTitle}>
        <div>
          <h2>
            <Icon size={18} /> {title}
          </h2>
        </div>
      </div>
      {rows?.length ? (
        <div className={styles.table}>
          <div>
            {headings?.map((heading) => (
              <b key={heading}>{heading}</b>
            ))}
          </div>
          {rows?.map((row, index) => (
            <div key={`${row[0]}-${index}`}>
              {row?.map((cell, cellIndex) => (
                <span key={cellIndex} title={String(cell)}>
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noData}>No data for this period.</p>
      )}
    </article>
  );
}

function SetupState({ missing }) {
  return (
    <div className={styles.setup}>
      <BarChart3 size={34} />
      <h2>Connect Google Analytics</h2>
      <p>
        Add the credentials listed in <code>.env.example</code> to your
        deployment environment. The report will activate automatically.
      </p>
      <small>Missing server configuration: {(missing || []).join(", ")}</small>
    </div>
  );
}
