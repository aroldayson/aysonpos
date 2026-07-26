import type { Category, CategoryId, Product } from "./types";

export const CATEGORIES: Category[] = [
  { id: "beer", label: "BEER", color: "#f59e0b" },
  { id: "spirits", label: "SPIRITS", color: "#dc2626" },
  { id: "wine", label: "WINE", color: "#7c3aed" },
  { id: "soft-coffee", label: "SOFT & COFFEE", color: "#0891b2" },
  { id: "food-sides", label: "FOOD ENTREE SIDES", color: "#16a34a" },
  { id: "food-main", label: "FOOD MAIN", color: "#ea580c" },
  { id: "kids-dessert", label: "KIDS CHIPS DESSERT", color: "#db2777" },
];

export const DEFAULT_PRODUCTS: Product[] = [
  // Beer
  // { id: "b1", name: "4.2 DRAUGHT PNT", price: 8.5, category: "beer", barcode: "9300600000001", color: "#fbbf24" },
  // { id: "b2", name: "4.2 DRAUGHT SCHOONER", price: 12.0, category: "beer", barcode: "9300600000002", color: "#f59e0b" },
  // { id: "b3", name: "CARLTON DRY PNT", price: 9.0, category: "beer", barcode: "9300600000003", color: "#d97706" },
  // { id: "b4", name: "GREAT NORTHERN PNT", price: 9.5, category: "beer", barcode: "9300600000004", color: "#b45309" },
  // { id: "b5", name: "CORONA BOTTLE", price: 10.0, category: "beer", barcode: "9300600000005", color: "#fcd34d" },
  // { id: "b6", name: "HEINEKEN BOTTLE", price: 11.0, category: "beer", barcode: "9300600000006", color: "#ca8a04" },

  // // Spirits
  // { id: "s1", name: "JIM BEAM 30ML", price: 8.5, category: "spirits", barcode: "9300600000011", color: "#ef4444" },
  // { id: "s2", name: "SMIRNOFF 30ML", price: 8.5, category: "spirits", barcode: "9300600000012", color: "#dc2626" },
  // { id: "s3", name: "JAMESON 30ML", price: 9.0, category: "spirits", barcode: "9300600000013", color: "#16a34a" },
  // { id: "s4", name: "SAILOR JERRY 30ML", price: 9.5, category: "spirits", barcode: "9300600000014", color: "#ea580c" },
  // { id: "s5", name: "JACK DANIELS 30ML", price: 10.0, category: "spirits", barcode: "9300600000015", color: "#b91c1c" },
  // { id: "s6", name: "VODKA 30ML SEARCH", price: 8.5, category: "spirits", barcode: "9300600000016", color: "#f472b6" },
  // { id: "s7", name: "COCKTAILS SEARCH", price: 14.0, category: "spirits", barcode: "9300600000017", color: "#ec4899" },
  // { id: "s8", name: "BUNDABERG RUM 30ML", price: 8.5, category: "spirits", barcode: "9300600000018", color: "#991b1b" },

  // // Wine
  // { id: "w1", name: "HOUSE RED GLASS", price: 9.0, category: "wine", barcode: "9300600000021", color: "#7c3aed" },
  // { id: "w2", name: "HOUSE WHITE GLASS", price: 9.0, category: "wine", barcode: "9300600000022", color: "#a78bfa" },
  // { id: "w3", name: "PINOT NOIR GLASS", price: 12.0, category: "wine", barcode: "9300600000023", color: "#6d28d9" },
  // { id: "w4", name: "SAUV BLANC GLASS", price: 11.0, category: "wine", barcode: "9300600000024", color: "#8b5cf6" },
  // { id: "w5", name: "PROSECCO GLASS", price: 10.0, category: "wine", barcode: "9300600000025", color: "#c4b5fd" },

  // // Soft & Coffee
  // { id: "sc1", name: "POST MIX SML", price: 4.0, category: "soft-coffee", barcode: "9300600000031", color: "#f472b6" },
  // { id: "sc2", name: "POST MIX LRG", price: 5.5, category: "soft-coffee", barcode: "9300600000032", color: "#ec4899" },
  // { id: "sc3", name: "FLAT WHITE", price: 5.0, category: "soft-coffee", barcode: "9300600000033", color: "#0891b2" },
  // { id: "sc4", name: "LATTE", price: 5.5, category: "soft-coffee", barcode: "9300600000034", color: "#06b6d4" },
  // { id: "sc5", name: "ESPRESSO", price: 4.0, category: "soft-coffee", barcode: "9300600000035", color: "#0e7490" },
  // { id: "sc6", name: "BOTTLED WATER", price: 3.5, category: "soft-coffee", barcode: "9300600000036", color: "#22d3ee" },
  // { id: "sc7", name: "RED BULL", price: 6.0, category: "soft-coffee", barcode: "9300600000037", color: "#0284c7" },

  // // Food Sides
  // { id: "fs1", name: "CHIPS", price: 8.0, category: "food-sides", barcode: "9300600000041", color: "#16a34a" },
  // { id: "fs2", name: "WEDGES", price: 10.0, category: "food-sides", barcode: "9300600000042", color: "#15803d" },
  // { id: "fs3", name: "GARDEN SALAD", price: 9.0, category: "food-sides", barcode: "9300600000043", color: "#22c55e" },
  // { id: "fs4", name: "GARLIC BREAD", price: 7.0, category: "food-sides", barcode: "9300600000044", color: "#4ade80" },
  // { id: "fs5", name: "ONION RINGS", price: 9.5, category: "food-sides", barcode: "9300600000045", color: "#166534" },

  // // Food Main
  // { id: "fm1", name: "STEAK & CHIPS", price: 32.0, category: "food-main", barcode: "9300600000051", color: "#ea580c" },
  // { id: "fm2", name: "CHICKEN PARMA", price: 26.0, category: "food-main", barcode: "9300600000052", color: "#f97316" },
  // { id: "fm3", name: "FISH & CHIPS", price: 24.0, category: "food-main", barcode: "9300600000053", color: "#fb923c" },
  // { id: "fm4", name: "BEEF BURGER", price: 22.0, category: "food-main", barcode: "9300600000054", color: "#c2410c" },
  // { id: "fm5", name: "VEG BURGER", price: 20.0, category: "food-main", barcode: "9300600000055", color: "#fdba74" },
  // { id: "fm6", name: "PASTA CARBONARA", price: 23.0, category: "food-main", barcode: "9300600000056", color: "#9a3412" },

  // // Kids & Dessert
  // { id: "kd1", name: "KIDS NUGGETS", price: 12.0, category: "kids-dessert", barcode: "9300600000061", color: "#db2777" },
  // { id: "kd2", name: "KIDS PASTA", price: 10.0, category: "kids-dessert", barcode: "9300600000062", color: "#ec4899" },
  // { id: "kd3", name: "CHOC BROWNIE", price: 9.0, category: "kids-dessert", barcode: "9300600000063", color: "#be185d" },
  // { id: "kd4", name: "STICKY DATE PUD", price: 11.0, category: "kids-dessert", barcode: "9300600000064", color: "#f472b6" },
  // { id: "kd5", name: "ICE CREAM SCOOP", price: 5.0, category: "kids-dessert", barcode: "9300600000065", color: "#fbcfe8" },
];

/** @deprecated Use DEFAULT_PRODUCTS or product catalog hook */
export const PRODUCTS = DEFAULT_PRODUCTS;

export function findProductByBarcode(barcode: string): Product | undefined {
  const normalized = barcode.trim();
  return DEFAULT_PRODUCTS.find((p) => p.barcode === normalized);
}

export function findProductById(id: string): Product | undefined {
  return DEFAULT_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: CategoryId): Product[] {
  return DEFAULT_PRODUCTS.filter((p) => p.category === categoryId);
}
