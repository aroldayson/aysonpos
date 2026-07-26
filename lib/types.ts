export type CategoryId =
  | "beer"
  | "spirits"
  | "wine"
  | "soft-coffee"
  | "food-sides"
  | "food-main"
  | "kids-dessert";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: CategoryId;
  barcode: string;
  color: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface HeldSale {
  id: string;
  label: string;
  items: CartItem[];
  createdAt: number;
}

export interface SaleRecord {
  id: string;
  items: CartItem[];
  subtotal: number;
  cashTendered: number;
  change: number;
  createdAt: number;
}

export type KeypadMode = "qty" | "cash";
