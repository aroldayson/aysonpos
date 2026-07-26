"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryId, HeldSale, Product, SaleRecord } from "@/lib/types";
import {
  addCustomProduct as addCustomProductToDb,
  deleteCustomProduct as deleteCustomProductFromDb,
  getCustomProducts,
  getHeldSales,
  initLocalDatabase,
  removeHeldSale,
  saveHeldSale,
  saveSaleRecord,
  updateCustomProduct as updateCustomProductInDb,
} from "@/lib/db/repository";
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

  useEffect(() => {
    let cancelled = false;

    initLocalDatabase()
      .then(async () => {
        const [products, held] = await Promise.all([getCustomProducts(), getHeldSales()]);
        if (cancelled) return;
        setCustomProducts(products);
        setHeldSales(held);
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
      return product;
    },
    [allProducts],
  );

  const updateCustomProduct = useCallback(
    async (id: string, input: EditProductInput): Promise<Product> => {
      const product = await updateCustomProductInDb(id, input);
      setCustomProducts((prev) => prev.map((entry) => (entry.id === id ? product : entry)));
      return product;
    },
    [],
  );

  const deleteCustomProduct = useCallback(async (id: string): Promise<void> => {
    await deleteCustomProductFromDb(id);
    setCustomProducts((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const findProductByBarcode = useCallback(
    (barcode: string) => findInCatalog(allProducts, barcode),
    [allProducts],
  );

  const getProductsByCategory = useCallback(
    (categoryId: CategoryId) => filterByCategory(allProducts, categoryId),
    [allProducts],
  );

  const holdSale = useCallback(async (sale: HeldSale) => {
    await saveHeldSale(sale);
    setHeldSales((prev) => [...prev, sale]);
  }, []);

  const recallHeldSale = useCallback(async (id: string): Promise<HeldSale | undefined> => {
    const sale = heldSales.find((entry) => entry.id === id);
    if (!sale) return undefined;
    await removeHeldSale(id);
    setHeldSales((prev) => prev.filter((entry) => entry.id !== id));
    return sale;
  }, [heldSales]);

  const recordCompletedSale = useCallback(async (sale: SaleRecord) => {
    await saveSaleRecord(sale);
  }, []);

  return {
    ready,
    error,
    allProducts,
    customProducts,
    heldSales,
    addCustomProduct,
    updateCustomProduct,
    deleteCustomProduct,
    findProductByBarcode,
    getProductsByCategory,
    holdSale,
    recallHeldSale,
    recordCompletedSale,
  };
}
