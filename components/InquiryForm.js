"use client";
import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function InquiryForm({ compact = false, source }) {
  const [status, setStatus] = useState("idle");
  const [validationErrors, setValidationErrors] = useState({});
  const [captcha, setCaptcha] = useState(null);

  const loadCaptcha = useCallback(async () => {
    try {
      const response = await fetch("/api/inquiry", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load security check");
      setCaptcha(await response.json());
    } catch {
      setCaptcha(null);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  function validate(values) {
    const errors = {};

    if (!values.name.trim()) errors.name = "Please enter your name.";
    if (!values.email.trim()) {
      errors.email = "Please enter your business email.";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!values.product) errors.product = "Please select a product type.";
    const captchaAnswer = String(values.captcha || "").trim();
    if (!captchaAnswer) {
      errors.captcha = "Please answer the security question.";
    }
    if (!values.captchaToken) errors.captcha = "Security check is loading.";

    return errors;
  }

  function clearFieldError(event) {
    const { name } = event.target;
    if (!validationErrors[name]) return;

    setValidationErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    const formValues = Object.fromEntries(new FormData(form).entries());
    const errors = validate(formValues);

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      setStatus("idle");
      form.querySelector(`[name="${Object.keys(errors)[0]}"]`)?.focus();
      return;
    }

    setValidationErrors({});
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
      loadCaptcha();
      setValidationErrors({});
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
      loadCaptcha();
      if (error.message.toLowerCase().includes("security check")) {
        setValidationErrors((current) => ({
          ...current,
          captcha: error.message,
        }));
      }
      setStatus("error");
    }
  }

  return (
    <form
      className="inquiryForm"
      onSubmit={handleSubmit}
      onInput={clearFieldError}
      noValidate
    >
      <div>
        <label htmlFor="inquiry-name">Name *</label>
        <input
          id="inquiry-name"
          name="name"
          aria-invalid={Boolean(validationErrors.name)}
          aria-describedby={validationErrors.name ? "name-error" : undefined}
        />
        {validationErrors.name && (
          <p className="fieldError" id="name-error" role="alert">
            {validationErrors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="inquiry-email">Business email *</label>
        <input
          id="inquiry-email"
          type="text"
          inputMode="email"
          autoComplete="email"
          name="email"
          aria-invalid={Boolean(validationErrors.email)}
          aria-describedby={validationErrors.email ? "email-error" : undefined}
        />
        {validationErrors.email && (
          <p className="fieldError" id="email-error" role="alert">
            {validationErrors.email}
          </p>
        )}
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
        <label htmlFor="inquiry-product">Product type *</label>
        <select
          id="inquiry-product"
          name="product"
          defaultValue=""
          aria-invalid={Boolean(validationErrors.product)}
          aria-describedby={
            validationErrors.product ? "product-error" : undefined
          }
        >
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
        {validationErrors.product && (
          <p className="fieldError" id="product-error" role="alert">
            {validationErrors.product}
          </p>
        )}
      </div>
      <div>
        <label>Estimated quantity</label>
        <input name="quantity" placeholder="e.g. 100 pairs" />
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
        <label htmlFor="inquiry-captcha">
          Security check: {captcha?.question || "Loading…"} *
        </label>
        <input type="hidden" name="captchaToken" value={captcha?.token || ""} />
        <input
          id="inquiry-captcha"
          name="captcha"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={!captcha}
          aria-invalid={Boolean(validationErrors.captcha)}
          aria-describedby={
            validationErrors.captcha ? "captcha-error" : undefined
          }
        />
        {validationErrors.captcha && (
          <p className="fieldError" id="captcha-error" role="alert">
            {validationErrors.captcha}
          </p>
        )}
      </div>
      <div className="full">
        <button
          className="button red wide"
          type="submit"
          disabled={status === "sending" || !captcha}
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
