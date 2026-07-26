"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryId, Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";
import { previewBarcode } from "@/lib/product-catalog";
import type { NewProductInput } from "@/lib/product-catalog";
import { barcodesMatch, isValidExternalBarcode, normalizeProductBarcode } from "@/lib/barcode-utils";
import { BarcodeDisplay } from "./BarcodeDisplay";

type BarcodeSource = "auto" | "existing";

interface AddProductModalProps {
  open: boolean;
  defaultCategory: CategoryId;
  allProducts: Product[];
  initialBarcode?: string;
  onClose: () => void;
  onAdd: (input: NewProductInput) => Product | Promise<Product>;
}

export function AddProductModal({
  open,
  defaultCategory,
  allProducts,
  initialBarcode,
  onClose,
  onAdd,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const [useBarcode, setUseBarcode] = useState(true);
  const [barcodeSource, setBarcodeSource] = useState<BarcodeSource>("auto");
  const [customBarcode, setCustomBarcode] = useState("");
  const [barcodeOffset, setBarcodeOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const autoBarcode = useMemo(() => {
    if (!open || !useBarcode || barcodeSource !== "auto") return "";
    return previewBarcode(allProducts, barcodeOffset);
  }, [allProducts, barcodeOffset, barcodeSource, open, useBarcode]);

  const resolvedBarcode = barcodeSource === "existing" ? customBarcode.trim() : autoBarcode;

  useEffect(() => {
    if (!open) return;

    const normalizedInitial = initialBarcode ? normalizeProductBarcode(initialBarcode) : "";
    setName("");
    setPrice("");
    setCategory(defaultCategory);
    setUseBarcode(true);
    setBarcodeSource(normalizedInitial ? "existing" : "auto");
    setCustomBarcode(normalizedInitial);
    setBarcodeOffset(0);
    setError(null);
  }, [open, defaultCategory, initialBarcode]);

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

    if (useBarcode) {
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        setError("Enter a valid price greater than zero.");
        return;
      }

      if (barcodeSource === "existing") {
        const normalized = normalizeProductBarcode(customBarcode);
        if (!isValidExternalBarcode(normalized)) {
          setError("Enter a valid barcode (8–14 digits).");
          return;
        }

        const duplicate = allProducts.some((product) => barcodesMatch(product.barcode, normalized));
        if (duplicate) {
          setError("This barcode is already used by another product.");
          return;
        }
      }
    }

    const categoryMeta = CATEGORIES.find((c) => c.id === category);
    await onAdd({
      name: trimmedName,
      price: useBarcode && Number.isFinite(parsedPrice) ? parsedPrice : 0,
      category,
      color: categoryMeta?.color,
      useBarcode,
      barcode: useBarcode ? normalizeProductBarcode(resolvedBarcode) || undefined : undefined,
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
            <p className="text-sm text-slate-600">
              {useBarcode
                ? barcodeSource === "existing"
                  ? "Use barcode from package label"
                  : "Barcode auto-generated (Code 128)"
                : "No barcode — price at sale"}
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        >
          <div>
            <label className="pos-label pos-label-dark mb-1 block">Product Name</label>
            <input
              autoFocus={!initialBarcode}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nescafe Original"
              className="pos-input min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="pos-label pos-label-dark mb-2">Barcode</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseBarcode(true)}
                className={`min-h-10 flex-1 rounded-lg text-sm font-bold ${
                  useBarcode
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-300"
                }`}
              >
                With barcode
              </button>
              <button
                type="button"
                onClick={() => setUseBarcode(false)}
                className={`min-h-10 flex-1 rounded-lg text-sm font-bold ${
                  !useBarcode
                    ? "bg-amber-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-300"
                }`}
              >
                No barcode
              </button>
            </div>
            {!useBarcode && (
              <p className="mt-2 text-xs text-slate-600">
                Price is entered manually on the POS keypad when you sell this item.
              </p>
            )}
          </div>

          {useBarcode && (
            <div>
              <label className="pos-label pos-label-dark mb-1 block">Price</label>
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
          )}

          <div>
            <label className="pos-label pos-label-dark mb-1 block">Category</label>
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

          {useBarcode && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBarcodeSource("auto")}
                  className={`min-h-10 flex-1 rounded-lg text-xs font-bold sm:text-sm ${
                    barcodeSource === "auto"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-300"
                  }`}
                >
                  Auto-generate
                </button>
                <button
                  type="button"
                  onClick={() => setBarcodeSource("existing")}
                  className={`min-h-10 flex-1 rounded-lg text-xs font-bold sm:text-sm ${
                    barcodeSource === "existing"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-300"
                  }`}
                >
                  Existing barcode
                </button>
              </div>

              {barcodeSource === "existing" ? (
                <div>
                  <label className="pos-label pos-label-dark mb-1 block">
                    Barcode number
                  </label>
                  <input
                    autoFocus={Boolean(initialBarcode)}
                    type="text"
                    inputMode="numeric"
                    value={customBarcode}
                    onChange={(e) => setCustomBarcode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 4800361415347"
                    className="pos-input min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                  {customBarcode && isValidExternalBarcode(customBarcode) && (
                    <>
                      <BarcodeDisplay value={customBarcode} className="mt-3" />
                      <p className="mt-2 text-center font-mono text-base font-semibold text-slate-800">
                        {customBarcode}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="pos-label pos-label-dark">Generated Barcode</label>
                    <button
                      type="button"
                      onClick={regenerateBarcode}
                      className="text-xs font-semibold text-sky-600 active:text-sky-700"
                    >
                      Regenerate
                    </button>
                  </div>
                  <BarcodeDisplay value={autoBarcode} />
                  <p className="mt-2 text-center font-mono text-base font-semibold text-slate-800">
                    {autoBarcode}
                  </p>
                </div>
              )}
            </div>
          )}

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
