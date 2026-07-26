"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import {
  getCameraPermission,
  pickDefaultCamera,
  requestCameraPermission,
  type CameraPermission,
} from "@/lib/camera-utils";

interface UseWebcamBarcodeOptions {
  active: boolean;
  onScan: (barcode: string) => void;
  debounceMs?: number;
}

export function useWebcamBarcode({
  active,
  onScan,
  debounceMs = 2000,
}: UseWebcamBarcodeOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);
  const onScanRef = useRef(onScan);

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

      try {
        const controls = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result) => {
            if (!result) return;

            const code = result.getText().trim();
            if (!code) return;

            const now = Date.now();
            const last = lastScanRef.current;
            if (last && last.code === code && now - last.at < debounceMs) return;

            lastScanRef.current = { code, at: now };
            setLastScanned(code);
            onScanRef.current(code);
          },
        );

        controlsRef.current = controls;
        setStatus("scanning");
      } catch {
        setStatus("error");
        setError("Could not start webcam scanner.");
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
        setError("No webcam found. Plug in a camera and try again.");
        return;
      }

      setSelectedDeviceId(preferred.deviceId);
    } catch {
      setPermission("denied");
      setStatus("error");
      setError("Camera access denied. Allow webcam permission in your browser settings.");
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
          setError("Could not access webcam.");
        }
      }
    });

    return () => stopScanner();
  }, [active, stopScanner]);

  useEffect(() => {
    if (!active || !selectedDeviceId || permission !== "granted") return;
    startScanner(selectedDeviceId);
    return () => stopScanner();
  }, [active, selectedDeviceId, permission, startScanner, stopScanner]);

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
