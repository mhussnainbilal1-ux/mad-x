"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MadXLogo from "@/components/Logo";
import { madxCategories } from "@/data/madxCategories";
import { ClipboardList } from "lucide-react";
import { useProductList } from "./ProductListProvider";

const alphabeticalCategories = [...madxCategories].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export default function Header({ hasCatalogueAccess = false }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [apparelOpen, setApparelOpen] = useState(false);
  const [apparelGroupOpen, setApparelGroupOpen] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { items, openDrawer, canUseProductLists } = useProductList();

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);

    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isNavigating) return;

    const timeout = window.setTimeout(() => setIsNavigating(false), 10000);
    return () => window.clearTimeout(timeout);
  }, [isNavigating]);

  function startMobileNavigation(event) {
    setOpen(false);
    setCategoriesOpen(false);
    setExploreOpen(false);
    setApparelOpen(false);
    setApparelGroupOpen("");

    if (!isMobile) return;

    const destination = new URL(event.currentTarget.href, window.location.href);
    if (
      destination.pathname === window.location.pathname &&
      destination.search === window.location.search
    ) {
      return;
    }

    setIsNavigating(true);
  }

  function openCatalogueAccess() {
    setOpen(false);

    if (pathname.startsWith("/products")) {
      window.dispatchEvent(new Event("open-catalogue-access"));
      return;
    }

    if (isMobile) setIsNavigating(true);
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
              if (open) {
                setCategoriesOpen(false);
                setExploreOpen(false);
                setApparelOpen(false);
                setApparelGroupOpen("");
              }
            }}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            ☰
          </button>
          <Link href="/" className="brand" onClick={startMobileNavigation}>
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
            <Link href="/" onClick={startMobileNavigation}>
              Home
            </Link>
            <Link href="/products" onClick={startMobileNavigation}>
              Products
            </Link>
            {!hasCatalogueAccess && (
              <button
                className="navUnlockMobile"
                type="button"
                onClick={openCatalogueAccess}
                data-activity-event="catalogue_unlock_click"
              >
                🔓 Unlock Full Catalogue
              </button>
            )}
            <div className={`navDropdown ${categoriesOpen ? "open" : ""}`}>
              <button
                type="button"
                className="navDropdownToggle"
                onClick={() => {
                  setCategoriesOpen(!categoriesOpen);
                  setExploreOpen(false);
                  if (categoriesOpen) {
                    setApparelOpen(false);
                    setApparelGroupOpen("");
                  }
                }}
                aria-expanded={categoriesOpen}
                aria-controls="category-navigation"
              >
                Categories
              </button>
              <div className="navDropdownMenu" id="category-navigation">
                {alphabeticalCategories.map((category) => {
                  if (category.slug !== "apparel") {
                    return (
                      <Link
                        key={category.slug}
                        href={`/products?category=${encodeURIComponent(category.name)}`}
                        onClick={startMobileNavigation}
                      >
                        {category.name}
                      </Link>
                    );
                  }

                  return (
                    <div
                      className={`navCascadeItem ${apparelOpen ? "open" : ""}`}
                      key={category.slug}
                    >
                      <div className="navCascadeTrigger">
                        <Link
                          href={`/products?category=${encodeURIComponent(category.name)}`}
                          onClick={startMobileNavigation}
                        >
                          {category.name}
                        </Link>
                        <button
                          type="button"
                          aria-label="Show Apparel categories"
                          aria-expanded={apparelOpen}
                          onClick={() => {
                            setApparelOpen((value) => !value);
                            setApparelGroupOpen("");
                          }}
                        >
                          ›
                        </button>
                      </div>

                      <div className="navCascadeMenu navApparelCascade">
                        {category.groups.map((group) => (
                          <div
                            className={`navCascadeItem ${
                              apparelGroupOpen === group.name ? "open" : ""
                            }`}
                            key={group.name}
                          >
                            <div className="navCascadeTrigger">
                              <Link
                                href={`/products?category=${encodeURIComponent(
                                  category.name,
                                )}&subCategory=${encodeURIComponent(group.name)}`}
                                onClick={startMobileNavigation}
                              >
                                {group.name}
                              </Link>
                              <button
                                type="button"
                                aria-label={`Show ${group.name} product types`}
                                aria-expanded={apparelGroupOpen === group.name}
                                onClick={() =>
                                  setApparelGroupOpen((value) =>
                                    value === group.name ? "" : group.name,
                                  )
                                }
                              >
                                ›
                              </button>
                            </div>

                            <div className="navCascadeMenu navProductTypeCascade">
                              {group.items.map((item) => (
                                <Link
                                  key={item}
                                  href={`/products?category=${encodeURIComponent(
                                    category.name,
                                  )}&subCategory=${encodeURIComponent(item)}`}
                                  onClick={startMobileNavigation}
                                >
                                  {item}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="navSportLinks" aria-label="Custom teamwear">
              <Link
                className="navSportLink"
                href="/rugby"
                onClick={startMobileNavigation}
              >
                Rugby
              </Link>
              <Link
                className="navSportLink"
                href="/ice-hockey"
                onClick={startMobileNavigation}
              >
                Ice Hockey
              </Link>
              <Link
                className="navSportLink"
                href="/soccer"
                onClick={startMobileNavigation}
              >
                Soccer
              </Link>
            </div>
            <div className={`navDropdown ${exploreOpen ? "open" : ""}`}>
              <button
                type="button"
                className="navDropdownToggle"
                onClick={() => {
                  setExploreOpen(!exploreOpen);
                  setCategoriesOpen(false);
                  setApparelOpen(false);
                  setApparelGroupOpen("");
                }}
                aria-expanded={exploreOpen}
                aria-controls="explore-navigation"
              >
                Explore
              </button>
              <div className="navDropdownMenu" id="explore-navigation">
                <Link href="/factory-tour" onClick={startMobileNavigation}>
                  Factory
                </Link>
                <Link href="/about" onClick={startMobileNavigation}>
                  About
                </Link>
                <Link href="/wholesale" onClick={startMobileNavigation}>
                  Wholesale
                </Link>
                <Link href="/gallery" onClick={startMobileNavigation}>
                  Gallery
                </Link>
                <Link href="/blog" onClick={startMobileNavigation}>
                  Insights
                </Link>
              </div>
            </div>
            <Link href="/contact" onClick={startMobileNavigation}>
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
                data-activity-event="catalogue_unlock_click"
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
      {isNavigating && (
        <div className="mobileNavigationLoader" role="status" aria-live="polite">
          <span className="mobileNavigationSpinner" aria-hidden="true" />
          <span>Loading page…</span>
        </div>
      )}
    </>
  );
}
