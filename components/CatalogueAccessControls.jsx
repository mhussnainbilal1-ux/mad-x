"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function CatalogueAccessControls({ hasAccess }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [guid, setGuid] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!hasAccess && searchParams.get("unlock") === "1") {
      setIsModalOpen(true);
    }
  }, [hasAccess, searchParams]);

  useEffect(() => {
    if (hasAccess) return undefined;

    function openModal() {
      setMessage("");
      setIsModalOpen(true);
    }

    window.addEventListener("open-catalogue-access", openModal);
    return () => window.removeEventListener("open-catalogue-access", openModal);
  }, [hasAccess]);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsModalOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  async function handleUnlock(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/catalogue-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guid }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Unable to unlock the catalogue.");
        return;
      }

      setGuid("");
      setIsModalOpen(false);
      trackEvent("catalogue_unlock_request", { result: "success" });
      router.refresh();
    } catch {
      setMessage("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLock() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/catalogue-access/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setMessage("Unable to lock the catalogue. Please try again.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (hasAccess) {
    return (
      <div className="catalogueAccess catalogueAccessUnlocked">
        <div>
          <strong>Full catalogue unlocked</strong>
          <span>Your access will close automatically when it expires.</span>
        </div>
        <button
          className="button ghost"
          type="button"
          onClick={handleLock}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Locking…" : "Lock catalogue"}
        </button>
        {message && <p role="status">{message}</p>}
      </div>
    );
  }

  const formProps = {
    guid,
    setGuid,
    isSubmitting,
    message,
    handleUnlock,
  };

  return (
    <>
      <UnlockForm {...formProps} inputId="catalogue-guid-inline" />

      {isModalOpen && (
        <div
          className="catalogueModalBackdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="catalogueModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalogue-modal-title"
          >
            <button
              className="catalogueModalClose"
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close catalogue access form"
            >
              ×
            </button>
            <span className="kicker dark">Private catalogue access</span>
            <h2 id="catalogue-modal-title">Unlock the complete catalogue</h2>
            <p>
              Enter the access key provided by your MADX representative to view
              the complete product range.
            </p>
            <div className="catalogueContactPrompt">
              <span>Don&apos;t have an access key?</span>
              <Link className="button red" href="/contact">
                Contact us
              </Link>
            </div>
            <UnlockForm {...formProps} inputId="catalogue-guid-modal" modal />
          </div>
        </div>
      )}
    </>
  );
}

function UnlockForm({
  guid,
  setGuid,
  isSubmitting,
  message,
  handleUnlock,
  inputId,
  modal = false,
}) {
  return (
    <form
      className={`catalogueAccess${modal ? " catalogueAccessModal" : ""}`}
      onSubmit={handleUnlock}
    >
      {!modal && (
        <div>
          <strong>Unlock the complete catalogue</strong>
          <span>
            Enter your catalogue access code. Preview access shows three
            products from each range.
          </span>
        </div>
      )}
      <div className="catalogueAccessFields">
        <label className="srOnly" htmlFor={inputId}>
          Catalogue access code
        </label>
        <input
          id={inputId}
          type="text"
          value={guid}
          onChange={(event) => setGuid(event.target.value)}
          placeholder="Enter access key here"
          minLength={10}
          maxLength={14}
          autoComplete="off"
          spellCheck="false"
          required
          disabled={isSubmitting}
          autoFocus={modal}
        />
        <button className="button navy" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking…" : "Unlock catalogue"}
        </button>
      </div>
      {message && (
        <p className="catalogueAccessError" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
