import type { HeldSale, PosSession, Product, SaleRecord, StorageSnapshot, StorageSummary } from "@/lib/types";
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

  const barcodes = existingProducts.map((p) => p.barcode).filter(Boolean);
  const useBarcode = input.useBarcode !== false;
  const product: Product = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim().toUpperCase(),
    price: useBarcode ? input.price : 0,
    category: input.category,
    barcode: useBarcode
      ? input.barcode
        ? assignProductBarcode(barcodes, input.barcode)
        : generateProductBarcode(barcodes)
      : "",
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

const SESSION_KEY = "pos-session";

export async function savePosSession(session: PosSession): Promise<void> {
  await setSetting(SESSION_KEY, JSON.stringify(session));
}

export async function loadPosSession(): Promise<PosSession | null> {
  const raw = await getSetting(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PosSession;
    if (!Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearPosSession(): Promise<void> {
  await db.settings.delete(SESSION_KEY);
}

export async function getStorageSummary(): Promise<StorageSummary> {
  const [productCount, orderCount, heldCount, sessionRaw] = await Promise.all([
    db.products.count(),
    db.sales.count(),
    db.heldSales.count(),
    getSetting(SESSION_KEY),
  ]);

  let lastSavedAt: number | null = null;
  if (sessionRaw) {
    try {
      lastSavedAt = (JSON.parse(sessionRaw) as PosSession).updatedAt ?? null;
    } catch {
      lastSavedAt = null;
    }
  }

  return { productCount, orderCount, heldCount, lastSavedAt };
}

export async function exportStorageSnapshot(): Promise<StorageSnapshot> {
  const [products, sales, heldSales, settingsRows, session] = await Promise.all([
    getCustomProducts(),
    db.sales.orderBy("createdAt").toArray(),
    getHeldSales(),
    db.settings.toArray(),
    loadPosSession(),
  ]);

  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]));

  return {
    version: 1,
    exportedAt: Date.now(),
    products,
    sales,
    heldSales,
    settings,
    session,
  };
}

export async function importStorageSnapshot(snapshot: StorageSnapshot): Promise<void> {
  if (snapshot.version !== 1) {
    throw new Error("Unsupported backup version.");
  }

  await db.transaction("rw", db.products, db.sales, db.heldSales, db.settings, async () => {
    await db.products.clear();
    await db.sales.clear();
    await db.heldSales.clear();
    await db.settings.clear();

    if (snapshot.products.length > 0) {
      await db.products.bulkPut(
        snapshot.products.map((product, index) => ({
          ...product,
          createdAt: Date.now() + index,
        })),
      );
    }

    if (snapshot.sales.length > 0) {
      await db.sales.bulkPut(snapshot.sales);
    }

    if (snapshot.heldSales.length > 0) {
      await db.heldSales.bulkPut(snapshot.heldSales);
    }

    for (const [key, value] of Object.entries(snapshot.settings)) {
      await db.settings.put({ key, value });
    }

    if (snapshot.session) {
      await savePosSession(snapshot.session);
    }
  });

  await loadBarcodeSequenceFromDb();
}
