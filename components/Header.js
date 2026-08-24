"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MadXLogo from "@/components/Logo";
import { madxCategories } from "@/data/madxCategories";
import { ClipboardList } from "lucide-react";
import { useProductList } from "./ProductListProvider";
export default function Header({ hasCatalogueAccess = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { items, openDrawer, canUseProductLists } = useProductList();

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);

    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  function openCatalogueAccess() {
    setOpen(false);

    if (pathname.startsWith("/products")) {
      window.dispatchEvent(new Event("open-catalogue-access"));
      return;
    }

    router.push("/products?unlock=1");
  }

  return (
    <>
      <div className="announcement">
        <span>OEM &amp; PRIVATE LABEL COMBAT SPORTS MANUFACTURING</span>
        <a href="mailto:admin.madx@gmail.com">admin.madx@gmail.com</a>
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
                marginLeft: isMobile ? "32px" : "-32px",
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
            {!hasCatalogueAccess && (
              <button
                className="navUnlockMobile"
                type="button"
                onClick={openCatalogueAccess}
              >
                🔓 Unlock Full Catalogue
              </button>
            )}
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
                {madxCategories.map((category) => (
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
            {canUseProductLists && (
              <button
                type="button"
                className="headerListButton"
                onClick={openDrawer}
                aria-label={`Open product lists with ${items.length} entries`}
                title="Sample and order lists"
              >
                <ClipboardList size={19} />
                <span>Lists</span>
                {items.length > 0 && <b>{items.length}</b>}
              </button>
            )}
            {!hasCatalogueAccess && (
              <button
                className="navUnlock"
                type="button"
                onClick={openCatalogueAccess}
              >
                🔓 Unlock Full Catalogue
              </button>
            )}
            <Link className="navCta" href="/quote">
              Quote
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
