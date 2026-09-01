"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const galleryItems = [
  {
    title: "Boxing Equipment Collection",
    category: "Boxing",
    description: "Gloves, coaching equipment and protection developed as a coordinated range.",
    image: "/images/common/gallery/boxing-collection.png",
    href: "/products?category=Boxing",
  },
  {
    title: "Protective Equipment Range",
    category: "Boxing",
    description: "Headguards, shin guards and body protection developed as a coordinated range.",
    image: "/images/common/gallery/protective-equipment.png",
    href: "/products?category=Boxing&subCategory=Protective%20Gear",
  },
  {
    title: "Coaching Equipment",
    category: "Boxing",
    description: "Focus mitts, paddles and body shields constructed for repeated training use.",
    image: "/images/common/gallery/coaching-equipment.png",
    href: "/products?category=Boxing&subCategory=Coaching%20Equipment",
  },
  {
    title: "Punch Bag Range",
    category: "Boxing",
    description: "Heavy, uppercut and double-end bag formats with reinforced suspension details.",
    image: "/images/common/gallery/punch-bag-range.png",
    href: "/products?category=Boxing&subCategory=Punch%20Bags",
  },
  {
    title: "MMA Training Collection",
    category: "MMA",
    description: "Open-palm gloves, shin protection and fightwear for an integrated MMA range.",
    image: "/images/common/gallery/mma-collection.png",
    href: "/products?category=MMA",
  },
  {
    title: "Fitness Accessories",
    category: "Fitness",
    description: "Weightlifting belts, gym gloves, straps and weighted-training accessories.",
    image: "/images/common/gallery/fitness-accessories.png",
    href: "/products?category=Fitness",
  },
  {
    title: "Performance Apparel",
    category: "Activewear",
    description: "Rashguards, training shirts and fight shorts developed around custom artwork.",
    image: "/images/common/gallery/performance-apparel.png",
    href: "/products?category=Activewear",
  },
  {
    title: "Product Development",
    category: "Manufacturing",
    description: "Patterns, materials, foam and prototype details reviewed before production.",
    image: "/images/common/gallery/product-development.png",
    href: "/factory-tour",
  },
  {
    title: "Material Cutting",
    category: "Manufacturing",
    description: "Patterns and approved materials prepared into accurate production panels.",
    image: "/images/common/gallery/material-cutting.png",
    href: "/factory-tour#factory-process",
  },
  {
    title: "Stitching & Assembly",
    category: "Manufacturing",
    description: "Product panels, piping and reinforcements assembled at a specialist workstation.",
    image: "/images/common/gallery/stitching-assembly.png",
    href: "/factory-tour#factory-process",
  },
  {
    title: "Custom Branding",
    category: "Manufacturing",
    description: "Artwork, heat transfers, labels and trims prepared around approved brand details.",
    image: "/images/common/gallery/custom-branding.png",
    href: "/factory-tour#factory-process",
  },
  {
    title: "Quality Control & Packing",
    category: "Manufacturing",
    description: "Construction and measurements checked before products are prepared for dispatch.",
    image: "/images/common/gallery/quality-control-packing.png",
    href: "/factory-tour",
  },
];

const categories = [
  "All",
  "Boxing",
  "MMA",
  "Fitness",
  "Activewear",
  "Manufacturing",
];

export default function GalleryShowcase() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(null);

  const visibleItems = useMemo(
    () =>
      activeCategory === "All"
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  const activeItem = activeIndex === null ? null : visibleItems[activeIndex];

  useEffect(() => {
    if (!activeItem) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % visibleItems.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + visibleItems.length) % visibleItems.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItem, visibleItems.length]);

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + visibleItems.length) % visibleItems.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % visibleItems.length);
  };

  return (
    <section className="section galleryShowcase" id="gallery-showcase">
      <div className="shell">
        <div className="heading">
          <div>
            <span className="kicker dark">Explore our capabilities</span>
            <h2>Products and production up close</h2>
          </div>
          <p>
            Filter the gallery by category, select an image for a closer view,
            or continue to the related catalogue range.
          </p>
        </div>

        <div className="galleryFilters" aria-label="Filter gallery">
          {categories?.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "active" : ""}
              onClick={() => {
                setActiveCategory(category);
                setActiveIndex(null);
              }}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="galleryEditorialGrid">
          {visibleItems?.map((item, index) => (
            <article
              className={`galleryEditorialCard ${index === 0 && visibleItems.length > 2 ? "featured" : ""}`}
              key={item.title}
            >
              <button
                className="galleryImageButton"
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open ${item.title}`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={index === 0 && visibleItems.length > 2
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "(max-width: 768px) 100vw, 33vw"}
                  quality={72}
                />
                <span className="galleryZoom" aria-hidden="true">＋</span>
              </button>
              <div className="galleryCardBody">
                <div>
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <Link href={item.href}>View range →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeItem && (
        <div className="galleryLightbox" role="presentation" onClick={() => setActiveIndex(null)}>
          <div
            className="galleryLightboxDialog"
            role="dialog"
            aria-modal="true"
            aria-label={activeItem.title}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="galleryLightboxClose"
              onClick={() => setActiveIndex(null)}
              aria-label="Close image"
            >
              ×
            </button>
            <img src={activeItem.image} alt={activeItem.title} />
            <div className="galleryLightboxCaption">
              <div>
                <span>{activeItem.category}</span>
                <h3>{activeItem.title}</h3>
              </div>
              <Link href={activeItem.href}>View related range →</Link>
            </div>
            {visibleItems.length > 1 && (
              <>
                <button
                  type="button"
                  className="galleryLightboxArrow previous"
                  onClick={showPrevious}
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="galleryLightboxArrow next"
                  onClick={showNext}
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
