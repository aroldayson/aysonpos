"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CartItem, CategoryId, HeldSale, KeypadMode, PosSession, Product } from "@/lib/types";
import { calcSubtotal, adjustCartItemQuantity, mergeCartItem, removeCartItem, setCartItemQuantity, formatCurrency } from "@/lib/pos-utils";
import { CategoryTabs } from "./CategoryTabs";
import { OrderPanel } from "./OrderPanel";
import { ProductGrid } from "./ProductGrid";
import { KeypadPanel } from "./KeypadPanel";
import { BarcodeScanner } from "./BarcodeScanner";
import { SearchModal } from "./SearchModal";
import { ViewOrdersModal } from "./ViewOrdersModal";
import { ManageProductsModal } from "./ManageProductsModal";
import { AddProductModal } from "./AddProductModal";
import { DataStorageModal } from "./DataStorageModal";
import { MobileBottomNav, type MobileView } from "./MobileBottomNav";
import { WebcamScanPanel } from "./WebcamScanPanel";
import { useBarcodeInput } from "./useBarcodeInput";
import { PrintReceipt } from "./PrintReceipt";
import { useMounted } from "./useMounted";
import { useLocalDatabase } from "./useLocalDatabase";
import { isManualPriceProduct } from "@/lib/product-catalog";

