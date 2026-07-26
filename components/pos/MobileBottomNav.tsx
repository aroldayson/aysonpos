"use client";

import { formatCurrency } from "@/lib/pos-utils";

export type MobileView = "products" | "cart" | "pay";

interface MobileBottomNavProps {
  active: MobileView;
  itemCount: number;
  subtotal: number;
  onChange: (view: MobileView) => void;
}

const TABS: { id: MobileView; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "cart", label: "Cart" },
  { id: "pay", label: "Pay" },
];

export function MobileBottomNav({
  active,
  itemCount,
  subtotal,
  onChange,
}: MobileBottomNavProps) {
  return (
    <nav className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      <div className="pos-glass grid grid-cols-3 overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`pos-btn relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 py-2 transition-all ${
                isActive
                  ? "bg-indigo-500/40 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider sm:text-sm">{tab.label}</span>
              {tab.id === "cart" && itemCount > 0 && (
                <span className="absolute right-[22%] top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-xs font-bold text-white shadow-md">
                  {itemCount}
                </span>
              )}
              {tab.id === "pay" && subtotal > 0 && (
                <span className="text-xs font-bold text-emerald-300">{formatCurrency(subtotal)}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
