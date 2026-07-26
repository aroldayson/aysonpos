import type { CartItem, Product } from "./types";

export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcChange(total: number, cashTendered: number): number {
  return Math.max(0, cashTendered - total);
}

export function createCartItem(product: Product, quantity = 1): CartItem {
  return {
    id: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity,
  };
}

export function mergeCartItem(items: CartItem[], product: Product, quantity = 1): CartItem[] {
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    );
  }
  return [...items, createCartItem(product, quantity)];
}

export function adjustCartItemQuantity(
  items: CartItem[],
  id: string,
  delta: number,
): CartItem[] {
  return items
    .map((item) => {
      if (item.id !== id) return item;
      return { ...item, quantity: item.quantity + delta };
    })
    .filter((item) => item.quantity > 0);
}

export function removeCartItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((item) => item.id !== id);
}

export function setCartItemQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeCartItem(items, id);
  return items.map((item) => (item.id === id ? { ...item, quantity } : item));
}
