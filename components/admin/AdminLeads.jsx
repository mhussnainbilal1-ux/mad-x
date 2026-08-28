"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  ChevronDown,
  Check,
  ClipboardCopy,
  Download,
  Edit3,
  LayoutDashboard,
  KeyRound,
  Mail,
  Maximize2,
  Menu,
  MessageSquareText,
  Minimize2,
  Phone,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import shell from "./AdminDashboard.module.css";
import styles from "./AdminLeads.module.css";
import tableStyles from "./AdminResearchTable.module.css";
import DashboardNavigation from "./DashboardNavigation";

const stages = [
  "All",
  "Target Identified",
  "Outreach Planned",
  "Contacted",
  "Responded",
  "Qualified",
  "Samples / Quote Sent",
  "Negotiation",
  "Won",
  "Lost",
];
const stageDescriptions = {
  "Target Identified": "Company researched and added",
  "Outreach Planned": "Contact and message prepared",
  Contacted: "First email, call, or LinkedIn message sent",
  Responded: "Company replied",
  Qualified: "Genuine need, suitable quantity, budget, and timeline",
  "Samples / Quote Sent": "Pricing, catalogue, proposal, or samples provided",
  Negotiation: "Discussing price, MOQ, customization, payment, or delivery",
  Won: "Order confirmed",
  Lost: "Opportunity closed without an order",
};
const csvColumns = [
  "Company",
  "Region",
  "Business Type",
  "Named Public Contact",
  "Public Contact Role",
  "Best Decision-Maker to Target",
  "Contact Quality",
  "Why It Fits",
  "Research Source",
];
const supportedImportColumns = [
  ...csvColumns,
  "Last Contacted",
  "Source",
  "Notes",
];

function parseCsv(text) {
  const rows = [];
  let row = [],
    value = "",
    quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += character;
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function getFollowUpBucket(lead) {
  if (lead.status === "Lost") return "excluded";
  if (!lead.nextFollowUp) return "missing";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpDate = new Date(`${lead.nextFollowUp}T00:00:00`);
  if (Number.isNaN(followUpDate.getTime())) return "missing";
  if (followUpDate < today) return "overdue";
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + ((7 - today.getDay()) % 7));
  if (followUpDate <= endOfWeek) return "thisWeek";
  return "future";
}

function normalizePipelineStage(status) {
  if (status === "Prospect") return "Target Identified";
  if (status === "Proposal") return "Samples / Quote Sent";
  return stages.includes(status) && status !== "All"
    ? status
    : "Target Identified";
}

