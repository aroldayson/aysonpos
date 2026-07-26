"use client";

import { useEffect, useRef } from "react";

interface UseBarcodeInputOptions {
  enabled?: boolean;
  onScan: (barcode: string) => void;
  minLength?: number;
  maxGapMs?: number;
}

/**
 * Listens for USB / Bluetooth barcode scanners that emulate keyboard input.
 * Scanners typically type digits rapidly and finish with Enter.
 */
export function useBarcodeInput({
  enabled = true,
  onScan,
  minLength = 4,
  maxGapMs = 50,
}: UseBarcodeInputOptions) {
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTimeRef.current > maxGapMs) {
        bufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (event.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        if (code.length >= minLength) {
          event.preventDefault();
          onScanRef.current(code);
        }
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        bufferRef.current += event.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, minLength, maxGapMs]);
}
