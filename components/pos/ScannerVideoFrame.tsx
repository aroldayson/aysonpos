"use client";

import type { RefObject, ReactNode } from "react";
import { useDeviceOrientation } from "./useDeviceOrientation";
import { useVideoRotation } from "./useVideoRotation";

interface ScannerVideoFrameProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
  isConnected: boolean;
  className?: string;
  overlay?: ReactNode;
  children?: ReactNode;
}

export function ScannerVideoFrame({
  videoRef,
  active,
  isConnected,
  className = "",
  overlay,
  children,
}: ScannerVideoFrameProps) {
  const { isPortrait } = useDeviceOrientation();
  const { rotation, scale } = useVideoRotation(videoRef, active && isConnected);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-black ${
        isPortrait ? "aspect-[3/4] max-h-[min(50dvh,420px)]" : "aspect-video"
      } ${className}`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: "center center",
        }}
        muted
        playsInline
        autoPlay
      />

      {overlay}

      {isConnected && !overlay && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded border-2 border-emerald-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] ${
              isPortrait ? "h-36 w-28 sm:h-40 sm:w-32" : "h-24 w-48 sm:h-32 sm:w-56"
            }`}
          />
        </div>
      )}

      {children}
    </div>
  );
}
