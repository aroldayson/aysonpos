"use client";

import { useEffect, useState } from "react";
import type { CategoryId, Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";
import type { EditProductInput } from "@/lib/product-catalog";
import { isManualPriceProduct } from "@/lib/product-catalog";
import { formatCurrency } from "@/lib/pos-utils";
import { BarcodeDisplay } from "./BarcodeDisplay";

interface ManageProductsModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onEdit: (id: string, input: EditProductInput) => Promise<Product>;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export function ManageProductsModal({
  open,
  products,
  onClose,
  onEdit,
  onDelete,
  onAddNew,
}: ManageProductsModalProps) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<CategoryId>("beer");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setQuery("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setPrice(String(editing.price));
    setCategory(editing.category);
    setError(null);
  }, [editing]);

  if (!open) return null;

  const filtered = products.filter((product) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      product.barcode.includes(q) ||
      product.category.includes(q)
    );
  });

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);

    if (!trimmedName) {
      setError("Product name is required.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      if (!isManualPriceProduct(editing)) {
        setError("Enter a valid price greater than zero.");
        return;
      }
    }

    setBusyId(editing.id);
    try {
      const categoryMeta = CATEGORIES.find((c) => c.id === category);
      await onEdit(editing.id, {
        name: trimmedName,
        price: isManualPriceProduct(editing) ? 0 : parsedPrice,
        category,
        color: categoryMeta?.color,
      });
      setEditing(null);
    } catch {
      setError("Could not save product.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.name}"?`);
    if (!confirmed) return;

    setBusyId(product.id);
    try {
      await onDelete(product.id);
      if (editing?.id === product.id) setEditing(null);
    } catch {
      setError("Could not delete product.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 sm:items-center sm:justify-center sm:p-4">
      <div className="flex h-full flex-col bg-white sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-2xl sm:overflow-hidden sm:rounded-xl sm:shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? "Edit Product" : "Manage Products"}
            </h2>
            <p className="text-sm text-slate-600">
              {editing ? "Update your saved product" : `${products.length} custom product${products.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={editing ? () => setEditing(null) : onClose}
            className="min-h-10 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 active:bg-slate-300"
          >
            {editing ? "Back" : "Close"}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSaveEdit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
            <div>
              <label className="pos-label pos-label-dark mb-1 block">
                Product Name
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pos-input min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="pos-label pos-label-dark mb-1 block">Price</label>
              {isManualPriceProduct(editing) ? (
                <p className="rounded-lg bg-slate-100 px-3 py-3 text-sm text-slate-700">
                  Price is entered on the POS keypad when this item is sold.
                </p>
              ) : (
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pos-input min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              )}
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
              <label className="pos-label pos-label-dark mb-2 block">Barcode</label>
              {isManualPriceProduct(editing) ? (
                <p className="rounded-lg bg-amber-50 px-3 py-3 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
                  No barcode — enter price manually at sale
                </p>
              ) : (
                <>
                  <BarcodeDisplay value={editing.barcode} />
                  <p className="mt-2 text-center font-mono text-base font-semibold text-slate-800">
                    {editing.barcode}
                  </p>
                </>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={busyId === editing.id}
              className="mt-auto min-h-12 rounded-xl bg-sky-600 text-base font-bold text-white active:bg-sky-500 disabled:opacity-60"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <>
            <div className="border-b px-4 py-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="pos-input min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <ul className="flex-1 overflow-y-auto">
              {products.length === 0 ? (
                <li className="px-4 py-10 text-center">
                  <p className="text-base text-slate-600">No custom products yet.</p>
                  <button
                    type="button"
                    onClick={onAddNew}
                    className="mt-4 min-h-11 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white active:bg-amber-500"
                  >
                    Add First Product
                  </button>
                </li>
              ) : filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-base text-slate-600">No matching products</li>
              ) : (
                filtered.map((product) => {
                  const categoryLabel =
                    CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category;
                  return (
                    <li key={product.id} className="border-b px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">{categoryLabel}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {isManualPriceProduct(product)
                              ? "Manual price at sale"
                              : product.barcode}
                          </p>
                        </div>
                        <p className="shrink-0 text-base font-bold text-slate-900">
                          {isManualPriceProduct(product)
                            ? "Manual"
                            : formatCurrency(product.price)}
                        </p>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => setEditing(product)}
                          className="min-h-10 flex-1 rounded-lg bg-sky-600 text-sm font-bold text-white active:bg-sky-500 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleDelete(product)}
                          className="min-h-10 flex-1 rounded-lg bg-red-600 text-sm font-bold text-white active:bg-red-500 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            {error && <p className="px-4 py-2 text-sm text-red-600">{error}</p>}

            <div className="border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={onAddNew}
                className="min-h-11 w-full rounded-lg bg-amber-600 text-sm font-bold text-white active:bg-amber-500"
              >
                + Add New Product
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