export default function AdminLeads({ initialLeads }) {
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState("table");
  const [selected, setSelected] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tableMaximized, setTableMaximized] = useState(false);
  const [qualityFilter, setQualityFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [starredFilter, setStarredFilter] = useState("All");
  const [pakistanFlagFilter, setPakistanFlagFilter] = useState("All");
  const [followUpFilter, setFollowUpFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(5);
  const [importReport, setImportReport] = useState(null);
  const [columnsCopied, setColumnsCopied] = useState(false);
  const [copiedCompanyId, setCopiedCompanyId] = useState(null);
  const [copiedReferralId, setCopiedReferralId] = useState(null);
  const [dataMode, setDataMode] = useState("checking");
  const [stageTooltip, setStageTooltip] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const fileInput = useRef(null);
  const tableScroll = useRef(null);
  const loadSentinel = useRef(null);

  useEffect(() => {
    if (!tableMaximized) return undefined;

    function closeMaximizedTable(event) {
      if (event.key === "Escape") setTableMaximized(false);
    }

    document.addEventListener("keydown", closeMaximizedTable);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeMaximizedTable);
      document.body.style.overflow = previousOverflow;
    };
  }, [tableMaximized]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/messages?countOnly=true", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (!cancelled && result) setUnreadMessages(result.unread || 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadClients() {
      try {
        let page = 1;
        let allClients = [];
        let configured = false;
        let hasMore = true;
        while (hasMore) {
          const response = await fetch(
            `/api/admin/clients?page=${page}&limit=100`,
          );
          if (!response.ok) throw new Error("Database unavailable");
          const result = await response.json();
          configured = result.configured;
          if (!configured) break;
          allClients = [
            ...allClients,
            ...result.clients?.map((client) => ({
              ...client,
              status: normalizePipelineStage(client.status),
            })),
          ];
          hasMore = result.hasMore;
          page += 1;
        }
        if (cancelled) return;
        if (configured) {
          setLeads(allClients);
          setDataMode("mongodb");
        } else {
          const saved = window.localStorage.getItem("madx-crm-clients-v3");
          if (saved)
            setLeads(
              JSON.parse(saved)?.map((client) => ({
                ...client,
                status: normalizePipelineStage(client.status),
              })),
            );
          setDataMode("local");
        }
      } catch {
        if (cancelled) return;
        const saved = window.localStorage.getItem("madx-crm-clients-v3");
        if (saved)
          setLeads(
            JSON.parse(saved)?.map((client) => ({
              ...client,
              status: normalizePipelineStage(client.status),
            })),
          );
        setDataMode("local");
      }
    }
    loadClients();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (dataMode === "local")
      window.localStorage.setItem("madx-crm-clients-v3", JSON.stringify(leads));
  }, [leads, dataMode]);

  const filtered = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesText =
          `${lead.company} ${lead.country} ${lead.businessType} ${lead.name} ${lead.publicContactRole} ${lead.decisionMaker} ${lead.researchSource} ${lead.source} ${lead.message}`
            .toLowerCase()
            .includes(query.toLowerCase());
        return (
          matchesText &&
          (status === "All" || lead.status === status) &&
          (qualityFilter === "All" || lead.contactQuality === qualityFilter) &&
          (regionFilter === "All" || lead.country === regionFilter) &&
          (typeFilter === "All" || lead.businessType === typeFilter) &&
          (sourceFilter === "All" || lead.source === sourceFilter) &&
          (starredFilter === "All" ||
            (starredFilter === "Starred"
              ? Boolean(lead.starred)
              : !lead.starred)) &&
          (pakistanFlagFilter === "All" ||
            (pakistanFlagFilter === "Flagged"
              ? Boolean(lead.pakistanFlagged)
              : !lead.pakistanFlagged)) &&
          (followUpFilter === "All" ||
            getFollowUpBucket(lead) === followUpFilter)
        );
      }),
    [
      leads,
      query,
      status,
      qualityFilter,
      regionFilter,
      typeFilter,
      sourceFilter,
      starredFilter,
      pakistanFlagFilter,
      followUpFilter,
    ],
  );

  const regions = useMemo(
    () =>
      [...new Set(leads?.map((lead) => lead.country).filter(Boolean))].sort(),
    [leads],
  );
  const businessTypes = useMemo(
    () =>
      [
        ...new Set(leads?.map((lead) => lead.businessType).filter(Boolean)),
      ].sort(),
    [leads],
  );
  const sources = useMemo(
    () =>
      [...new Set(leads?.map((lead) => lead.source).filter(Boolean))].sort(),
    [leads],
  );

  const followUpStats = useMemo(() => {
    return leads.reduce(
      (counts, lead) => {
        const bucket = getFollowUpBucket(lead);
        if (bucket === "missing") counts.missing += 1;
        if (bucket === "overdue") counts.overdue += 1;
        if (bucket === "thisWeek") counts.thisWeek += 1;
        return counts;
      },
      { thisWeek: 0, overdue: 0, missing: 0 },
    );
  }, [leads]);

  useEffect(
    () => setVisibleCount(5),
    [
      query,
      status,
      qualityFilter,
      regionFilter,
      typeFilter,
      sourceFilter,
      starredFilter,
      pakistanFlagFilter,
      followUpFilter,
    ],
  );

  useEffect(() => {
    const sentinel = loadSentinel.current;
    const root = tableScroll.current;
    if (
      !sentinel ||
      !root ||
      view !== "table" ||
      visibleCount >= filtered.length
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setVisibleCount((count) => Math.min(count + 5, filtered.length));
      },
      { root, rootMargin: "100px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount, view]);

  function handleTableScroll(event) {
    const element = event.currentTarget;
    const nearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    if (nearBottom && visibleCount < filtered.length) {
      setVisibleCount((count) => Math.min(count + 5, filtered.length));
    }
  }

  async function updateStatus(id, nextStatus) {
    const previous = leads.find((lead) => lead.id === id);
    setLeads((items) =>
      items?.map((lead) =>
        lead.id === id ? { ...lead, status: nextStatus } : lead,
      ),
    );
    setSelected((lead) =>
      lead?.id === id ? { ...lead, status: nextStatus } : lead,
    );
    if (dataMode === "mongodb") {
      const response = await fetch(
        `/api/admin/clients/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      if (!response.ok) {
        setLeads((items) =>
          items?.map((lead) => (lead.id === id ? previous : lead)),
        );
        setSelected(previous);
        setImportReport({
          success: false,
          message: "Unable to update the winning stage.",
        });
      }
    }
  }

  async function toggleStar(event, client) {
    event.stopPropagation();
    const starred = !client.starred;
    setLeads((items) =>
      items?.map((item) =>
        item.id === client.id ? { ...item, starred } : item,
      ),
    );
    if (selected?.id === client.id)
      setSelected((current) => ({ ...current, starred }));
    if (dataMode === "mongodb") {
      const response = await fetch(
        `/api/admin/clients/${encodeURIComponent(client.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ starred }),
        },
      );
      if (!response.ok) {
        setLeads((items) =>
          items?.map((item) =>
            item.id === client.id ? { ...item, starred: client.starred } : item,
          ),
        );
        setImportReport({
          success: false,
          message: "Unable to update the starred status.",
        });
      }
    }
  }

  async function togglePakistanFlag(event, client) {
    event.stopPropagation();
    const pakistanFlagged = !client.pakistanFlagged;
    setLeads((items) =>
      items?.map((item) =>
        item.id === client.id ? { ...item, pakistanFlagged } : item,
      ),
    );
    if (selected?.id === client.id)
      setSelected((current) => ({ ...current, pakistanFlagged }));
    if (dataMode === "mongodb") {
      const response = await fetch(
        `/api/admin/clients/${encodeURIComponent(client.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pakistanFlagged }),
        },
      );
      if (!response.ok) {
        setLeads((items) =>
          items?.map((item) =>
            item.id === client.id
              ? { ...item, pakistanFlagged: client.pakistanFlagged }
              : item,
          ),
        );
        if (selected?.id === client.id)
          setSelected((current) => ({
            ...current,
            pakistanFlagged: client.pakistanFlagged,
          }));
        setImportReport({
          success: false,
          message: "Unable to update the Pakistan flag.",
        });
      }
    }
  }

  function exportCsv() {
    const headers = [
      "Company",
      "Region",
      "Business Type",
      "Named Public Contact",
      "Public Contact Role",
      "Best Decision-Maker to Target",
      "Contact Quality",
      "Why It Fits",
      "Research Source",
    ];
    const rows = filtered?.map((lead) => [
      lead.company,
      lead.country,
      lead.businessType,
      lead.name,
      lead.publicContactRole,
      lead.decisionMaker,
      lead.contactQuality,
      lead.message,
      lead.researchSource,
    ]);
    const csv = [headers, ...rows]
      ?.map((row) =>
        row?.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "madx-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyColumns() {
    const columnText = csvColumns.join("\t");
    try {
      await navigator.clipboard.writeText(columnText);
      setColumnsCopied(true);
      window.setTimeout(() => setColumnsCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = columnText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      setColumnsCopied(true);
      window.setTimeout(() => setColumnsCopied(false), 2000);
    }
  }

  async function copyCompany(event, lead) {
    event.stopPropagation();
    const company = String(lead.company || "").trim();
    if (!company) return;
    try {
      await navigator.clipboard.writeText(company);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = company;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopiedCompanyId(lead.id);
    window.setTimeout(
      () =>
        setCopiedCompanyId((current) => (current === lead.id ? null : current)),
      1600,
    );
  }

  async function copyReferralLink(event, lead) {
    event.stopPropagation();
    if (!lead.referralKey) return;
    const referralUrl = `https://www.madxsports.com/ref-${lead.referralKey}`;
    try {
      await navigator.clipboard.writeText(referralUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = referralUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopiedReferralId(lead.id);
    window.setTimeout(
      () =>
        setCopiedReferralId((current) =>
          current === lead.id ? null : current,
        ),
      1600,
    );
  }

  async function saveClient(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const recordId =
      values.id.trim() || `CL-${Date.now().toString().slice(-6)}`;
    const duplicateId = leads.some(
      (item) => item.id === recordId && item.id !== editing?.id,
    );
    if (duplicateId) {
      setImportReport({
        success: false,
        message: `Record ID ${recordId} is already in use. Choose a unique ID.`,
      });
      return;
    }
    const client = {
      ...values,
      id: recordId,
      dealValue: Number(values.dealValue || 0),
      receivedAt: values.receivedAt
        ? new Date(values.receivedAt).toISOString()
        : new Date().toISOString(),
      owner: values.owner || "Unassigned",
      priority: values.priority || "Medium",
      product: values.product || "",
      nextFollowUp: values.nextFollowUp || "",
      status: values.status || editing?.status || "Target Identified",
    };
    let savedClient = client;
    if (dataMode === "mongodb") {
      const endpoint = editing
        ? `/api/admin/clients/${encodeURIComponent(editing.id)}`
        : "/api/admin/clients";
      const response = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      });
      const result = await response.json();
      if (!response.ok) {
        setImportReport({
          success: false,
          message: result.error || "Unable to save this client.",
        });
        return;
      }
      savedClient = result.client;
    }
    setLeads((items) =>
      editing
        ? items?.map((item) => (item.id === editing.id ? savedClient : item))
        : [savedClient, ...items],
    );
    if (selected?.id === editing?.id) setSelected(savedClient);
    setAdding(false);
    setEditing(null);
    setImportReport({
      success: true,
      message: editing ? "Client record updated." : "Client record added.",
    });
  }

  async function saveDrawerNotes() {
    if (dataMode === "mongodb") {
      const response = await fetch(
        `/api/admin/clients/${encodeURIComponent(selected.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: selected.notes || "" }),
        },
      );
      if (!response.ok) {
        setImportReport({ success: false, message: "Unable to update notes." });
        return;
      }
    }
    setLeads((items) =>
      items?.map((item) => (item.id === selected.id ? selected : item)),
    );
    setImportReport({ success: true, message: "Notes updated." });
  }

  function clearFilters() {
    setQuery("");
    setStatus("All");
    setQualityFilter("All");
    setRegionFilter("All");
    setTypeFilter("All");
    setSourceFilter("All");
    setStarredFilter("All");
    setPakistanFlagFilter("All");
    setFollowUpFilter("All");
  }

  function showStageTooltip(event, stage) {
    const description = stageDescriptions[stage];
    if (!description) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const safeX = Math.min(
      Math.max(bounds.left + bounds.width / 2, 160),
      window.innerWidth - 160,
    );
    setStageTooltip({
      stage,
      description,
      left: safeX,
      top: Math.min(bounds.bottom + 9, window.innerHeight - 100),
    });
  }

  async function importCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let rows;
      if (extension === "xlsx" || extension === "xls") {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet)
          throw new Error("The Excel workbook does not contain a worksheet.");
        rows = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          defval: "",
          raw: false,
          dateNF: "yyyy-mm-dd",
        });
      } else if (extension === "csv") {
        rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
      } else {
        throw new Error("Choose a CSV, XLSX, or XLS file.");
      }
      if (rows?.length < 2)
        throw new Error("The selected file contains no data rows.");
      const headers = rows[0]?.map((header) => header.trim());
      const missing = csvColumns.filter((column) => !headers.includes(column));
      const mapped = headers.filter((column) =>
        supportedImportColumns.includes(column),
      );
      const unmapped = headers.filter(
        (column) => column && !supportedImportColumns.includes(column),
      );
      const indexOf = (column) => headers.indexOf(column);
      const imported = rows.slice(1)?.map((row) => {
        const get = (column) => row[indexOf(column)]?.trim() || "";
        const quality = ["High", "Medium", "Low"].includes(
          get("Contact Quality"),
        )
          ? get("Contact Quality")
          : "Medium";
        return {
          id: `CL-${crypto.randomUUID()}`,
          company: get("Company"),
          country: get("Region"),
          businessType: get("Business Type"),
          name: get("Named Public Contact") || "—",
          publicContactRole: get("Public Contact Role"),
          decisionMaker: get("Best Decision-Maker to Target"),
          contactQuality: quality,
          message: get("Why It Fits"),
          researchSource: get("Research Source"),
          lastContacted: get("Last Contacted"),
          source: get("Source"),
          notes: get("Notes"),
          email: "",
          phone: "",
          status: "Target Identified",
          priority: quality,
          dealValue: 0,
          nextFollowUp: "",
          receivedAt: new Date().toISOString(),
          owner: "Admin",
        };
      });
      const unmappedValues = rows
        .slice(1)
        ?.map((row) =>
          Object.fromEntries(
            unmapped?.map((column) => [
              column,
              row[headers.indexOf(column)]?.trim?.() || "",
            ]),
          ),
        );
      setPendingImport({
        fileName: file.name,
        records: imported,
        mapped,
        missing,
        unmapped,
        unmappedValues,
        unmappedToNotes: [],
        bulkSource: "",
      });
    } catch (error) {
      setImportReport({
        success: false,
        message: error.message || "Unable to read this import file.",
      });
    }
  }

  async function confirmImport() {
    if (!pendingImport) return;
    const { missing } = pendingImport;
    const imported = pendingImport.records?.map((record, index) => {
      const extraNotes = pendingImport.unmappedToNotes
        ?.map((column) => {
          const value = pendingImport.unmappedValues[index]?.[column];
          return value ? `${column}: ${value}` : "";
        })
        .filter(Boolean);
      return {
        ...record,
        source: pendingImport.bulkSource.trim() || record.source,
        notes: [record.notes, ...extraNotes].filter(Boolean).join("\n"),
      };
    });
    try {
      let recordsToAdd = imported;
      let duplicateCompanies = [];
      if (dataMode === "mongodb") {
        const response = await fetch("/api/admin/clients/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clients: imported }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error || "Unable to import records into MongoDB.",
          );
        const acceptedIds = new Set(result.acceptedIds || []);
        recordsToAdd = imported.filter((client) => acceptedIds.has(client.id));
        duplicateCompanies = result.duplicates || [];
      }
      setLeads((current) => [...recordsToAdd, ...current]);
      setVisibleCount(Math.max(5, recordsToAdd.length));
      setImportReport({
        success: true,
        message: `${recordsToAdd.length} rows imported.${
          duplicateCompanies.length
            ? ` Already in database and skipped: ${duplicateCompanies.join(", ")}.`
            : ""
        } ${
          missing.length
            ? `Missing columns were left blank: ${missing.join(", ")}.`
            : "Any empty cells were left blank for later updates."
        }`,
      });
      setPendingImport(null);
    } catch (error) {
      setImportReport({
        success: false,
        message: error.message || "Unable to import these records.",
      });
    }
  }

  function toggleUnmappedNoteColumn(column) {
    setPendingImport((current) => ({
      ...current,
      unmappedToNotes: current.unmappedToNotes.includes(column)
        ? current.unmappedToNotes.filter((item) => item !== column)
        : [...current.unmappedToNotes, column],
    }));
  }

  async function confirmDeleteClient() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      if (dataMode === "mongodb") {
        const response = await fetch(
          `/api/admin/clients/${encodeURIComponent(deleteTarget.id)}`,
          { method: "DELETE" },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Unable to delete this client.");
      }
      setLeads((items) =>
        items.filter((client) => client.id !== deleteTarget.id),
      );
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      setImportReport({
        success: true,
        message: "Client deleted successfully.",
      });
    } catch (error) {
      setImportReport({
        success: false,
        message: error.message || "Unable to delete this client.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={`${shell.adminRoot} admin-dashboard-root`}>
      {mobileOpen && (
        <button
          className={shell.backdrop}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
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
        <DashboardNavigation
          activeHref="/dashboard/crm"
          unreadMessages={unreadMessages}
          crmCount={leads.length}
        />
        <div className={shell.sidebarBottom}>
          <Link href="/" className={shell.viewSite}>
            View public website
          </Link>
        </div>
      </aside>

      <main className={shell.main}>
        <header className={shell.topbar}>
          <button className={shell.menu} onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <label className={shell.search}>
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads..."
            />
          </label>
          <div className={shell.topActions} data-dashboard-header-actions>
            <Link
              href="/dashboard/messages"
              aria-label={`${unreadMessages} unread messages`}
            >
              <Bell size={20} />
              {unreadMessages > 0 && (
                <em className={shell.notificationCount}>
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </em>
              )}
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
        <div className={styles.content}>
          <section className={styles.heading}>
            <div>
              <span>CLIENT WINNING PROCESS</span>
              <em
                className={`${tableStyles.storageBadge} ${tableStyles[dataMode]}`}
              >
                {dataMode === "mongodb"
                  ? "MongoDB connected"
                  : dataMode === "local"
                    ? "Local mode"
                    : "Checking storage..."}
              </em>
              <h1>Sales CRM</h1>
              <p>
                Build relationships, schedule follow-ups, and move clients
                toward a successful deal.
              </p>
            </div>
            <div className={styles.headingActions}>
              <input
                ref={fileInput}
                className={tableStyles.fileInput}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={importCsv}
              />
              <button onClick={() => fileInput.current?.click()}>
                <Upload size={16} /> Import file
              </button>
              <button onClick={copyColumns}>
                {columnsCopied ? (
                  <Check size={16} />
                ) : (
                  <ClipboardCopy size={16} />
                )}
                {columnsCopied ? "Columns copied" : "Copy columns"}
              </button>
              <button onClick={exportCsv}>
                <Download size={16} /> Export CSV
              </button>
              <button
                className={styles.primary}
                onClick={() => {
                  setEditing(null);
                  setAdding(true);
                }}
              >
                <Plus size={17} /> Add client
              </button>
            </div>
          </section>
          {importReport && (
            <div
              className={`${tableStyles.importReport} ${importReport.success ? tableStyles.importSuccess : tableStyles.importError}`}
            >
              <span>{importReport.message}</span>
              <button
                onClick={() => setImportReport(null)}
                aria-label="Dismiss import result"
              >
                <X size={15} />
              </button>
            </div>
          )}
          <section className={`${styles.summary} ${tableStyles.crmStats}`}>
            <article
              className={followUpFilter === "All" ? tableStyles.activeStat : ""}
            >
              <button
                type="button"
                className={tableStyles.statCardButton}
                onClick={() => setFollowUpFilter("All")}
              >
                <span>Clients & prospects</span>
                <strong>{leads.length}</strong>
                <small>Saved contacts</small>
              </button>
            </article>
            <article
              className={
                followUpFilter === "thisWeek" ? tableStyles.activeStat : ""
              }
            >
              <button
                type="button"
                className={tableStyles.statCardButton}
                onClick={() => setFollowUpFilter("thisWeek")}
              >
                <span>Follow-ups this week</span>
                <strong>{followUpStats.thisWeek}</strong>
                <small>Due today through Sunday</small>
              </button>
            </article>
            <article
              className={
                followUpFilter === "overdue" ? tableStyles.activeStat : ""
              }
            >
              <button
                type="button"
                className={tableStyles.statCardButton}
                onClick={() => setFollowUpFilter("overdue")}
              >
                <span>Overdue follow-ups</span>
                <strong className={tableStyles.overdueNumber}>
                  {followUpStats.overdue}
                </strong>
                <small>Dated before today</small>
              </button>
            </article>
            <article
              className={
                followUpFilter === "missing" ? tableStyles.activeStat : ""
              }
            >
              <button
                type="button"
                className={tableStyles.statCardButton}
                onClick={() => setFollowUpFilter("missing")}
              >
                <span>Missing follow-ups</span>
                <strong className={tableStyles.missingNumber}>
                  {followUpStats.missing}
                </strong>
                <small>No follow-up date assigned</small>
              </button>
            </article>
          </section>
          <section className={styles.controls}>
            <div className={styles.tabs}>
              {stages?.map((stage) => (
                <button
                  key={stage}
                  className={`${status === stage ? styles.tabActive : ""} ${stageDescriptions[stage] ? tableStyles.stageTooltip : ""}`}
                  onClick={() => setStatus(stage)}
                  title={
                    stageDescriptions[stage] || "Show every pipeline stage"
                  }
                  aria-label={
                    stageDescriptions[stage]
                      ? `${stage}: ${stageDescriptions[stage]}`
                      : stage
                  }
                  data-tooltip={stageDescriptions[stage]}
                  onMouseEnter={(event) => showStageTooltip(event, stage)}
                  onMouseLeave={() => setStageTooltip(null)}
                  onFocus={(event) => showStageTooltip(event, stage)}
                  onBlur={() => setStageTooltip(null)}
                >
                  {stage}
                  {stage === "All" && <b>{leads.length}</b>}
                </button>
              ))}
            </div>
            <div className={styles.viewButtons}>
              <button
                onClick={() => setView("table")}
                className={view === "table" ? styles.selectedView : ""}
              >
                Table
              </button>
              <button
                onClick={() => setView("pipeline")}
                className={view === "pipeline" ? styles.selectedView : ""}
              >
                Pipeline
              </button>
              <button
                aria-label="Filters"
                onClick={() => setFiltersOpen((open) => !open)}
                className={filtersOpen ? styles.selectedView : ""}
              >
                <SlidersHorizontal size={15} />
              </button>
              <button
                type="button"
                aria-label="Maximize CRM table"
                title="Maximize CRM table"
                onClick={() => {
                  setView("table");
                  setTableMaximized(true);
                }}
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </section>
          {filtersOpen && (
            <section className={tableStyles.filterPanel}>
              <div className={tableStyles.filterFields}>
                <label>
                  Stage
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {stages?.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Contact quality
                  <select
                    value={qualityFilter}
                    onChange={(e) => setQualityFilter(e.target.value)}
                  >
                    {["All", "High", "Medium", "Low"]?.map((quality) => (
                      <option key={quality}>{quality}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Region
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                  >
                    <option>All</option>
                    {regions?.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Business type
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option>All</option>
                    {businessTypes?.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Source
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                  >
                    <option>All</option>
                    {sources?.map((source) => (
                      <option key={source}>{source}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Star status
                  <select
                    value={starredFilter}
                    onChange={(e) => setStarredFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Starred">Starred</option>
                    <option value="Not starred">Not starred</option>
                  </select>
                </label>
                <label>
                  Pakistan flag
                  <select
                    value={pakistanFlagFilter}
                    onChange={(e) => setPakistanFlagFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Flagged">🇵🇰 Flagged</option>
                    <option value="Unflagged">Grey / unflagged</option>
                  </select>
                </label>
              </div>
              <div className={tableStyles.filterActions}>
                <span>{filtered.length} matching records</span>
                <button type="button" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            </section>
          )}

          {view === "table" ? (
            <section
              className={`${styles.tableWrap} ${tableStyles.researchTable} ${tableMaximized ? styles.tableMaximized : ""}`}
              onScroll={handleTableScroll}
              ref={tableScroll}
              role={tableMaximized ? "dialog" : undefined}
              aria-modal={tableMaximized ? "true" : undefined}
              aria-label={
                tableMaximized ? "Maximized Sales CRM table" : undefined
              }
            >
              {tableMaximized && (
                <header className={styles.maximizedHeader}>
                  <div>
                    <strong>Sales CRM table</strong>
                    <span>{filtered.length} matching records</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTableMaximized(false)}
                    aria-label="Restore CRM table"
                    title="Restore table"
                  >
                    <Minimize2 size={17} /> Restore
                  </button>
                </header>
              )}
              <table>
                <thead>
                  <tr>
                    <th>COMPANY</th>
                    <th>REFERRAL LINK</th>
                    <th>REGION</th>
                    <th>BUSINESS TYPE</th>
                    <th>NAMED PUBLIC CONTACT</th>
                    <th>PUBLIC CONTACT ROLE</th>
                    <th>BEST DECISION-MAKER TO TARGET</th>
                    <th>CONTACT QUALITY</th>
                    <th>WHY IT FITS</th>
                    <th>RESEARCH SOURCE</th>
                    <th>LAST CONTACTED</th>
                    <th>SOURCE</th>
                    <th>NOTES</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, visibleCount)?.map((lead, index) => (
                    <tr
                      key={`${lead._id || lead.id || "client"}-${index}`}
                      onClick={() => setSelected(lead)}
                      className={lead.starred ? tableStyles.starredRow : ""}
                    >
                      <td>
                        <div className={tableStyles.companyCell}>
                          <div className={tableStyles.rowMarkers}>
                            <button
                              type="button"
                              className={`${tableStyles.starButton} ${lead.starred ? tableStyles.starActive : ""}`}
                              onClick={(event) => toggleStar(event, lead)}
                              aria-label={
                                lead.starred
                                  ? `Unstar ${lead.company || "client"}`
                                  : `Star ${lead.company || "client"}`
                              }
                              title={
                                lead.starred
                                  ? "Remove star"
                                  : "Mark as important"
                              }
                            >
                              <Star
                                size={17}
                                fill={lead.starred ? "currentColor" : "none"}
                              />
                            </button>
                            <button
                              type="button"
                              className={`${tableStyles.pakistanButton} ${lead.pakistanFlagged ? tableStyles.pakistanActive : ""}`}
                              onClick={(event) =>
                                togglePakistanFlag(event, lead)
                              }
                              aria-pressed={Boolean(lead.pakistanFlagged)}
                              aria-label={`${lead.pakistanFlagged ? "Remove" : "Add"} Pakistan flag for ${lead.company || "client"}`}
                              title={
                                lead.pakistanFlagged
                                  ? "Remove Pakistan flag"
                                  : "Mark with Pakistan flag"
                              }
                            >
                              <span aria-hidden="true">🇵🇰</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            className={tableStyles.companyCopy}
                            onClick={(event) => copyCompany(event, lead)}
                            title={`Copy ${lead.company || "company name"}`}
                          >
                            <strong>{lead.company}</strong>
                            {copiedCompanyId === lead.id && (
                              <small>Copied</small>
                            )}
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={tableStyles.referralCopy}
                          onClick={(event) => copyReferralLink(event, lead)}
                          disabled={!lead.referralKey}
                          title="Copy this client's tracked website link"
                        >
                          {copiedReferralId === lead.id ? (
                            <Check size={14} />
                          ) : (
                            <ClipboardCopy size={14} />
                          )}
                          {copiedReferralId === lead.id
                            ? "Copied"
                            : "Copy link"}
                        </button>
                      </td>
                      <td>{lead.country || "—"}</td>
                      <td>{lead.businessType || "—"}</td>
                      <td>
                        <div className={styles.contact}>
                          <i>
                            {(lead.name || "?")
                              .split(" ")
                              ?.map((n) => n[0])
                              .join("")}
                          </i>
                          <div>
                            <strong>{lead.name}</strong>
                            <span>{lead.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{lead.publicContactRole || "—"}</td>
                      <td>{lead.decisionMaker || "—"}</td>
                      <td>
                        <span
                          className={`${styles.priority} ${styles[(lead.contactQuality || "medium").toLowerCase()]}`}
                        >
                          ● {lead.contactQuality || "Medium"}
                        </span>
                      </td>
                      <td className={tableStyles.longCell}>
                        {lead.message || "—"}
                      </td>
                      <td>{lead.researchSource || "—"}</td>
                      <td>{lead.lastContacted || "Never"}</td>
                      <td>{lead.source || "—"}</td>
                      <td className={tableStyles.longCell}>
                        {lead.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && (
                <div className={styles.noResults}>
                  No clients match your filters.
                </div>
              )}
              {visibleCount < filtered.length && (
                <div className={tableStyles.loadMore} ref={loadSentinel}>
                  Scroll down to load more · Showing {visibleCount} of{" "}
                  {filtered.length}
                </div>
              )}
              {filtered.length > 0 && visibleCount >= filtered.length && (
                <div className={tableStyles.endMessage}>
                  Showing all {filtered.length} records
                </div>
              )}
            </section>
          ) : (
            <section className={styles.board}>
              {stages.slice(1, -2)?.map((stage) => (
                <div className={styles.column} key={stage}>
                  <header
                    className={tableStyles.stageTooltip}
                    title={stageDescriptions[stage]}
                    aria-label={`${stage}: ${stageDescriptions[stage]}`}
                    data-tooltip={stageDescriptions[stage]}
                    onMouseEnter={(event) => showStageTooltip(event, stage)}
                    onMouseLeave={() => setStageTooltip(null)}
                  >
                    <span>{stage}</span>
                    <b>{filtered.filter((l) => l.status === stage).length}</b>
                  </header>
                  {filtered
                    .filter((l) => l.status === stage)
                    ?.map((lead, index) => (
                      <button
                        key={`${lead._id || lead.id || "client"}-${index}`}
                        onClick={() => setSelected(lead)}
                      >
                        <small>{lead.businessType}</small>
                        <strong>{lead.company}</strong>
                        <span>
                          {lead.name} · {lead.publicContactRole}
                        </span>
                        <p>{lead.message}</p>
                      </button>
                    ))}
                </div>
              ))}
            </section>
          )}
        </div>
      </main>

      {selected && (
        <aside className={styles.drawer}>
          <header>
            <button onClick={() => setSelected(null)}>
              <ArrowLeft size={18} />
            </button>
            <span>Client relationship</span>
            <button onClick={() => setSelected(null)}>
              <X size={19} />
            </button>
          </header>
          <div className={styles.drawerBody}>
            <div className={styles.profile}>
              <i>
                {(selected.name || "?")
                  .split(" ")
                  ?.map((n) => n[0])
                  .join("")}
              </i>
              <h2>{selected.name}</h2>
              <p>
                {selected.company} · {selected.country}
              </p>
              <div>
                <a href={`mailto:${selected.email}`}>
                  <Mail size={16} /> Email
                </a>
                <a href={`tel:${selected.phone}`}>
                  <Phone size={16} /> Call
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(selected);
                    setAdding(true);
                  }}
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button
                  type="button"
                  className={tableStyles.deleteAction}
                  onClick={() => setDeleteTarget(selected)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
            <label>
              Winning stage
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
              >
                {stages.slice(1)?.map((stage) => (
                  <option key={stage} title={stageDescriptions[stage]}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>
            <section>
              <h3>Contact information</h3>
              <p>
                <span>Email</span>
                {selected.email}
              </p>
              <p>
                <span>Phone</span>
                {selected.phone}
              </p>
              <p>
                <span>Owner</span>
                {selected.owner}
              </p>
            </section>
            <section>
              <h3>Opportunity</h3>
              <p>
                <span>Interest</span>
                {selected.product}
              </p>
              <p>
                <span>Deal value</span>$
                {Number(selected.dealValue || 0).toLocaleString()}
              </p>
              <p>
                <span>Follow-up</span>
                {selected.nextFollowUp || "Not set"}
              </p>
              <blockquote>{selected.message}</blockquote>
            </section>
            <section>
              <h3>Relationship notes</h3>
              <textarea
                placeholder="Record a call, meeting, objection, or next action..."
                rows="4"
                value={selected.notes || ""}
                onChange={(event) =>
                  setSelected((client) => ({
                    ...client,
                    notes: event.target.value,
                  }))
                }
              />
              <button className={styles.saveNote} onClick={saveDrawerNotes}>
                Save note
              </button>
            </section>
          </div>
        </aside>
      )}
      {pendingImport && (
        <div className={styles.modalBackdrop}>
          <section className={`${styles.modal} ${tableStyles.importPreview}`}>
            <header>
              <div>
                <span>CONFIRM DATABASE IMPORT</span>
                <h2>Review {pendingImport.fileName}</h2>
              </div>
              <button type="button" onClick={() => setPendingImport(null)}>
                <X size={19} />
              </button>
            </header>
            <div className={tableStyles.previewBody}>
              <div className={tableStyles.previewCount}>
                <strong>{pendingImport.records.length}</strong>
                <span>rows ready to be checked and added to MadxClients</span>
              </div>
              <label className={tableStyles.bulkSourceField}>
                <span>Bulk source</span>
                <small>
                  Apply one source to every record in this import. Leave blank
                  to keep values from the file.
                </small>
                <input
                  type="text"
                  list="crm-import-sources"
                  value={pendingImport.bulkSource}
                  onChange={(event) =>
                    setPendingImport((current) => ({
                      ...current,
                      bulkSource: event.target.value,
                    }))
                  }
                  placeholder="Select or type a source"
                />
                <datalist id="crm-import-sources">
                  {sources?.map((source) => (
                    <option value={source} key={source} />
                  ))}
                </datalist>
              </label>
              <section>
                <h3>Mapped columns</h3>
                <p>These columns match CRM database fields.</p>
                <div className={tableStyles.columnChips}>
                  {pendingImport.maped.length ? (
                    pendingImport.maped?.map((column) => (
                      <span className={tableStyles.map} key={column}>
                        <Check size={13} /> {column}
                      </span>
                    ))
                  ) : (
                    <em>No recognized columns found.</em>
                  )}
                </div>
              </section>
              {pendingImport.missing.length > 0 && (
                <section className={tableStyles.mapingWarning}>
                  <h3>Expected columns missing from file</h3>
                  <p>
                    Import is still allowed. These database values will be left
                    blank for you to update later.
                  </p>
                  <div className={tableStyles.columnChips}>
                    {pendingImport.missing?.map((column) => (
                      <span key={column}>{column}</span>
                    ))}
                  </div>
                </section>
              )}
              {pendingImport.unmapped.length > 0 && (
                <section className={tableStyles.mapingError}>
                  <h3>Columns not mapped to the database</h3>
                  <p>
                    Select any fields whose values should be saved in Notes. You
                    can select multiple fields. Unselected fields will be
                    ignored.
                  </p>
                  <div className={tableStyles.mapingActions}>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingImport((current) => ({
                          ...current,
                          unmappedToNotes: [...current.unmapped],
                        }))
                      }
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingImport((current) => ({
                          ...current,
                          unmappedToNotes: [],
                        }))
                      }
                    >
                      Clear
                    </button>
                  </div>
                  <div className={tableStyles.unmappedChoices}>
                    {pendingImport.unmapped?.map((column) => (
                      <label key={column}>
                        <input
                          type="checkbox"
                          checked={pendingImport.unmappedToNotes.includes(
                            column,
                          )}
                          onChange={() => toggleUnmappedNoteColumn(column)}
                        />
                        <span>{column}</span>
                        <small>Add to Notes</small>
                      </label>
                    ))}
                  </div>
                  {pendingImport.unmappedToNotes.length > 0 && (
                    <strong className={tableStyles.notesSelectionSummary}>
                      {pendingImport.unmappedToNotes.length} field
                      {pendingImport.unmappedToNotes.length === 1
                        ? ""
                        : "s"}{" "}
                      will be added to Notes
                    </strong>
                  )}
                </section>
              )}
            </div>
            <footer>
              <button type="button" onClick={() => setPendingImport(null)}>
                Cancel
              </button>
              <button
                className={styles.primary}
                type="button"
                onClick={confirmImport}
              >
                Import {pendingImport.records.length} rows
              </button>
            </footer>
          </section>
        </div>
      )}
      {deleteTarget && (
        <div className={styles.modalBackdrop}>
          <section className={`${styles.modal} ${tableStyles.deleteDialog}`}>
            <div className={tableStyles.deleteDialogBody}>
              <span className={tableStyles.deleteIcon}>
                <Trash2 size={25} />
              </span>
              <h2>Are you sure?</h2>
              <p>
                You are about to permanently delete
                <strong> {deleteTarget.company || "this client"}</strong>
                {deleteTarget.country ? ` from ${deleteTarget.country}` : ""}.
                This action cannot be undone.
              </p>
            </div>
            <footer>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={tableStyles.confirmDelete}
                disabled={deleting}
                onClick={confirmDeleteClient}
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </footer>
          </section>
        </div>
      )}
      {adding && (
        <div className={styles.modalBackdrop}>
          <form
            className={styles.modal}
            onSubmit={saveClient}
            key={editing?.id || "new-client"}
          >
            <header>
              <div>
                <span>{editing ? "UPDATE CRM RECORD" : "NEW CRM RECORD"}</span>
                <h2>
                  {editing ? "Edit company research" : "Add company research"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setEditing(null);
                }}
              >
                <X size={19} />
              </button>
            </header>
            <div className={styles.formGrid}>
              <label>
                Record ID
                <input
                  name="id"
                  defaultValue={
                    editing?.id || `CL-${Date.now().toString().slice(-6)}`
                  }
                />
              </label>
              <label>
                Created date
                <input
                  name="receivedAt"
                  type="datetime-local"
                  defaultValue={
                    editing?.receivedAt
                      ? new Date(editing.receivedAt).toISOString().slice(0, 16)
                      : new Date().toISOString().slice(0, 16)
                  }
                />
              </label>
              <label>
                Company
                <input name="company" defaultValue={editing?.company || ""} />
              </label>
              <label>
                Region
                <input name="country" defaultValue={editing?.country || ""} />
              </label>
              <label>
                Business type
                <input
                  name="businessType"
                  defaultValue={editing?.businessType || ""}
                />
              </label>
              <label>
                Named public contact
                <input
                  name="name"
                  defaultValue={
                    editing?.name === "—" ? "" : editing?.name || ""
                  }
                />
              </label>
              <label>
                Public contact role
                <input
                  name="publicContactRole"
                  defaultValue={editing?.publicContactRole || ""}
                />
              </label>
              <label>
                Best decision-maker to target
                <input
                  name="decisionMaker"
                  defaultValue={editing?.decisionMaker || ""}
                />
              </label>
              <label>
                Contact quality
                <select
                  name="contactQuality"
                  defaultValue={editing?.contactQuality || "Medium"}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  name="priority"
                  defaultValue={editing?.priority || "Medium"}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label>
                Product / opportunity
                <input name="product" defaultValue={editing?.product || ""} />
              </label>
              <label>
                Estimated quantity
                <input name="quantity" defaultValue={editing?.quantity || ""} />
              </label>
              <label>
                Deal value ($)
                <input
                  name="dealValue"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editing?.dealValue || ""}
                />
              </label>
              <label>
                Owner
                <input name="owner" defaultValue={editing?.owner || "Admin"} />
              </label>
              <label>
                Research source
                <input
                  name="researchSource"
                  placeholder="LinkedIn, company website..."
                  defaultValue={editing?.researchSource || ""}
                />
              </label>
              <label>
                Last contacted
                <input
                  name="lastContacted"
                  type="date"
                  defaultValue={editing?.lastContacted || ""}
                />
              </label>
              <label>
                Source
                <input
                  name="source"
                  placeholder="Referral, outreach, trade show..."
                  defaultValue={editing?.source || ""}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  defaultValue={editing?.email || ""}
                />
              </label>
              <label>
                Phone
                <input name="phone" defaultValue={editing?.phone || ""} />
              </label>
              <label className={styles.fullField}>
                Why it fits
                <textarea
                  name="message"
                  rows="3"
                  defaultValue={editing?.message || ""}
                />
              </label>
              <label className={styles.fullField}>
                Notes
                <textarea
                  name="notes"
                  rows="3"
                  defaultValue={editing?.notes || ""}
                />
              </label>
              <label>
                Winning stage
                <select
                  name="status"
                  defaultValue={editing?.status || "Target Identified"}
                >
                  {stages.slice(1)?.map((stage) => (
                    <option key={stage} title={stageDescriptions[stage]}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Next follow-up
                <input
                  name="nextFollowUp"
                  type="date"
                  defaultValue={editing?.nextFollowUp || ""}
                />
              </label>
            </div>
            <footer>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>
              <button className={styles.primary} type="submit">
                {editing ? "Update company" : "Save company"}
              </button>
            </footer>
          </form>
        </div>
      )}
      {stageTooltip && (
        <div
          className={tableStyles.floatingStageTooltip}
          style={{ left: stageTooltip.left, top: stageTooltip.top }}
          role="tooltip"
        >
          <strong>{stageTooltip.stage}</strong>
          <span>{stageTooltip.description}</span>
        </div>
      )}
    </div>
  );
}
