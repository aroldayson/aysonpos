import { db } from "./client";

let barcodeSequence = 1;

export function getBarcodeSequence(): number {
  return barcodeSequence;
}

export function setBarcodeSequence(value: number): void {
  barcodeSequence = value;
}

export async function persistBarcodeSequence(value: number): Promise<void> {
  setBarcodeSequence(value);
  await db.settings.put({ key: "barcode-seq", value: String(value) });
}

export async function loadBarcodeSequenceFromDb(): Promise<void> {
  const row = await db.settings.get("barcode-seq");
  setBarcodeSequence(row?.value ? parseInt(row.value, 10) || 1 : 1);
}
