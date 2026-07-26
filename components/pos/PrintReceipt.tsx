"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";
import { formatCurrency } from "@/lib/pos-utils";

interface PrintReceiptProps {
  items: CartItem[];
  subtotal: number;
}

export function PrintReceipt({ items, subtotal }: PrintReceiptProps) {
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    setTimestamp(new Date().toLocaleString());
  }, [items, subtotal]);

  return (
    <div className="hidden print:block">
      <h1>Ayson POS Receipt</h1>
      <p suppressHydrationWarning>{timestamp}</p>
      <hr />
      {items.map((item) => (
        <p key={item.id}>
          {item.quantity}x {item.name} — {formatCurrency(item.price * item.quantity)}
        </p>
      ))}
      <hr />
      <p>
        <strong>Total: {formatCurrency(subtotal)}</strong>
      </p>
    </div>
  );
}
