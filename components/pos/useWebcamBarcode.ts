"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import {
  getCameraPermission,
  getScannerVideoConstraints,
  isMobileDevice,
  pickDefaultCamera,
  requestCameraPermission,
  type CameraPermission,
} from "@/lib/camera-utils";
import { normalizeScannedBarcode } from "@/lib/barcode-utils";
import { useDeviceOrientation } from "./useDeviceOrientation";

interface UseWebcamBarcodeOptions {
  active: boolean;
  onScan: (barcode: string) => void;
  /** Min ms before the same barcode can scan again (add +1 again). */
  debounceMs?: number;
}

function createScanHandler(
  debounceMs: number,
  lastScanRef: MutableRefObject<{ code: string; at: number } | null>,
  setLastScanned: (code: string) => void,
  onScanRef: MutableRefObject<(barcode: string) => void>,
) {
  return (result: { getText: () => string } | undefined) => {
    if (!result) return;

    const code = normalizeScannedBarcode(result.getText());
    if (!code) return;

    const now = Date.now();
    const last = lastScanRef.current;
    if (last && last.code === code && now - last.at < debounceMs) return;

    lastScanRef.current = { code, at: now };
    setLastScanned(code);
    onScanRef.current(code);
  };
}

export function useWebcamBarcode({
  active,
  onScan,
  debounceMs = 600,
}: UseWebcamBarcodeOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);
  const onScanRef = useRef(onScan);
  const { angle: orientationAngle } = useDeviceOrientation();

  const [permission, setPermission] = useState<CameraPermission>("prompt");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "scanning" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setStatus("idle");
  }, []);

  const startScanner = useCallback(
    async (deviceId: string) => {
      if (!videoRef.current) return;

      stopScanner();
      setStatus("connecting");
      setError(null);

      const reader = new BrowserMultiFormatReader();
      const constraints = getScannerVideoConstraints(deviceId || undefined);

      try {
        const onResult = createScanHandler(debounceMs, lastScanRef, setLastScanned, onScanRef);
        const controls = await reader.decodeFromConstraints(
          constraints,
          videoRef.current,
          onResult,
        );

        controlsRef.current = controls;
        setStatus("scanning");
      } catch {
        if (deviceId && !isMobileDevice()) {
          try {
            const fallback = await reader.decodeFromVideoDevice(
              deviceId,
              videoRef.current,
              createScanHandler(debounceMs, lastScanRef, setLastScanned, onScanRef),
            );
            controlsRef.current = fallback;
            setStatus("scanning");
            return;
          } catch {
            // fall through
          }
        }

        setStatus("error");
        setError("Could not start camera scanner.");
      }
    },
    [debounceMs, stopScanner],
  );

  const connectWebcam = useCallback(async () => {
    setStatus("connecting");
    setError(null);

    try {
      const videoDevices = await requestCameraPermission();
      setPermission("granted");
      setDevices(videoDevices);

      const preferred = pickDefaultCamera(videoDevices);
      if (!preferred) {
        setStatus("error");
        setError("No camera found. Check permissions and try again.");
        return;
      }

      setSelectedDeviceId(preferred.deviceId);
    } catch {
      setPermission("denied");
      setStatus("error");
      setError("Camera access denied. Allow camera permission in your browser settings.");
    }
  }, []);

  useEffect(() => {
    if (!active) {
      stopScanner();
      return;
    }

    getCameraPermission().then(async (state) => {
      setPermission(state);
      if (state === "granted") {
        try {
          const videoDevices = await requestCameraPermission();
          setDevices(videoDevices);
          const preferred = pickDefaultCamera(videoDevices);
          if (preferred) setSelectedDeviceId(preferred.deviceId);
        } catch {
          setStatus("error");
          setError("Could not access camera.");
        }
      }
    });

    return () => stopScanner();
  }, [active, stopScanner]);

  useEffect(() => {
    if (!active || permission !== "granted") return;
    if (!isMobileDevice() && !selectedDeviceId) return;

    const timer = window.setTimeout(() => {
      void startScanner(selectedDeviceId);
    }, orientationAngle === 0 ? 0 : 350);

    return () => window.clearTimeout(timer);
  }, [active, selectedDeviceId, permission, orientationAngle, startScanner]);

  return {
    videoRef,
    permission,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    status,
    error,
    lastScanned,
    connectWebcam,
    stopScanner,
    isConnected: status === "scanning",
  };
}
