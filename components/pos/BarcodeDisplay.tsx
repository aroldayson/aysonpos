"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  value: string;
  className?: string;
}

export function BarcodeDisplay({ value, className = "" }: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      height: 70,
      width: 2,
      margin: 10,
      background: "#ffffff",
      lineColor: "#0f172a",
    });
  }, [value]);

  return (
    <div className={`overflow-hidden rounded-lg bg-white p-2 ${className}`}>
      <svg ref={svgRef} className="mx-auto h-auto w-full max-w-sm" />
    </div>
  );
}
