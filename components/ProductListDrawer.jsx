"use client";

import Image from "next/image";
import {
  Download,
  FileText,
  Minus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { generateProductListPdf } from "@/lib/generate-product-list-pdf";
import { useProductList } from "./ProductListProvider";

export default function ProductListDrawer() {
  const { items, drawerOpen, closeDrawer, removeItem, clearList, updateItem } =
    useProductList();
  const [tab, setTab] = useState("sample");
  const [downloading, setDownloading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [downloadType, setDownloadType] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    companyName: "",
    email: "",
    contactNumber: "",
  });
  const visibleItems = useMemo(
    () => items.filter((item) => item.listType === tab),
    [items, tab],
  );
  const counts = useMemo(
    () => ({
      sample: items.filter((item) => item.listType === "sample").length,
      order: items.filter((item) => item.listType === "order").length,
    }),
    [items],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.classList.add("listOverlayOpen");
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (confirmClear) setConfirmClear(false);
      else if (downloadType) setDownloadType(null);
      else closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("listOverlayOpen");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer, confirmClear, downloadType]);

  async function download(type, details) {
    const downloadItems =
      type === "combined"
        ? items
        : items.filter((item) => item.listType === type);
    if (!downloadItems.length || downloading) return;
    setDownloading(true);
    try {
      await generateProductListPdf(items, type, details);
    } catch (error) {
      window.alert("The PDF could not be generated. Please try again.");
      console.error(error);
    } finally {
      setDownloading(false);
    }
  }

  function requestDownload(type) {
    if (downloading) return;
    setDownloadType(type);
  }

  async function submitDownload(event) {
    event.preventDefault();
    const details = {
      companyName: customerDetails.companyName.trim(),
      email: customerDetails.email.trim(),
      contactNumber: customerDetails.contactNumber.trim(),
    };
    if (!details.companyName || !details.email || !details.contactNumber)
      return;
    setDownloadType(null);
    await download(downloadType, details);
  }

  function updateUnits(item, rowIndex, value) {
    updateItem(
      item.id,
      item.selections.map((selection, index) =>
        index === rowIndex
          ? { ...selection, units: Math.max(1, Number(value) || 1) }
          : selection,
      ),
    );
  }

  return (
    <div
      className={`productListLayer ${drawerOpen ? "open" : ""}`}
      aria-hidden={!drawerOpen}
    >
      <button
        className="productDrawerBackdrop"
        type="button"
        onClick={closeDrawer}
        aria-label="Close product list"
        tabIndex={drawerOpen ? 0 : -1}
      />
      <aside
        className="productListDrawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-list-title"
      >
        <div className="drawerHeader">
          <div>
            <span className="productModalEyebrow">Your selections</span>
            <h2 id="product-list-title">Product lists</h2>
          </div>
          <button
            type="button"
            className="listIconButton"
            onClick={closeDrawer}
            aria-label="Close product list"
          >
            <X size={21} />
          </button>
        </div>
        <div className="drawerTabs">
          {[
            ["sample", "Samples", counts.sample],
            ["order", "Orders", counts.order],
          ].map(([value, label, count]) => (
            <button
              type="button"
              key={value}
              className={tab === value ? "active" : ""}
              onClick={() => setTab(value)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="drawerContent">
          {visibleItems.length ? (
            visibleItems.map((item) => (
              <article className="drawerProduct" key={item.id}>
                <div className="drawerProductTop">
                  <div className="drawerProductImage">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="74px"
                    />
                  </div>
                  <div className="drawerProductTitle">
                    <span>{item.product.category}</span>
                    <h3>{item.product.name}</h3>
                  </div>
                  <button
                    type="button"
                    className="drawerRemove"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="drawerSelections">
                  {item.selections.map((selection, index) => (
                    <div key={`${selection.size}-${index}`}>
                      <span>{selection.size}</span>
                      <label>
                        <span className="srOnly">
                          Units for {selection.size}
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={selection.units}
                          onChange={(event) =>
                            updateUnits(item, index, event.target.value)
                          }
                        />
                        <small>units</small>
                      </label>
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="emptyDrawer">
              <ShoppingBag size={36} />
              <h3>No {tab} products yet</h3>
              <p>Use the + button on any product card to build this list.</p>
            </div>
          )}
        </div>
        <div className="drawerFooter">
          {visibleItems.length > 0 && (
            <>
              <button
                type="button"
                className="button red drawerDownload"
                onClick={() => requestDownload(tab)}
                disabled={downloading}
              >
                <Download size={18} />
                {downloading ? "Preparing PDF…" : `Download ${tab} PDF`}
              </button>
              <button
                type="button"
                className="drawerClear"
                onClick={() => setConfirmClear(true)}
              >
                <Minus size={15} /> Clear {tab} list
              </button>
            </>
          )}
          {counts.sample > 0 && counts.order > 0 && (
            <button
              type="button"
              className="combinedDownload"
              onClick={() => requestDownload("combined")}
              disabled={downloading}
            >
              <FileText size={16} /> Download combined PDF
            </button>
          )}
        </div>
        {confirmClear && (
          <div className="clearListConfirmBackdrop">
            <div
              className="clearListConfirm"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="clear-list-title"
              aria-describedby="clear-list-description"
            >
              <div className="clearListConfirmIcon">
                <Trash2 size={22} />
              </div>
              <h3 id="clear-list-title">Are you sure?</h3>
              <p id="clear-list-description">
                This will remove every product from your {tab} list.
              </p>
              <div className="clearListConfirmActions">
                <button
                  type="button"
                  className="clearListNo"
                  onClick={() => setConfirmClear(false)}
                  autoFocus
                >
                  No, keep it
                </button>
                <button
                  type="button"
                  className="clearListYes"
                  onClick={() => {
                    clearList(tab);
                    setConfirmClear(false);
                  }}
                >
                  Yes, clear
                </button>
              </div>
            </div>
          </div>
        )}
        {downloadType && (
          <div className="clearListConfirmBackdrop">
            <form
              className="downloadDetailsDialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="download-details-title"
              onSubmit={submitDownload}
            >
              <button
                type="button"
                className="downloadDetailsClose"
                onClick={() => setDownloadType(null)}
                aria-label="Cancel PDF download"
              >
                <X size={18} />
              </button>
              <span className="productModalEyebrow">PDF details</span>
              <h3 id="download-details-title">Your company information</h3>
              <p>These details will appear on your downloaded product list.</p>
              <label>
                <span>Company name *</span>
                <input
                  type="text"
                  value={customerDetails.companyName}
                  onChange={(event) =>
                    setCustomerDetails((current) => ({
                      ...current,
                      companyName: event.target.value,
                    }))
                  }
                  autoComplete="organization"
                  required
                  autoFocus
                />
              </label>
              <label>
                <span>Email *</span>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(event) =>
                    setCustomerDetails((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                <span>WhatsApp number *</span>
                <input
                  type="tel"
                  value={customerDetails.contactNumber}
                  onChange={(event) =>
                    setCustomerDetails((current) => ({
                      ...current,
                      contactNumber: event.target.value,
                    }))
                  }
                  autoComplete="tel"
                  required
                />
              </label>
              <div className="downloadDetailsActions">
                <button type="button" onClick={() => setDownloadType(null)}>
                  Cancel
                </button>
                <button type="submit">
                  <Download size={17} /> Download PDF
                </button>
              </div>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}
