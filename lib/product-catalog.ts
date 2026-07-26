import type { CategoryId, Product } from "./types";
import { DEFAULT_PRODUCTS } from "./products";
import { barcodesMatch, peekBarcodeAtOffset } from "./barcode-utils";

export interface NewProductInput {
  name: string;
  price: number;
  category: CategoryId;
  color?: string;
  barcode?: string;
}

export interface EditProductInput {
  name: string;
  price: number;
  category: CategoryId;
  color?: string;
}

export function mergeProducts(customProducts: Product[]): Product[] {
  return [...DEFAULT_PRODUCTS, ...customProducts];
}

export function findInCatalog(products: Product[], barcode: string): Product | undefined {
  return products.find((product) => barcodesMatch(product.barcode, barcode));
}

export function filterByCategory(products: Product[], categoryId: CategoryId): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export function previewBarcode(allProducts: Product[], offset = 0): string {
  return peekBarcodeAtOffset(
    allProducts.map((p) => p.barcode),
    offset,
  );
}
