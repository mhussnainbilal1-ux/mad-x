"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
const PAGE_SIZE = 21;

export default function ProductBrowser({ products }) {
  const [q, setQ] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const searchParams = useSearchParams();
  const browserRef = useRef(null);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      browserRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [searchParams]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const matches = query
      ? products.filter((product) =>
          [
            product.name,
            product.type,
            product.category,
            product.subCategory,
            product.materials,
          ].some((value) => value?.toLowerCase().includes(query)),
        )
      : [...products];

    return matches;
  }, [products, q]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [q, products]);

  const visibleProducts = useMemo(() => {
    return list.slice(0, visibleCount);
  }, [list, visibleCount]);

  const remainingProducts = Math.max(0, list.length - visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((previous) => Math.min(previous + PAGE_SIZE, list.length));
  };

  return (
    <div ref={browserRef}>
      <div
        className="filters"
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Search products..."
          aria-label="Search products"
        />

        <LinkButton />
      </div>

      <div className="resultsBar" aria-live="polite">
        <span>
          Showing <strong>{visibleProducts.length}</strong> of{" "}
          <strong>{list.length}</strong> manufacturing-ready products
        </span>

        <span>No online ordering — request a quotation</span>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="productGrid">
          {visibleProducts.map((p, index) => (
            <div
              key={p.slug}
              className="productReveal"
              style={{ animationDelay: `${(index % PAGE_SIZE) * 35}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="emptyProducts">
          <h3>No matching products</h3>
          <p>Try a different product name, type, material or category.</p>
          <button
            className="button navy"
            type="button"
            onClick={() => setQ("")}
          >
            Clear search
          </button>
        </div>
      )}

      {remainingProducts > 0 && (
        <div className="loadMoreWrapper">
          <button
            type="button"
            className="button navy loadMoreButton"
            onClick={handleLoadMore}
          >
            Load More
            <span className="loadMoreCount">
              +{Math.min(PAGE_SIZE, remainingProducts)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function LinkButton() {
  return (
    <Link className="button navy" href="/quote">
      Request custom product
    </Link>
  );
}
