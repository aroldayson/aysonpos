"use client";

import type { KeypadMode } from "@/lib/types";

interface KeypadPanelProps {
  keypadValue: string;
  keypadMode: KeypadMode;
  selectedItemId: string | null;
  onKeypadModeChange: (mode: KeypadMode) => void;
  onDigit: (digit: string) => void;
  onClear: () => void;
  onEnter: () => void;
  onCancelItem: () => void;
  onCancelSale: () => void;
  onHoldSale: () => void;
  onOpenScanner: () => void;
  onCashPayment: () => void;
  heldCount: number;
  className?: string;
}

const KEYPAD = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "."];

export function KeypadPanel({
  keypadValue,
  keypadMode,
  selectedItemId,
  onKeypadModeChange,
  onDigit,
  onClear,
  onEnter,
  onCancelItem,
  onCancelSale,
  onHoldSale,
  onOpenScanner,
  onCashPayment,
  heldCount,
  className = "",
}: KeypadPanelProps) {
  return (
    <aside
      className={`pos-glass flex w-full shrink-0 flex-col overflow-hidden rounded-none lg:w-64 lg:rounded-2xl ${className}`}
    >
      <div className="border-b border-white/10 p-3">
        <div className="mb-2 flex gap-1.5 rounded-xl bg-black/20 p-1">
          {(["qty", "cash"] as KeypadMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onKeypadModeChange(mode)}
              className={`pos-btn flex-1 rounded-lg py-2 text-sm font-bold uppercase tracking-wider ${
                keypadMode === mode
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-black/40 px-4 py-3 text-right font-mono text-2xl font-bold tracking-wider text-emerald-400">
          {keypadValue || "0"}
        </div>
        {keypadMode === "qty" && selectedItemId && (
          <p className="mt-2 text-center text-xs font-medium text-indigo-200">
            Editing item quantity
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-3">
        {KEYPAD.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => (key === "C" ? onClear() : onDigit(key))}
            className="pos-btn min-h-12 rounded-xl bg-white/10 text-lg font-bold text-white hover:bg-white/15 active:bg-white/20"
          >
            {key}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onEnter}
        className="pos-btn mx-3 mb-2 min-h-11 rounded-xl bg-indigo-500 text-base font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-400"
      >
        Enter
      </button>

      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3 pt-0 pos-scroll">
        <ActionButton label="Webcam Scan" onClick={onOpenScanner} accent />
        <ActionButton
          label={heldCount > 0 ? `Recall Held (${heldCount})` : "Hold Sale"}
          onClick={onHoldSale}
        />
        <ActionButton label="Cancel Item" onClick={onCancelItem} />
        <ActionButton label="Cancel Sale" onClick={onCancelSale} danger />
        <ActionButton label="Reprint Receipt" onClick={() => window.print()} />

        <div className="mt-auto space-y-2 pt-3">
          <button
            type="button"
            className="pos-btn w-full min-h-12 rounded-xl bg-violet-600/80 text-sm font-bold text-white hover:bg-violet-500"
          >
            Charge to Table
          </button>
          <button
            type="button"
            onClick={onCashPayment}
            className="pos-btn w-full min-h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-black uppercase tracking-wide text-white shadow-xl shadow-emerald-900/40 hover:from-emerald-400 hover:to-teal-400"
          >
            Cash
          </button>
        </div>
      </div>
    </aside>
  );
}

function ActionButton({
  label,
  onClick,
  danger,
  accent,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pos-btn min-h-10 w-full rounded-xl text-sm font-bold tracking-wide ${
        danger
          ? "bg-red-500/25 text-red-200 ring-1 ring-red-400/40 hover:bg-red-500/35"
          : accent
            ? "bg-cyan-500/25 text-cyan-100 ring-1 ring-cyan-400/40 hover:bg-cyan-500/35"
            : "bg-white/10 text-slate-100 hover:bg-white/15"
      }`}
    >
      {label}
    </button>
  );
}
