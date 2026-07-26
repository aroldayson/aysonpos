import Dexie, { type Table } from "dexie";
import type { HeldSale, Product, SaleRecord } from "@/lib/types";

export interface DbSetting {
  key: string;
  value: string;
}

export interface DbProduct extends Product {
  createdAt: number;
}

class AysonDatabase extends Dexie {
  products!: Table<DbProduct, string>;
  sales!: Table<SaleRecord, string>;
  heldSales!: Table<HeldSale, string>;
  settings!: Table<DbSetting, string>;

  constructor() {
    super("AysonPOS");

    this.version(1).stores({
      products: "id, barcode, category, name, createdAt",
      sales: "id, createdAt",
      heldSales: "id, createdAt",
      settings: "key",
    });
  }
}

export const db = new AysonDatabase();
