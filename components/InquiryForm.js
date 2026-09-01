"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function InquiryForm({ compact = false, source }) {
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formValues = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formValues, source }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to send inquiry");
      form.reset();
      setStatus("sent");
      trackEvent(
        source === "Contact Us" ? "contact_form_submit" : "quote_form_submit",
        {
          form_source: source || "Website inquiry",
          product_type: formValues.product,
        },
      );
    } catch (error) {
      console.error("Inquiry submission failed:", error);
      setStatus("error");
    }
  }

  return (
    <form className="inquiryForm" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="inquiry-name">Name</label>
        <input id="inquiry-name" name="name" />
      </div>
      <div>
        <label htmlFor="inquiry-email">Business email</label>
        <input
          id="inquiry-email"
          type="text"
          inputMode="email"
          autoComplete="email"
          name="email"
        />
      </div>
      <div>
        <label>Company / Brand</label>
        <input name="company" />
      </div>
      <div>
        <label>Country</label>
        <input name="country" />
      </div>
      <div>
        <label htmlFor="inquiry-product">Product type</label>
        <select id="inquiry-product" name="product" defaultValue="">
          <option value="" disabled>
            Select a product type
          </option>
          <option>Boxing</option>
          <option>MMA</option>
          <option>Fitness</option>
          <option>Yoga</option>
          <option>Apparel</option>
          <option>Leather Jackets</option>
          <option>Custom Product</option>
          <option>Other / Not Sure</option>
        </select>
      </div>
      <div>
        <label>Estimated quantity</label>
        <input name="quantity" placeholder="e.g. 50 Pairs" />
      </div>
      <div className="full">
        <label>Requirements</label>
        <textarea
          rows={compact ? 4 : 6}
          name="message"
          placeholder="Tell us about materials, branding, sizes, target price and timeline."
        />
      </div>
      <div className="full">
        <button
          className="button red wide"
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send Inquiry"}
        </button>
        {status === "sent" && (
          <p className="success">
            Thank you. Your inquiry has been sent successfully.
          </p>
        )}
        {status === "error" && (
          <p className="error" role="alert">
            We couldn&apos;t send your inquiry. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}
