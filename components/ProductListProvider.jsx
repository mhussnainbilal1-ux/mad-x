"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "madx-product-lists-v1";
const ProductListContext = createContext(null);

export function ProductListProvider({ children, canUseProductLists = false }) {
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // A blocked or invalid local store should not stop the list from working.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Keep the in-memory list available if browser storage is unavailable.
    }
  }, [hydrated, items]);

  const value = useMemo(
    () => ({
      items,
      canUseProductLists,
      selectedProduct,
      drawerOpen,
      openProduct: setSelectedProduct,
      closeProduct: () => setSelectedProduct(null),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem(item) {
        setItems((current) => [
          ...current,
          {
            ...item,
            id: `${item.listType}-${item.product.slug}-${Date.now()}`,
          },
        ]);
      },
      updateItem(id, selections) {
        setItems((current) =>
          current?.map((item) =>
            item.id === id ? { ...item, selections } : item,
          ),
        );
      },
      removeItem: (id) =>
        setItems((current) => current.filter((item) => item.id !== id)),
      clearList: (listType) =>
        setItems((current) =>
          current.filter((item) => item.listType !== listType),
        ),
    }),
    [canUseProductLists, drawerOpen, items, selectedProduct],
  );

  return (
    <ProductListContext.Provider value={value}>
      {children}
    </ProductListContext.Provider>
  );
}

export function useProductList() {
  const context = useContext(ProductListContext);
  if (!context)
    throw new Error("useProductList must be used inside ProductListProvider");
  return context;
}
