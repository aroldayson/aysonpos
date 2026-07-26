"use client";

import dynamic from "next/dynamic";

const PosSystem = dynamic(
  () => import("@/components/pos/PosSystem").then((mod) => mod.PosSystem),
  {
    ssr: false,
    loading: () => (
      <div className="pos-shell flex h-dvh flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-base font-medium text-slate-100">Loading POS…</p>
      </div>
    ),
  },
);

export function PosSystemClient() {
  return <PosSystem />;
}
