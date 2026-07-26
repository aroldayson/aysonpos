"use client";

import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/pos-utils";
import { isManualPriceProduct } from "@/lib/product-catalog";

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onSearch: () => void;
  onScan?: () => void;
  onAddProduct?: () => void;
  className?: string;
}

const TOOLBAR_BTN =
  "pos-btn rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider sm:text-sm";

export function ProductGrid({
  products,
  onSelect,
  onSearch,
  onScan,
  onAddProduct,
  className = "",
}: ProductGridProps) {
  return (
    <section className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${className}`}>
      <div className="mx-2 mt-2 flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm lg:mx-0 lg:mt-0 lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:px-4 lg:py-3">
        <div className="min-w-0">
          <span className="pos-label pos-label-light text-indigo-200">Menu</span>
          <p className="text-base font-bold text-white">{products.length} items</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {onAddProduct && (
            <button type="button" onClick={onAddProduct} className={`${TOOLBAR_BTN} bg-amber-500 text-slate-900`}>
              + Add
            </button>
          )}
          {onScan && (
            <button type="button" onClick={onScan} className={`${TOOLBAR_BTN} bg-cyan-600 text-white sm:hidden`}>
              Scan
            </button>
          )}
          <button type="button" onClick={onSearch} className={`${TOOLBAR_BTN} bg-white/15 text-white hover:bg-white/25`}>
            Search
          </button>
        </div>
      </div>

      <div className="pos-product-grid min-h-0 flex-1 overflow-y-auto p-2 pos-scroll lg:p-3">
        {products.length === 0 ? (
          <div className="col-span-full flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
            <p className="text-base font-semibold text-white">No products in this category</p>
            <p className="mt-1 text-sm text-slate-300">Tap + Add to create one</p>
          </div>
        ) : (
          products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className="pos-btn pos-product-tile flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center shadow-lg ring-1 ring-white/20 transition-all hover:shadow-xl active:scale-[0.98]"
              style={{
                backgroundColor: product.color,
                color: getTextColor(product.color),
              }}
            >
              <span className="line-clamp-3 w-full text-sm font-bold leading-snug sm:text-base">
                {product.name}
              </span>
              <span className="mt-1 shrink-0 rounded-full bg-black/35 px-2.5 py-0.5 text-xs font-bold sm:text-sm">
                {isManualPriceProduct(product) ? "Manual" : formatCurrency(product.price)}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1e293b" : "#ffffff";
}
