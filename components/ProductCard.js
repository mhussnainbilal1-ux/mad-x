"use client";

import Link from "next/link";
import { getProductSeries } from "../util/common";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useProductList } from "./ProductListProvider";
export default function ProductCard({ product }) {
  const series = getProductSeries(product.index);
  const { openProduct, canUseProductLists } = useProductList();

  return (
    <article className="productCard">
      {canUseProductLists && (
        <button
          type="button"
          className="productQuickAdd"
          onClick={() => openProduct(product)}
          aria-label={`Add ${product.name} to a product list`}
          title="Add to sample or order list"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      )}
      <Link href={`/products/${product.slug}`} className="productMedia">
        <Image
          src={product.image}
          alt={product.name}
          width={500}
          height={500}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          quality={72}
        />
        {series && <span className="pill">{series}</span>}
      </Link>
      <div className="productBody">
        <span className="productCategory">{product.category}</span>
        <h3>{product.name}</h3>

        {/* <h3> {getProductSeries(product.index)}</h3> */}

        <div className="productBottom">
          <span
            title={product.type}
            style={{
              display: "inline-block",
              maxWidth: "140px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "default",
              verticalAlign: "bottom",
            }}
          >
            {/* {getProductSeries(product.index)} */}
            {product.type}
          </span>
          <Link href={`/products/${product.slug}`}>View details →</Link>
        </div>
      </div>
    </article>
  );
}
