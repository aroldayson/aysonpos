"use client";

import { useWebcamBarcode } from "./useWebcamBarcode";
import { ScannerVideoFrame } from "./ScannerVideoFrame";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const {
    videoRef,
    permission,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    status,
    error,
    lastScanned,
    connectWebcam,
    isConnected,
  } = useWebcamBarcode({ active: open, onScan });

  if (!open) return null;

  const needsPermission = permission !== "granted";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
      <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10 sm:max-w-lg sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Camera Barcode</h2>
              {isConnected && (
                <span className="rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-sm text-slate-200">Point your phone camera at a barcode</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white active:bg-white/20"
          >
            Close
          </button>
        </div>

        <ScannerVideoFrame
          videoRef={videoRef}
          active={open}
          isConnected={isConnected}
          className="rounded-none sm:rounded-none"
        >
          {needsPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/85 p-6">
              <div className="text-center">
                <p className="text-base font-semibold text-white">Allow camera access</p>
                <p className="mt-1 text-sm text-slate-200">
                  Your browser will ask for camera permission
                </p>
              </div>
              <button
                type="button"
                onClick={connectWebcam}
                className="min-h-12 rounded-xl bg-emerald-600 px-6 py-3 text-base font-bold text-white active:bg-emerald-500"
              >
                Allow Camera
              </button>
            </div>
          )}

          {status === "connecting" && !needsPermission && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
              Starting camera…
            </div>
          )}
        </ScannerVideoFrame>

        <div className="space-y-3 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {error && <p className="text-sm text-red-400">{error}</p>}

          {isConnected && (
            <p className="text-sm text-slate-100">
              Each scan adds 1 to cart automatically. Scan the same barcode again to add
              more, or scan different products in a row.
            </p>
          )}

          {lastScanned && (
            <p className="text-sm text-slate-200">
              Last: <span className="font-mono font-semibold text-emerald-300">{lastScanned}</span>
            </p>
          )}

          {devices.length > 1 && permission === "granted" && (
            <div>
              <label className="pos-label pos-label-light mb-1 block">Camera</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {permission === "denied" && (
            <button
              type="button"
              onClick={connectWebcam}
              className="w-full min-h-11 rounded-lg bg-sky-600 text-sm font-bold text-white active:bg-sky-500"
            >
              Retry Camera Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
