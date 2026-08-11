"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";
const PAGE_SIZE = 21;

export default function ProductBrowser({ products }) {
  console.log("products", products.length)
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
  
  const cats = [
    "All",
    ...new Set(products.map((p) => p.category)),
  ];

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          // (cat === "All" || p.category === cat) &&
          p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [products, q, cat],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [q, cat, products]);

  const visibleProducts = useMemo(() => {
    return list.slice(0, visibleCount);
  }, [list, visibleCount]);

  const remainingProducts = Math.max(
    0,
    list.length - visibleCount,
  );

  const handleLoadMore = () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);

    window.setTimeout(() => {
      setVisibleCount((previous) =>
        Math.min(previous + PAGE_SIZE, list.length),
      );

      setIsLoadingMore(false);
    }, 450);
  };

  return (
    <div  ref={browserRef}>
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
          placeholder="Search products name..."
        />

        <LinkButton />
      </div>

      <div className="resultsBar">
        <span>
          Showing <strong>{visibleProducts.length}</strong> of{" "}
          <strong>{list.length}</strong>{" "}
          manufacturing-ready products
        </span>

        <span>
          No online ordering — request a quotation
        </span>
      </div>

      <div className="productGrid" 
      >
        {visibleProducts.map((p, index) => (
          <div
            key={p.slug}
            className="productReveal"
            style={{
              animationDelay: `${(index % PAGE_SIZE) * 35}ms`,
            }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {remainingProducts > 0 && (
        <div className="loadMoreWrapper">
          <button
            type="button"
            className="button navy loadMoreButton"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <span className="loadMoreSpinner" />
                Loading products...
              </>
            ) : (
              <>
                Load More
                <span className="loadMoreCount">
                  +
                  {Math.min(
                    PAGE_SIZE,
                    remainingProducts,
                  )}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function LinkButton() {
  return (
    <a className="button navy" href="/quote">
      Request custom product
    </a>
  );
}