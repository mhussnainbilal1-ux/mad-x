"use client";
import { useState } from "react";
export default function InquiryForm({ compact = false }) {
  const [sent, setSent] = useState(false);
  function submit(e) {
    e.preventDefault();
    setSent(true);
    e.currentTarget.reset();
  }
  return (
    <form className="inquiryForm" onSubmit={submit}>
      <div>
        <label>Name</label>
        <input required name="name" />
      </div>
      <div>
        <label>Business email</label>
        <input required type="email" name="email" />
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
        <label>Product type</label>
        <select name="product">
          <option>Boxing Gloves</option>
          <option>MMA Gloves</option>
          <option>BJJ Gis</option>
          <option>Rash Guards</option>
          <option>Fight Shorts</option>
          <option>Protective Gear</option>
          <option>Custom Product</option>
        </select>
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
        <button className="button red wide">Send Inquiry</button>
        {sent && (
          <p className="success">
            Inquiry captured. Connect this form to your email or .NET API before
            launch.
          </p>
        )}
      </div>
    </form>
  );
}
