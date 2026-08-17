"use client";
import Image from 'next/image'
import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MadXLogo from "@/components/Logo"
import { rdxCategories } from "@/data/rdxCategories";
export default function Header() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);

    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <>
      <div className="announcement">
        <span>OEM &amp; PRIVATE LABEL COMBAT SPORTS MANUFACTURING</span>
        <a href="mailto:sales@madxsports.com">
          sales@madxsports.com
        </a>
      </div>

      <header className="header">
        <div className="shell navRow">
          <button
            className="menuButton"
            onClick={() => {
              setOpen(!open);
              if (open) setCategoriesOpen(false);
            }}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            ☰
          </button>
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
           <Image
              src="/images/common/logo2.png"
              alt="MADX Sports"
              width={200}
              height={80}
              priority
              sizes="200px"
              style={{
                width: "200px",
                height: "auto",
                marginLeft: isMobile ? "32px" : "-32px"
              }}
            />
          </Link>



          <nav className={`nav ${open ? "open" : ""}`}>
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/products" onClick={() => setOpen(false)}>
              Products
            </Link>
            <div className={`navDropdown ${categoriesOpen ? "open" : ""}`}>
              <button
                type="button"
                className="navDropdownToggle"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                aria-expanded={categoriesOpen}
                aria-controls="category-navigation"
              >
                Categories
              </button>
              <div className="navDropdownMenu" id="category-navigation">
                {rdxCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    onClick={() => {
                      setCategoriesOpen(false);
                      setOpen(false);
                    }}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
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
