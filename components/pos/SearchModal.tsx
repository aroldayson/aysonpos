"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/pos-utils";
import { isManualPriceProduct } from "@/lib/product-catalog";
interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
  products: Product[];
}

export function SearchModal({ open, onClose, onSelect, products }: SearchModalProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.includes(q),
    );
  }, [query, products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 sm:items-start sm:justify-center sm:p-4 sm:pt-16">
      <div className="flex h-full flex-col bg-white sm:h-auto sm:max-h-[85dvh] sm:w-full sm:max-w-xl sm:overflow-hidden sm:rounded-xl sm:shadow-2xl">
        <div className="flex items-center gap-2 border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <input
            autoFocus
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or barcode..."
            className="pos-input min-h-11 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 shrink-0 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 active:bg-slate-300"
          >
            Close
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto sm:max-h-80">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-base text-slate-600">No products found</li>
          ) : (
            results.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(product);
                    onClose();
                    setQuery("");
                  }}
                  className="flex w-full min-h-[52px] items-center justify-between border-b px-4 py-3 text-left active:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">
                      {isManualPriceProduct(product) ? "Manual price at sale" : product.barcode}
                    </p>
                  </div>
                  <span className="font-bold text-slate-800">
                    {isManualPriceProduct(product) ? "Manual" : formatCurrency(product.price)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
