"use client";

import { Plus } from "lucide-react";
import { useProductList } from "./ProductListProvider";

export default function ProductDetailAddButton({ product }) {
  const { openProduct, canUseProductLists } = useProductList();

  if (!canUseProductLists) return null;

  return (
    <button
      type="button"
      className="button navy productDetailAddButton"
      onClick={() => openProduct(product)}
    >
      <Plus size={20} strokeWidth={2.5} />
      Add to sample or order list
    </button>
  );
}
