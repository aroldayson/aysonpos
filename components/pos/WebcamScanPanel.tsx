"use client";

import { useWebcamBarcode } from "./useWebcamBarcode";
import { ScannerVideoFrame } from "./ScannerVideoFrame";

interface WebcamScanPanelProps {
  active: boolean;
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function WebcamScanPanel({ active, onScan, onClose }: WebcamScanPanelProps) {
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
  } = useWebcamBarcode({ active, onScan });

  if (!active) return null;

  const needsPermission = permission !== "granted";

  return (
    <div className="shrink-0 border-b border-slate-600 bg-slate-900">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? "animate-pulse bg-emerald-400" : "bg-slate-500"
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wide text-white">
            Camera Scanner
          </span>
          {isConnected && (
            <span className="text-xs font-bold text-emerald-300">Live</span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded bg-white/10 px-2.5 py-1 text-sm font-semibold text-white active:bg-white/20"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col gap-3 px-3 pb-3 sm:flex-row">
        <ScannerVideoFrame
          videoRef={videoRef}
          active={active}
          isConnected={isConnected}
          className="sm:max-w-xs"
        >
          {needsPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-4">
              <p className="text-center text-sm text-slate-100">
                Allow camera access to scan barcodes with your phone
              </p>
              <button
                type="button"
                onClick={connectWebcam}
                className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white active:bg-emerald-500"
              >
                Allow Camera
              </button>
            </div>
          )}
          {status === "connecting" && !needsPermission && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
              Connecting…
            </div>
          )}
        </ScannerVideoFrame>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          {error && <p className="text-sm text-red-400">{error}</p>}

          {!error && isConnected && (
            <p className="text-sm text-slate-100">
              Hold the barcode in the green box. Rotate your phone — the camera adjusts
              automatically.
            </p>
          )}

          {lastScanned && (
            <p className="truncate text-sm text-slate-200">
              Last scan: <span className="font-mono font-semibold text-emerald-300">{lastScanned}</span>
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
              className="min-h-10 rounded-lg bg-sky-600 px-3 py-2 text-sm font-bold text-white active:bg-sky-500"
            >
              Retry Camera Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
