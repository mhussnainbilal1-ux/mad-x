import Link from "next/link";
import { getProductRange } from "../lib/common";

export default function RangeProducts({ index, skipType }) {
  const range = getProductRange(index, skipType)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        width: "100%",
        paddingTop: "10px"
      }}
    >
      {range.map((product) => (
        <Link
          href={`/products/${product.slug}`}
          key={product.slug}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              background: "var(--card-bg)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "contain",
              }}
            />

            <span>{product.name}</span>
          </div>
        </Link>
      ))}
    </div>

  );
}