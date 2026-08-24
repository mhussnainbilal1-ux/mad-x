"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProductList } from "./ProductListProvider";

function getSizeSuggestions(product) {
  const description =
    `${product?.name || ""} ${product?.type || ""} ${product?.subCategory || ""}`.toLowerCase();
  if (
    description.includes("boxing glove") ||
    description.includes("sparring glove")
  ) {
    return ["8 oz", "10 oz", "12 oz", "14 oz", "16 oz", "18 oz"];
  }
  if (
    description.includes("apparel") ||
    description.includes("shirt") ||
    description.includes("short") ||
    description.includes("top") ||
    description.includes("hoodie") ||
    description.includes("vest") ||
    description.includes("bottom")
  ) {
    return ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
  }
  return ["One Size", "XS", "S", "M", "L", "XL", "Custom"];
}

export default function ProductOptionsModal() {
  const {
    selectedProduct: product,
    closeProduct,
    addItem,
    openDrawer,
  } = useProductList();
  const [listType, setListType] = useState("sample");
  const [rows, setRows] = useState([{ size: "", units: 1 }]);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const suggestions = useMemo(() => getSizeSuggestions(product), [product]);

  useEffect(() => {
    if (!product) return;
    setListType("sample");
    setRows([{ size: "", units: 1 }]);
    setError("");
    document.body.classList.add("listOverlayOpen");
    window.setTimeout(() => dialogRef.current?.focus(), 0);
    const onKeyDown = (event) => event.key === "Escape" && closeProduct();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("listOverlayOpen");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product, closeProduct]);

  if (!product) return null;

  function updateRow(index, field, value) {
    setRows((current) =>
      current?.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]:
                field === "units" ? Math.max(1, Number(value) || 1) : value,
            }
          : row,
      ),
    );
  }

  function submit(event) {
    event.preventDefault();
    const selections = rows?.map((row) => ({
      size: row.size.trim(),
      units: Math.max(1, Number(row.units)),
    }));
    if (selections.some((row) => !row.size)) {
      setError("Please choose or enter a size for every row.");
      return;
    }
    addItem({
      listType,
      product: {
        slug: product.slug,
        name: product.name,
        image: product.image,
        category: product.category,
        type: product.type,
      },
      selections,
    });
    closeProduct();
    openDrawer();
  }

  return (
    <div
      className="productModalBackdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && closeProduct()
      }
    >
      <section
        className="productOptionsModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-options-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button
          type="button"
          className="listIconButton modalClose"
          onClick={closeProduct}
          aria-label="Close product options"
        >
          <X size={20} />
        </button>
        <div className="productModalIntro">
          <div className="productModalImage">
            <Image src={product.image} alt={product.name} fill sizes="120px" />
          </div>
          <div>
            <span className="productModalEyebrow">Configure product</span>
            <h2 id="product-options-title">{product.name}</h2>
            <p>
              {product.category} · {product.type}
            </p>
          </div>
        </div>
        <form onSubmit={submit}>
          <fieldset className="listTypePicker">
            <legend>Add this product to</legend>
            <label className={listType === "sample" ? "active" : ""}>
              <input
                type="radio"
                name="list-type"
                value="sample"
                checked={listType === "sample"}
                onChange={() => setListType("sample")}
              />
              Sample list
            </label>
            <label className={listType === "order" ? "active" : ""}>
              <input
                type="radio"
                name="list-type"
                value="order"
                checked={listType === "order"}
                onChange={() => setListType("order")}
              />
              Order list
            </label>
          </fieldset>
          <div className="sizeRowsHeader">
            <b>Size and units</b>
            <span>Add one row for each required size.</span>
          </div>
          <datalist id="product-size-suggestions">
            {suggestions?.map((size) => (
              <option value={size} key={size} />
            ))}
          </datalist>
          <div className="sizeRows">
            {rows?.map((row, index) => (
              <div className="sizeRow" key={index}>
                <label>
                  <span>Size</span>
                  <input
                    list="product-size-suggestions"
                    value={row.size}
                    onChange={(event) =>
                      updateRow(index, "size", event.target.value)
                    }
                    placeholder={suggestions[0]}
                    autoFocus={index === 0}
                  />
                </label>
                <label>
                  <span>Units</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={row.units}
                    onChange={(event) =>
                      updateRow(index, "units", event.target.value)
                    }
                  />
                </label>
                {rows?.length > 1 && (
                  <button
                    type="button"
                    className="removeSizeRow"
                    onClick={() =>
                      setRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                    aria-label={`Remove size row ${index + 1}`}
                  >
                    <Minus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="addSizeRow"
            onClick={() =>
              setRows((current) => [...current, { size: "", units: 1 }])
            }
          >
            <Plus size={17} /> Add another size
          </button>
          {error && (
            <p className="productModalError" role="alert">
              {error}
            </p>
          )}
          <button className="button red productModalSubmit" type="submit">
            Add to {listType} list
          </button>
        </form>
      </section>
    </div>
  );
}
