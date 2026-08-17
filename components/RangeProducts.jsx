"use client"
import Link from "next/link";
import Image from "next/image";
import { getProductRange } from "../lib/common";

export default function RangeProducts({ index, skipType }) {
  const range = getProductRange(index, skipType)

  return (
    <>
    {
      range.length>0 &&   <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: "24px 0 14px",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "26px",
          borderRadius: "10px",
          background: "#E51B2A",
          animation: "relatedPulse 1.8s ease-in-out infinite",
        }}
      />
    
      <p
        style={{
          margin: 0,
          fontSize: "20px",
          fontWeight: "700",
          color: "var(--ink)",
          letterSpacing: "0.3px",
        }}
      >
        Related Products
      </p>
    
      <style jsx>{`
        @keyframes relatedPulse {
          0%, 100% {
            transform: scaleY(1);
            opacity: 1;
          }
    
          50% {
            transform: scaleY(0.65);
            opacity: 0.55;
          }
        }
      `}</style>
    </div>
    }
  
   
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
            <Image
              src={product.image}
              alt={product.name}
              width={50}
              height={50}
              sizes="50px"
              quality={65}
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
    </>

  );
}
