"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryId, Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";
import { previewBarcode } from "@/lib/product-catalog";
import type { NewProductInput } from "@/lib/product-catalog";
import { BarcodeDisplay } from "./BarcodeDisplay";

interface AddProductModalProps {
  open: boolean;
  defaultCategory: CategoryId;
  allProducts: Product[];
  onClose: () => void;
  onAdd: (input: NewProductInput) => Product | Promise<Product>;
}

export function AddProductModal({
  open,
  defaultCategory,
  allProducts,
  onClose,
  onAdd,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const [barcodeOffset, setBarcodeOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const barcode = useMemo(() => {
    if (!open) return "";
    return previewBarcode(allProducts, barcodeOffset);
  }, [allProducts, barcodeOffset, open]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setPrice("");
    setCategory(defaultCategory);
    setBarcodeOffset(0);
    setError(null);
  }, [open, defaultCategory]);

  const regenerateBarcode = () => {
    setBarcodeOffset((offset) => offset + 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);

    if (!trimmedName) {
      setError("Product name is required.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    const categoryMeta = CATEGORIES.find((c) => c.id === category);
    await onAdd({
      name: trimmedName,
      price: parsedPrice,
      category,
      color: categoryMeta?.color,
      barcode,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 sm:items-center sm:justify-center sm:p-4">
      <div className="flex h-full flex-col bg-white sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-md sm:overflow-hidden sm:rounded-xl sm:shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Product</h2>
            <p className="text-sm text-slate-600">Barcode auto-generated (Code 128)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 active:bg-slate-300"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        >
          <div>
            <label className="pos-label pos-label-dark mb-1 block">
              Product Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mango Shake"
              className="pos-input min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="pos-label pos-label-dark mb-1 block">
              Price
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="pos-input min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="pos-label pos-label-dark mb-1 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="pos-select min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="pos-label pos-label-dark">
                Generated Barcode
              </label>
              <button
                type="button"
                onClick={regenerateBarcode}
                className="text-xs font-semibold text-sky-600 active:text-sky-700"
              >
                Regenerate
              </button>
            </div>
            <BarcodeDisplay value={barcode} />
            <p className="mt-2 text-center font-mono text-base font-semibold text-slate-800">{barcode}</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-auto min-h-12 rounded-xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-500"
          >
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
}
