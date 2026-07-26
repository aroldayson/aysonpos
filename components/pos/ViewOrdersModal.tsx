"use client";

import { useEffect, useRef, useState } from "react";
import type { SaleRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/pos-utils";
import { getSaleRecords } from "@/lib/db/repository";
import { OrderReceiptPrint } from "./OrderReceiptPrint";

interface ViewOrdersModalProps {
  open: boolean;
  onClose: () => void;
}

function formatOrderDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ViewOrdersModal({ open, onClose }: ViewOrdersModalProps) {
  const [orders, setOrders] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [printOrder, setPrintOrder] = useState<SaleRecord | null>(null);
  const printStarted = useRef(false);

  useEffect(() => {
    if (!open) {
      setExpandedId(null);
      setQuery("");
      setPrintOrder(null);
      printStarted.current = false;
      return;
    }

    setLoading(true);
    getSaleRecords(100)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!printOrder) {
      printStarted.current = false;
      return;
    }
    if (printStarted.current) return;
    printStarted.current = true;

    const timer = window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        setPrintOrder(null);
        printStarted.current = false;
      }, 300);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [printOrder]);

  const handlePrintOrder = (order: SaleRecord, event: React.MouseEvent) => {
    event.stopPropagation();
    setPrintOrder(order);
  };

  if (!open) return null;

  const filtered = orders.filter((order) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const itemText = order.items.map((item) => item.name).join(" ").toLowerCase();
    return (
      itemText.includes(q) ||
      formatOrderDate(order.createdAt).toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q)
    );
  });

  const totalRevenue = filtered.reduce((sum, order) => sum + order.subtotal, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 sm:items-center sm:justify-center sm:p-4">
      {printOrder && <OrderReceiptPrint order={printOrder} />}
      <div className="flex h-full flex-col bg-white sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-2xl sm:overflow-hidden sm:rounded-xl sm:shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div>
            <h2 className="text-lg font-bold text-slate-900">View Orders</h2>
            <p className="text-sm text-slate-600">
              {filtered.length} order{filtered.length === 1 ? "" : "s"}
              {filtered.length > 0 && ` · ${formatCurrency(totalRevenue)} total`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 active:bg-slate-300"
          >
            Close
          </button>
        </div>

        <div className="border-b px-4 py-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders or items..."
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-10 text-center text-base text-slate-600">Loading orders…</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-base text-slate-600">
              {orders.length === 0 ? "No completed orders yet." : "No matching orders."}
            </p>
          ) : (
            <ul>
              {filtered.map((order) => {
                const isExpanded = expandedId === order.id;
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <li key={order.id} className="border-b">
                    <div className="flex items-start gap-2 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left active:opacity-80"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-slate-900">{formatOrderDate(order.createdAt)}</p>
                          <p className="text-sm text-slate-600">
                            {itemCount} item{itemCount === 1 ? "" : "s"} · Cash {formatCurrency(order.cashTendered)}
                            {order.change > 0 && ` · Change ${formatCurrency(order.change)}`}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold text-slate-900">{formatCurrency(order.subtotal)}</p>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            {isExpanded ? "Hide" : "Details"}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => handlePrintOrder(order, event)}
                        className="shrink-0 self-center rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white active:bg-sky-500"
                      >
                        Print
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t bg-slate-50 px-4 py-3">
                        <ul className="space-y-2">
                          {order.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center justify-between text-base text-slate-800"
                            >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-semibold">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>Total</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-base text-slate-700">
                            <span>Cash tendered</span>
                            <span>{formatCurrency(order.cashTendered)}</span>
                          </div>
                          {order.change > 0 && (
                            <div className="flex justify-between text-emerald-700">
                              <span>Change</span>
                              <span>{formatCurrency(order.change)}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => handlePrintOrder(order, event)}
                          className="mt-3 w-full min-h-10 rounded-lg bg-sky-600 text-sm font-bold text-white active:bg-sky-500"
                        >
                          Print Order
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
