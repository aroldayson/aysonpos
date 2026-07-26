"use client";

import type { CartItem } from "@/lib/types";
import { calcSubtotal, formatCurrency } from "@/lib/pos-utils";

interface OrderPanelProps {
  items: CartItem[];
  selectedItemId: string | null;
  keypadMode: "qty" | "cash";
  keypadValue: string;
  cashTendered: number;
  onSelectItem: (id: string) => void;
  onEditQuantity: (id: string) => void;
  onClearSelection: () => void;
  onIncreaseQuantity: (id: string) => void;
  onDecreaseQuantity: (id: string) => void;
  onRemoveItem: (id: string) => void;
  className?: string;
}

export function OrderPanel({
  items,
  selectedItemId,
  keypadMode,
  keypadValue,
  cashTendered,
  onSelectItem,
  onEditQuantity,
  onClearSelection,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  className = "",
}: OrderPanelProps) {
  const subtotal = calcSubtotal(items);
  const change = Math.max(0, cashTendered - subtotal);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside
      className={`pos-card-light flex w-full shrink-0 flex-col overflow-hidden rounded-none lg:mx-0 lg:my-0 lg:w-72 lg:rounded-2xl ${className}`}
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-4 py-3">
        <p className="pos-label pos-label-dark text-indigo-600">Current Sale</p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">
          {items.length === 0
            ? "Cart is empty"
            : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white pos-scroll">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <p className="text-base font-medium text-slate-600">Tap products or scan a barcode</p>
          </div>
        ) : (
          <ul className="space-y-2 p-3">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              const isSelected = item.id === selectedItemId;
              return (
                <li
                  key={item.id}
                  className={`rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200"
                      : "border-slate-100 bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectItem(item.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-base font-bold text-slate-900">{item.name}</span>
                      <span className="text-sm text-slate-600">{formatCurrency(item.price)} each</span>
                    </button>
                    <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-base font-bold text-slate-900 shadow-sm">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => onDecreaseQuantity(item.id)}
                        className="pos-btn flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit quantity of ${item.name}`}
                        onClick={() => onEditQuantity(item.id)}
                        className={`pos-btn min-w-10 rounded-lg px-2 py-1 text-center text-base font-bold transition-all ${
                          isSelected && keypadMode === "qty"
                            ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                            : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-indigo-50"
                        }`}
                      >
                        {isSelected && keypadMode === "qty" && keypadValue
                          ? keypadValue
                          : item.quantity}
                      </button>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => onIncreaseQuantity(item.id)}
                        className="pos-btn flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-200"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="pos-btn min-h-9 rounded-xl bg-red-50 px-3 text-sm font-bold text-red-600 ring-1 ring-red-100 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-end justify-between">
            <span className="text-base font-semibold text-slate-700">Total</span>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
          {cashTendered > 0 && (
            <>
              <div className="flex justify-between text-base text-slate-700">
                <span>Cash</span>
                <span className="font-medium">{formatCurrency(cashTendered)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>Change</span>
                <span>{formatCurrency(change)}</span>
              </div>
            </>
          )}
        </div>
        {selectedItemId && keypadMode === "qty" && (
          <p className="mt-3 text-center text-xs font-medium text-indigo-600">
            Type quantity on keypad · Enter to apply
          </p>
        )}
        {selectedItemId && keypadMode !== "qty" && (
          <button
            type="button"
            onClick={onClearSelection}
            className="pos-btn mt-3 w-full rounded-xl bg-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Clear selection
          </button>
        )}
      </div>
    </aside>
  );
}
