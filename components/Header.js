"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="announcement">
        <span>OEM &amp; PRIVATE LABEL COMBAT SPORTS MANUFACTURING</span>
        <a href="mailto:sales@ironcladfightwear.com">
          sales@ironcladfightwear.com
        </a>
      </div>

      <header className="header">
        <div className="shell navRow">
        <button
            className="menuButton"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            ☰
          </button>
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brandMark">IC</span>
            <span>
              <b>IRONCLAD</b>
              <small>FIGHTWEAR</small>
            </span>
          </Link>

         

          <nav className={`nav ${open ? "open" : ""}`}>
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/products" onClick={() => setOpen(false)}>
              Products
            </Link>
            <Link href="/factory-tour" onClick={() => setOpen(false)}>
              Factory
            </Link>
            <Link href="/about" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link href="/wholesale" onClick={() => setOpen(false)}>
              Wholesale
            </Link>
            <Link href="/gallery" onClick={() => setOpen(false)}>
              Gallery
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)}>
              Insights
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </nav>

          <div className="navTools">
            <ThemeToggle />
            <Link className="navCta" href="/quote">
              Request Quote
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
