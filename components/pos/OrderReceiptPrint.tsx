"use client";

import type { SaleRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/pos-utils";

interface OrderReceiptPrintProps {
  order: SaleRecord;
}

function formatReceiptDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-PH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBillNo(id: string): string {
  const suffix = id.replace(/^sale-/, "");
  return suffix.slice(-8).toUpperCase();
}

export function OrderReceiptPrint({ order }: OrderReceiptPrintProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="order-receipt-print hidden print:block">
      <div className="receipt-body">
        <p className="receipt-title">AYSON POS</p>
        <p className="receipt-meta">Philippines</p>
        <p className="receipt-divider">--------------------------------</p>
        <p className="receipt-heading">Retail Invoice</p>
        <p className="receipt-meta">Date : {formatReceiptDate(order.createdAt)}</p>
        <p className="receipt-meta">Bill No: {formatBillNo(order.id)}</p>
        <p className="receipt-meta">Payment Mode: Cash</p>
        <p className="receipt-divider">--------------------------------</p>

        <div className="receipt-row receipt-row-head">
          <span className="receipt-col-item">Item</span>
          <span className="receipt-col-qty">Qty</span>
          <span className="receipt-col-amt">Amt</span>
        </div>
        <p className="receipt-divider">--------------------------------</p>

        {order.items.map((item) => (
          <div key={item.id} className="receipt-row">
            <span className="receipt-col-item">{item.name}</span>
            <span className="receipt-col-qty">{item.quantity}</span>
            <span className="receipt-col-amt">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}

        <p className="receipt-divider">--------------------------------</p>
        <div className="receipt-row">
          <span className="receipt-col-item">Sub Total</span>
          <span className="receipt-col-qty">{itemCount}</span>
          <span className="receipt-col-amt">{formatCurrency(order.subtotal)}</span>
        </div>
        <p className="receipt-divider">--------------------------------</p>

        <div className="receipt-row receipt-total">
          <span>TOTAL</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="receipt-row">
          <span>Cash</span>
          <span>{formatCurrency(order.cashTendered)}</span>
        </div>
        {order.change > 0 && (
          <div className="receipt-row">
            <span>Change</span>
            <span>{formatCurrency(order.change)}</span>
          </div>
        )}

        <p className="receipt-divider">--------------------------------</p>
        <p className="receipt-footer">Thank you — come again!</p>
        <p className="receipt-footer-small">E &amp; O.E</p>
      </div>
    </div>
  );
}
