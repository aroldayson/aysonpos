"use client";

import { useEffect, useRef, useState } from "react";
import type { StorageSummary } from "@/lib/types";

interface DataStorageModalProps {
  open: boolean;
  summary: StorageSummary;
  onClose: () => void;
  onExport: () => Promise<void>;
  onImport: (file: File) => Promise<void>;
}

function formatSavedAt(timestamp: number | null): string {
  if (!timestamp) return "Not saved yet";
  return new Date(timestamp).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DataStorageModal({
  open,
  summary,
  onClose,
  onExport,
  onImport,
}: DataStorageModalProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setMessage(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const handleExport = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await onExport();
      setMessage("Backup downloaded.");
    } catch {
      setMessage("Could not export backup.");
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const confirmed = window.confirm(
      "Import will replace all local products, orders, and held sales. Continue?",
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage(null);
    try {
      await onImport(file);
      setMessage("Backup imported. Reloading saved data…");
    } catch {
      setMessage("Could not import backup.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 sm:items-center sm:justify-center sm:p-4">
      <div className="flex h-full flex-col bg-white sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-lg sm:overflow-hidden sm:rounded-xl sm:shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Local Storage</h2>
            <p className="text-sm text-slate-600">Data is saved directly in this app</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 active:bg-slate-300"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">Saved on this device</p>
            <p className="mt-1 text-sm text-emerald-700">
              Products, orders, held sales, and your current cart are stored locally using IndexedDB.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-600">Products</dt>
              <dd className="text-xl font-bold text-slate-900">{summary.productCount}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-600">Orders</dt>
              <dd className="text-xl font-bold text-slate-900">{summary.orderCount}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-600">Held sales</dt>
              <dd className="text-xl font-bold text-slate-900">{summary.heldCount}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-600">Last saved</dt>
              <dd className="text-sm font-semibold text-slate-900">{formatSavedAt(summary.lastSavedAt)}</dd>
            </div>
          </dl>

          <div className="space-y-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleExport}
              className="min-h-11 w-full rounded-xl bg-sky-600 text-sm font-bold text-white active:bg-sky-500 disabled:opacity-60"
            >
              Export Backup (JSON)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-11 w-full rounded-xl bg-violet-600 text-sm font-bold text-white active:bg-violet-500 disabled:opacity-60"
            >
              Import Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
          </div>

          {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}
