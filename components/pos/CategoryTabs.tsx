"use client";

import type { CategoryId } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";

interface CategoryTabsProps {
  active: CategoryId;
  onChange: (category: CategoryId) => void;
  webcamActive?: boolean;
  onToggleWebcam?: () => void;
  onAddProduct?: () => void;
  onManageProducts?: () => void;
  onViewOrders?: () => void;
}

const ACTION_BTN =
  "pos-btn min-h-10 shrink-0 rounded-xl px-3 py-2 text-sm font-bold uppercase tracking-wider sm:min-h-9";

export function CategoryTabs({
  active,
  onChange,
  webcamActive,
  onToggleWebcam,
  onAddProduct,
  onManageProducts,
  onViewOrders,
}: CategoryTabsProps) {
  return (
    <header className="pos-glass flex shrink-0 flex-col gap-2 border-b border-white/10 px-3 py-2.5 sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-2 sm:mr-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-500/30">
          A
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold leading-none text-white">Ayson POS</p>
          <p className="pos-label-light text-xs font-medium normal-case tracking-normal">Point of Sale</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pos-scroll [-webkit-overflow-scrolling:touch]">
        {CATEGORIES.map((category) => {
          const isActive = category.id === active;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={`pos-btn shrink-0 rounded-full px-3.5 py-2 text-xs font-bold tracking-wide sm:text-sm ${
                isActive
                  ? "bg-white text-slate-900 shadow-lg shadow-black/20"
                  : "bg-white/10 text-slate-100 hover:bg-white/15"
              }`}
              style={isActive ? { boxShadow: `0 0 0 2px ${category.color}40, 0 8px 20px -4px rgba(0,0,0,0.3)` } : undefined}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:ml-auto">
        {onViewOrders && (
          <button type="button" onClick={onViewOrders} className={`${ACTION_BTN} bg-white/15 text-white hover:bg-white/20`}>
            Orders
          </button>
        )}
        {onManageProducts && (
          <button type="button" onClick={onManageProducts} className={`${ACTION_BTN} bg-violet-600/90 text-white shadow-md shadow-violet-900/30 hover:bg-violet-500`}>
            List
          </button>
        )}
        {onAddProduct && (
          <button type="button" onClick={onAddProduct} className={`${ACTION_BTN} bg-amber-500 text-slate-900 shadow-md shadow-amber-900/20 hover:bg-amber-400`}>
            + Add
          </button>
        )}
        {onToggleWebcam && (
          <button
            type="button"
            onClick={onToggleWebcam}
            className={`${ACTION_BTN} ${
              webcamActive
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-900/30"
                : "bg-cyan-600/90 text-white hover:bg-cyan-500"
            }`}
          >
            {webcamActive ? "Cam On" : "Cam"}
          </button>
        )}
        <div className="hidden items-center gap-1.5 lg:flex">
          {[
            { label: "Pager", action: undefined },
            { label: "Tables", action: onViewOrders },
            { label: "Manager", action: onManageProducts ?? onAddProduct },
          ].map(({ label, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className={`${ACTION_BTN} bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