export function PosSystem() {
  const mounted = useMounted();
  const {
    ready: dbReady,
    error: dbError,
    allProducts,
    customProducts,
    addCustomProduct,
    updateCustomProduct,
    deleteCustomProduct,
    findProductByBarcode,
    getProductsByCategory,
    heldSales,
    holdSale,
    recallHeldSale,
    recordCompletedSale,
    savedSession,
    storageSummary,
    persistSession,
    wipeSession,
    exportData,
    importData,
  } = useLocalDatabase();
  const [category, setCategory] = useState<CategoryId>("spirits");
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [keypadValue, setKeypadValue] = useState("");
  const [keypadMode, setKeypadMode] = useState<KeypadMode>("cash");
  const [cashTendered, setCashTendered] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [webcamPanelOpen, setWebcamPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addProductPrefillBarcode, setAddProductPrefillBarcode] = useState<string | null>(null);
  const [manageProductsOpen, setManageProductsOpen] = useState(false);
  const [viewOrdersOpen, setViewOrdersOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingManualProduct, setPendingManualProduct] = useState<Product | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("products");
  const prevCartCount = useRef(0);
  const sessionRestoredRef = useRef(false);
  const qtyReplacePendingRef = useRef(false);

  const products = getProductsByCategory(category);
  const subtotal = calcSubtotal(items);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const restorePosSession = useCallback((session: PosSession | null) => {
    if (!session) {
      setItems([]);
      setSelectedItemId(null);
      setCashTendered(0);
      setKeypadValue("");
      setKeypadMode("cash");
      return;
    }

    setItems(session.items);
    setSelectedItemId(session.selectedItemId);
    setCashTendered(session.cashTendered);
    setKeypadValue(session.keypadValue);
    setKeypadMode(session.keypadMode);
    setCategory(session.category);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    if (!dbReady || sessionRestoredRef.current) return;
    sessionRestoredRef.current = true;
    if (savedSession?.items.length) {
      restorePosSession(savedSession);
      showToast("Restored saved cart");
    }
  }, [dbReady, savedSession, restorePosSession, showToast]);

  useEffect(() => {
    if (!dbReady || !sessionRestoredRef.current) return;

    const timer = window.setTimeout(() => {
      void persistSession({
        items,
        selectedItemId,
        cashTendered,
        keypadValue,
        keypadMode,
        category,
        updatedAt: Date.now(),
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [
    items,
    selectedItemId,
    cashTendered,
    keypadValue,
    keypadMode,
    category,
    dbReady,
    persistSession,
  ]);

  useEffect(() => {
    if (prevCartCount.current === 0 && items.length > 0) {
      setKeypadMode("cash");
    }
    prevCartCount.current = items.length;
  }, [items.length]);

  useEffect(() => {
    if (mobileView === "pay") {
      setKeypadMode("cash");
    }
  }, [mobileView]);

  const addProduct = useCallback(
    (product: Product, quantity = 1) => {
      setItems((prev) => mergeCartItem(prev, product, quantity));
      showToast(`Added ${product.name}`);
    },
    [showToast],
  );

  const addManualPriceProduct = useCallback(
    (product: Product, unitPrice: number, quantity = 1) => {
      if (unitPrice <= 0) {
        showToast("Enter a valid price first");
        return false;
      }

      setItems((prev) => mergeCartItem(prev, product, quantity, unitPrice));
      setPendingManualProduct(null);
      setKeypadValue("");
      setKeypadMode("cash");
      showToast(`Added ${product.name} · ${formatCurrency(unitPrice)}`);
      return true;
    },
    [showToast],
  );

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (isManualPriceProduct(product)) {
        const parsedPrice = parseFloat(keypadValue);
        const hasPrice =
          Number.isFinite(parsedPrice) &&
          parsedPrice > 0 &&
          (keypadMode === "price" || pendingManualProduct?.id === product.id);

        if (hasPrice) {
          addManualPriceProduct(product, parsedPrice);
          return;
        }

        setPendingManualProduct(product);
        setKeypadMode("price");
        setKeypadValue("");
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setMobileView("pay");
        }
        showToast(`Enter price for ${product.name}`);
        return;
      }

      const qty =
        keypadMode === "qty" && keypadValue
          ? Math.max(1, Math.floor(parseFloat(keypadValue) || 1))
          : 1;
      addProduct(product, qty);
      setKeypadValue("");
    },
    [addProduct, addManualPriceProduct, keypadMode, keypadValue, pendingManualProduct, showToast],
  );

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = findProductByBarcode(barcode);
      if (!product) {
        setAddProductPrefillBarcode(barcode);
        setAddProductOpen(true);
        showToast(`Unknown barcode — add product: ${barcode}`);
        return;
      }

      setItems((prev) => mergeCartItem(prev, product, 1));
      setCategory(product.category);
      showToast(`+1 ${product.name}`);
    },
    [findProductByBarcode, showToast],
  );

  const handleAddProduct = useCallback(
    async (input: Parameters<typeof addCustomProduct>[0]) => {
      const product = await addCustomProduct(input);
      setCategory(product.category);
      showToast(
        isManualPriceProduct(product)
          ? `Added ${product.name} · manual price at sale`
          : `Added ${product.name} · ${product.barcode}`,
      );
      return product;
    },
    [addCustomProduct, showToast],
  );

  const handleEditProduct = useCallback(
    async (id: string, input: Parameters<typeof updateCustomProduct>[1]) => {
      const product = await updateCustomProduct(id, input);
      showToast(`Updated ${product.name}`);
      return product;
    },
    [updateCustomProduct, showToast],
  );

  const handleDeleteProduct = useCallback(
    async (id: string) => {
      const product = customProducts.find((entry) => entry.id === id);
      await deleteCustomProduct(id);
      if (product) showToast(`Deleted ${product.name}`);
    },
    [customProducts, deleteCustomProduct, showToast],
  );

  useBarcodeInput({ enabled: dbReady, onScan: handleBarcodeScan });

  const handleDigit = (digit: string) => {
    if (digit === "." && keypadMode === "qty") return;
    if (digit === "." && keypadValue.includes(".")) return;

    if (keypadMode === "qty" && qtyReplacePendingRef.current) {
      qtyReplacePendingRef.current = false;
      if (digit === ".") return;
      setKeypadValue(digit);
      return;
    }

    setKeypadValue((prev) => (prev === "0" && digit !== "." ? digit : prev + digit));
  };

  const handleKeypadClear = () => {
    qtyReplacePendingRef.current = false;
    setKeypadValue("");
  };

  const handleEditQuantity = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;

      setSelectedItemId(id);
      setKeypadMode("qty");
      setKeypadValue(String(item.quantity));
      qtyReplacePendingRef.current = true;

      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileView("pay");
      }

      showToast(`Edit qty: ${item.name}`);
    },
    [items, showToast],
  );

  const handleKeypadEnter = () => {
    if (keypadMode === "price" && pendingManualProduct) {
      const price = parseFloat(keypadValue);
      addManualPriceProduct(pendingManualProduct, price);
      return;
    }

    if (keypadMode === "cash") {
      const amount = parseFloat(keypadValue) || 0;
      setCashTendered(amount);
      setKeypadValue("");
      return;
    }

    if (selectedItemId && keypadValue) {
      const qty = Math.max(1, Math.floor(parseFloat(keypadValue) || 1));
      setItems((prev) => setCartItemQuantity(prev, selectedItemId, qty));
      setKeypadValue("");
      qtyReplacePendingRef.current = false;
      showToast("Quantity updated");
    } else if (selectedItemId && keypadMode === "qty") {
      showToast("Enter a quantity first");
    }
  };

  const handleIncreaseQuantity = (id: string) => {
    setItems((prev) => adjustCartItemQuantity(prev, id, 1));
    setSelectedItemId(id);
    qtyReplacePendingRef.current = false;
  };

  const handleDecreaseQuantity = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;

    if (item.quantity <= 1) {
      handleRemoveItem(id);
      return;
    }

    setItems((prev) => adjustCartItemQuantity(prev, id, -1));
    setSelectedItemId(id);
  };

  const handleRemoveItem = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    setItems((prev) => removeCartItem(prev, id));
    setSelectedItemId((current) => (current === id ? null : current));
    if (item) showToast(`Removed ${item.name}`);
  };

  const handleCancelItem = () => {
    if (selectedItemId) {
      handleRemoveItem(selectedItemId);
    } else if (items.length > 0) {
      handleRemoveItem(items[items.length - 1].id);
    }
  };

  const handleCancelSale = () => {
    setItems([]);
    setSelectedItemId(null);
    setPendingManualProduct(null);
    setCashTendered(0);
    setKeypadValue("");
    setKeypadMode("cash");
    void wipeSession();
    showToast("Sale cancelled");
  };

  const handleHoldSale = async () => {
    if (items.length === 0) {
      if (heldSales.length > 0) {
        const latest = heldSales[heldSales.length - 1];
        const recalled = await recallHeldSale(latest.id);
        if (recalled) {
          setItems(recalled.items);
          showToast(`Recalled ${recalled.label}`);
        }
      }
      return;
    }

    const held: HeldSale = {
      id: `held-${Date.now()}`,
      label: `Held #${heldSales.length + 1}`,
      items,
      createdAt: Date.now(),
    };
    await holdSale(held);
    setItems([]);
    setSelectedItemId(null);
    setCashTendered(0);
    setKeypadValue("");
    setKeypadMode("cash");
    void wipeSession();
    showToast(held.label);
  };

  const handleCashPayment = async () => {
    if (items.length === 0) {
      showToast("No items in sale");
      return;
    }

    let tendered = cashTendered;
    if (keypadMode === "cash" && keypadValue.trim()) {
      const parsed = parseFloat(keypadValue);
      if (Number.isFinite(parsed) && parsed > 0) {
        tendered = parsed;
        setCashTendered(parsed);
        setKeypadValue("");
      }
    }

    if (tendered <= 0) {
      showToast("Enter cash amount on keypad first");
      setKeypadMode("cash");
      return;
    }

    if (tendered < subtotal) {
      showToast("Insufficient cash — enter amount on keypad");
      setKeypadMode("cash");
      return;
    }

    const change = tendered - subtotal;
    showToast(
      change > 0
        ? `Paid ${formatCurrency(subtotal)} — Change ${formatCurrency(change)}`
        : `Paid ${formatCurrency(subtotal)} — Thank you!`,
    );

    await recordCompletedSale({
      id: `sale-${Date.now()}`,
      items,
      subtotal,
      cashTendered: tendered,
      change,
      createdAt: Date.now(),
    });

    setItems([]);
    setSelectedItemId(null);
    setCashTendered(0);
    setKeypadValue("");
    setKeypadMode("cash");
    void wipeSession();
    setMobileView("products");
  };

  if (!mounted || !dbReady) {
    return (
      <div className="pos-shell flex h-dvh flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-base font-medium text-slate-100">Loading POS…</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="pos-shell flex h-dvh items-center justify-center p-6 text-center">
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 ring-1 ring-red-500/20">
          {dbError}
        </p>
      </div>
    );
  }

  const handleExportStorage = async () => {
    const snapshot = await exportData();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ayson-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportStorage = async (file: File) => {
    const session = await importData(file);
    restorePosSession(session);
    showToast("Backup imported");
  };

  return (
    <div className="pos-shell flex h-dvh flex-col overflow-hidden">
      <CategoryTabs
        active={category}
        onChange={setCategory}
        webcamActive={webcamPanelOpen}
        onToggleWebcam={() => setWebcamPanelOpen((open) => !open)}
        onAddProduct={() => setAddProductOpen(true)}
        onManageProducts={() => setManageProductsOpen(true)}
        onViewOrders={() => setViewOrdersOpen(true)}
        onOpenStorage={() => setStorageOpen(true)}
      />

      <WebcamScanPanel
        active={webcamPanelOpen}
        onScan={handleBarcodeScan}
        onClose={() => setWebcamPanelOpen(false)}
      />

      {items.length > 0 && mobileView === "products" && (
        <button
          type="button"
          onClick={() => setMobileView("cart")}
          className="pos-btn mx-3 mt-2 flex shrink-0 items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm backdrop-blur-sm lg:hidden"
        >
          <span className="font-semibold text-white">
            {cartItemCount} item{cartItemCount === 1 ? "" : "s"} in cart
          </span>
          <span className="font-bold text-emerald-400">{formatCurrency(subtotal)} →</span>
        </button>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-0 lg:flex-row lg:gap-3 lg:p-3">
        <OrderPanel
          items={items}
          selectedItemId={selectedItemId}
          keypadMode={keypadMode}
          keypadValue={keypadValue}
          cashTendered={cashTendered}
          onSelectItem={setSelectedItemId}
          onEditQuantity={handleEditQuantity}
          onClearSelection={() => setSelectedItemId(null)}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onRemoveItem={handleRemoveItem}
          className={mobileView === "cart" ? "flex min-h-0 flex-1" : "hidden lg:flex"}
        />

        <ProductGrid
          products={products}
          onSelect={handleProductSelect}
          onSearch={() => setSearchOpen(true)}
          onScan={() => setScannerOpen(true)}
          onAddProduct={() => setAddProductOpen(true)}
          className={mobileView === "products" ? "flex min-h-0 flex-1" : "hidden lg:flex"}
        />

        <KeypadPanel
          keypadValue={keypadValue}
          keypadMode={keypadMode}
          selectedItemId={selectedItemId}
          pendingManualProductName={pendingManualProduct?.name ?? null}
          onKeypadModeChange={setKeypadMode}
          onDigit={handleDigit}
          onClear={handleKeypadClear}
          onEnter={handleKeypadEnter}
          onCancelItem={handleCancelItem}
          onCancelSale={handleCancelSale}
          onHoldSale={handleHoldSale}
          onOpenScanner={() => setScannerOpen(true)}
          onCashPayment={handleCashPayment}
          heldCount={heldSales.length}
          className={mobileView === "pay" ? "flex min-h-0 flex-1 overflow-y-auto" : "hidden lg:flex"}
        />
      </div>

      <MobileBottomNav
        active={mobileView}
        itemCount={cartItemCount}
        subtotal={subtotal}
        onChange={setMobileView}
      />

      <footer className="hidden shrink-0 items-center justify-between border-t border-white/5 px-6 py-2 text-sm text-slate-200 lg:flex">
        <span className="font-semibold text-white">Ayson POS · Bar & Restaurant</span>
        <button
          type="button"
          onClick={() => setStorageOpen(true)}
          className="text-slate-200 underline-offset-2 hover:text-white hover:underline"
        >
          {storageSummary.productCount} products · {storageSummary.orderCount} orders saved locally
        </button>
      </footer>

      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900/95 px-5 py-3 text-center text-sm font-semibold text-white shadow-2xl backdrop-blur-md lg:bottom-8">
          {toast}
        </div>
      )}

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(product) => {
          if (isManualPriceProduct(product)) {
            handleProductSelect(product);
            return;
          }
          addProduct(product);
        }}
        products={allProducts}
      />

      <AddProductModal
        open={addProductOpen}
        defaultCategory={category}
        allProducts={allProducts}
        initialBarcode={addProductPrefillBarcode ?? undefined}
        onClose={() => {
          setAddProductOpen(false);
          setAddProductPrefillBarcode(null);
        }}
        onAdd={handleAddProduct}
      />

      <ManageProductsModal
        open={manageProductsOpen}
        products={customProducts}
        onClose={() => setManageProductsOpen(false)}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onAddNew={() => {
          setManageProductsOpen(false);
          setAddProductOpen(true);
        }}
      />

      <ViewOrdersModal
        open={viewOrdersOpen}
        onClose={() => setViewOrdersOpen(false)}
      />

      <DataStorageModal
        open={storageOpen}
        summary={storageSummary}
        onClose={() => setStorageOpen(false)}
        onExport={handleExportStorage}
        onImport={handleImportStorage}
      />

      <PrintReceipt items={items} subtotal={subtotal} />
    </div>
  );
}
