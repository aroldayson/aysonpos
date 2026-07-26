"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryId, HeldSale, PosSession, Product, SaleRecord, StorageSummary } from "@/lib/types";
import {
  addCustomProduct as addCustomProductToDb,
  clearPosSession,
  deleteCustomProduct as deleteCustomProductFromDb,
  exportStorageSnapshot,
  getCustomProducts,
  getHeldSales,
  getStorageSummary,
  importStorageSnapshot,
  initLocalDatabase,
  loadPosSession,
  removeHeldSale,
  saveHeldSale,
  savePosSession,
  saveSaleRecord,
  updateCustomProduct as updateCustomProductInDb,
} from "@/lib/db/storage";
import {
  filterByCategory,
  findInCatalog,
  mergeProducts,
  type EditProductInput,
  type NewProductInput,
} from "@/lib/product-catalog";

export function useLocalDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [savedSession, setSavedSession] = useState<PosSession | null>(null);
  const [storageSummary, setStorageSummary] = useState<StorageSummary>({
    productCount: 0,
    orderCount: 0,
    heldCount: 0,
    lastSavedAt: null,
  });

  const refreshSummary = useCallback(async () => {
    const summary = await getStorageSummary();
    setStorageSummary(summary);
  }, []);

  useEffect(() => {
    let cancelled = false;

    initLocalDatabase()
      .then(async () => {
        const [products, held, session, summary] = await Promise.all([
          getCustomProducts(),
          getHeldSales(),
          loadPosSession(),
          getStorageSummary(),
        ]);
        if (cancelled) return;
        setCustomProducts(products);
        setHeldSales(held);
        setSavedSession(session);
        setStorageSummary(summary);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not open local database.");
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const allProducts = useMemo(
    () => mergeProducts(customProducts),
    [customProducts],
  );

  const addCustomProduct = useCallback(
    async (input: NewProductInput): Promise<Product> => {
      const product = await addCustomProductToDb(input, allProducts);
      setCustomProducts((prev) => [...prev, product]);
      await refreshSummary();
      return product;
    },
    [allProducts, refreshSummary],
  );

  const updateCustomProduct = useCallback(
    async (id: string, input: EditProductInput): Promise<Product> => {
      const product = await updateCustomProductInDb(id, input);
      setCustomProducts((prev) => prev.map((entry) => (entry.id === id ? product : entry)));
      await refreshSummary();
      return product;
    },
    [refreshSummary],
  );

  const deleteCustomProduct = useCallback(
    async (id: string): Promise<void> => {
      await deleteCustomProductFromDb(id);
      setCustomProducts((prev) => prev.filter((entry) => entry.id !== id));
      await refreshSummary();
    },
    [refreshSummary],
  );

  const findProductByBarcode = useCallback(
    (barcode: string) => findInCatalog(allProducts, barcode),
    [allProducts],
  );

  const getProductsByCategory = useCallback(
    (categoryId: CategoryId) => filterByCategory(allProducts, categoryId),
    [allProducts],
  );

  const holdSale = useCallback(
    async (sale: HeldSale) => {
      await saveHeldSale(sale);
      setHeldSales((prev) => [...prev, sale]);
      await refreshSummary();
    },
    [refreshSummary],
  );

  const recallHeldSale = useCallback(
    async (id: string): Promise<HeldSale | undefined> => {
      const sale = heldSales.find((entry) => entry.id === id);
      if (!sale) return undefined;
      await removeHeldSale(id);
      setHeldSales((prev) => prev.filter((entry) => entry.id !== id));
      await refreshSummary();
      return sale;
    },
    [heldSales, refreshSummary],
  );

  const recordCompletedSale = useCallback(
    async (sale: SaleRecord) => {
      await saveSaleRecord(sale);
      await refreshSummary();
    },
    [refreshSummary],
  );

  const persistSession = useCallback(
    async (session: PosSession) => {
      await savePosSession(session);
      setSavedSession(session);
      setStorageSummary((prev) => ({ ...prev, lastSavedAt: session.updatedAt }));
    },
    [],
  );

  const wipeSession = useCallback(async () => {
    await clearPosSession();
    setSavedSession(null);
    setStorageSummary((prev) => ({ ...prev, lastSavedAt: null }));
  }, []);

  const exportData = useCallback(async () => {
    return exportStorageSnapshot();
  }, []);

  const importData = useCallback(async (file: File) => {
    const text = await file.text();
    const snapshot = JSON.parse(text);
    await importStorageSnapshot(snapshot);

    const [products, held, session, summary] = await Promise.all([
      getCustomProducts(),
      getHeldSales(),
      loadPosSession(),
      getStorageSummary(),
    ]);

    setCustomProducts(products);
    setHeldSales(held);
    setSavedSession(session);
    setStorageSummary(summary);

    return session;
  }, []);

  return {
    ready,
    error,
    allProducts,
    customProducts,
    heldSales,
    savedSession,
    storageSummary,
    addCustomProduct,
    updateCustomProduct,
    deleteCustomProduct,
    findProductByBarcode,
    getProductsByCategory,
    holdSale,
    recallHeldSale,
    recordCompletedSale,
    persistSession,
    wipeSession,
    exportData,
    importData,
    refreshSummary,
  };
}
