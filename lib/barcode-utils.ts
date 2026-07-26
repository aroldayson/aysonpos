const CUSTOM_BARCODE_PREFIX = "9300601";

import { getBarcodeSequence, setBarcodeSequence, persistBarcodeSequence } from "@/lib/db/barcode-cache";

function buildBarcodeFromSequence(seq: number): string {
  const suffix = seq.toString().padStart(6, "0");
  return `${CUSTOM_BARCODE_PREFIX}${suffix}`;
}

function reserveSequenceThrough(barcode: string): void {
  if (!barcode.startsWith(CUSTOM_BARCODE_PREFIX)) return;

  const seqPart = parseInt(barcode.slice(CUSTOM_BARCODE_PREFIX.length), 10);
  if (!Number.isFinite(seqPart)) return;

  const current = getBarcodeSequence();
  if (seqPart >= current) {
    const next = seqPart + 1;
    setBarcodeSequence(next);
    void persistBarcodeSequence(next);
  }
}

export function peekBarcodeAtOffset(existingBarcodes: string[], offset = 0): string {
  let seq = getBarcodeSequence() + offset;

  for (let attempt = 0; attempt < 100_000; attempt++) {
    const barcode = buildBarcodeFromSequence(seq);
    if (!existingBarcodes.includes(barcode)) return barcode;
    seq++;
  }

  throw new Error("Unable to preview barcode.");
}

export function generateProductBarcode(existingBarcodes: string[]): string {
  let seq = getBarcodeSequence();
  let barcode = "";

  for (let attempt = 0; attempt < 100_000; attempt++) {
    barcode = buildBarcodeFromSequence(seq);
    if (!existingBarcodes.includes(barcode)) {
      reserveSequenceThrough(barcode);
      return barcode;
    }
    seq++;
  }

  throw new Error("Unable to generate a unique barcode.");
}

export function assignProductBarcode(existingBarcodes: string[], barcode: string): string {
  const normalized = barcode.trim();
  if (!/^9300601\d{6}$/.test(normalized)) {
    return generateProductBarcode(existingBarcodes);
  }

  if (existingBarcodes.includes(normalized)) {
    return generateProductBarcode(existingBarcodes);
  }

  reserveSequenceThrough(normalized);
  return normalized;
}

export function isValidProductBarcode(barcode: string): boolean {
  return /^9300601\d{6}$/.test(barcode.trim());
}
