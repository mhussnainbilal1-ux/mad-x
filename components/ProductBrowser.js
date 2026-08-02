"use client";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
export default function ProductBrowser({ products }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [products, q, cat],
  );
  return (
    <>
      <div className="filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {cats.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <LinkButton />
      </div>
      <div className="resultsBar">
        <span>{list.length} manufacturing-ready products</span>
        <span>No online ordering — request a quotation</span>
      </div>
      <div className="productGrid">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}
function LinkButton() {
  return (
    <a className="button navy" href="/quote">
      Request custom product
    </a>
  );
}
