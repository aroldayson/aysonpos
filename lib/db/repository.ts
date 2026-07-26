import type { HeldSale, Product, SaleRecord } from "@/lib/types";
import { DEFAULT_PRODUCTS } from "@/lib/products";
import {
  assignProductBarcode,
  generateProductBarcode,
} from "@/lib/barcode-utils";
import type { NewProductInput, EditProductInput } from "@/lib/product-catalog";
import { db } from "./client";
import { loadBarcodeSequenceFromDb } from "./barcode-cache";

const MIGRATION_KEY = "migrated-from-localStorage";
const LEGACY_PRODUCTS_KEY = "ayson-pos-custom-products";
const LEGACY_SEQUENCE_KEY = "ayson-pos-barcode-seq";
const BARCODE_SEQ_KEY = "barcode-seq";

async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

async function migrateFromLocalStorage(): Promise<void> {
  const migrated = await getSetting(MIGRATION_KEY);
  if (migrated === "true") return;

  if (typeof window !== "undefined") {
    try {
      const legacyProducts = window.localStorage.getItem(LEGACY_PRODUCTS_KEY);
      if (legacyProducts) {
        const parsed = JSON.parse(legacyProducts) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          await db.products.bulkPut(
            parsed.map((product) => ({
              ...product,
              createdAt: Date.now(),
            })),
          );
        }
        window.localStorage.removeItem(LEGACY_PRODUCTS_KEY);
      }

      const legacySequence = window.localStorage.getItem(LEGACY_SEQUENCE_KEY);
      if (legacySequence) {
        await setSetting(BARCODE_SEQ_KEY, legacySequence);
        window.localStorage.removeItem(LEGACY_SEQUENCE_KEY);
      }
    } catch {
      // Ignore corrupt legacy data and continue with a fresh database.
    }
  }

  await setSetting(MIGRATION_KEY, "true");
}

export async function initLocalDatabase(): Promise<void> {
  await db.open();
  await migrateFromLocalStorage();
  await loadBarcodeSequenceFromDb();
}

export async function getCustomProducts(): Promise<Product[]> {
  const rows = await db.products.orderBy("createdAt").toArray();
  return rows.map(({ createdAt: _createdAt, ...product }) => product);
}

export async function addCustomProduct(
  input: NewProductInput,
  existingProducts: Product[],
): Promise<Product> {
  const categoryColor =
    input.color ??
    DEFAULT_PRODUCTS.find((p) => p.category === input.category)?.color ??
    "#64748b";

  const barcodes = existingProducts.map((p) => p.barcode);
  const product: Product = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim().toUpperCase(),
    price: input.price,
    category: input.category,
    barcode: input.barcode
      ? assignProductBarcode(barcodes, input.barcode)
      : generateProductBarcode(barcodes),
    color: categoryColor,
  };

  await db.products.put({
    ...product,
    createdAt: Date.now(),
  });

  return product;
}

export async function deleteCustomProduct(id: string): Promise<void> {
  await db.products.delete(id);
}

export async function updateCustomProduct(
  id: string,
  input: EditProductInput,
): Promise<Product> {
  const existing = await db.products.get(id);
  if (!existing) {
    throw new Error("Product not found.");
  }

  const categoryColor =
    input.color ??
    DEFAULT_PRODUCTS.find((p) => p.category === input.category)?.color ??
    existing.color;

  const updated = {
    ...existing,
    name: input.name.trim().toUpperCase(),
    price: input.price,
    category: input.category,
    color: categoryColor,
  };

  await db.products.put(updated);

  const { createdAt: _createdAt, ...product } = updated;
  return product;
}

export async function saveSaleRecord(sale: SaleRecord): Promise<void> {
  await db.sales.put(sale);
}

export async function getSaleRecords(limit = 50): Promise<SaleRecord[]> {
  return db.sales.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function getHeldSales(): Promise<HeldSale[]> {
  return db.heldSales.orderBy("createdAt").toArray();
}

export async function saveHeldSale(sale: HeldSale): Promise<void> {
  await db.heldSales.put(sale);
}

export async function removeHeldSale(id: string): Promise<void> {
  await db.heldSales.delete(id);
}

export async function clearHeldSales(): Promise<void> {
  await db.heldSales.clear();
}
