"use client";

import type { RefObject, ReactNode } from "react";
import { useVideoRotation } from "./useVideoRotation";

interface ScannerVideoFrameProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
  isConnected: boolean;
  className?: string;
  overlay?: ReactNode;
  children?: ReactNode;
}

/**
 * Code 128 label proportions (bars + number row), matched to standard
 * generator output (~4.2:1 width:height).
 */
const BARCODE_FRAME_CLASS = "scanner-barcode-frame aspect-[4.2/1] w-[94%] max-w-[520px]";

export function ScannerVideoFrame({
  videoRef,
  active,
  isConnected,
  className = "",
  overlay,
  children,
}: ScannerVideoFrameProps) {
  const { rotation, scale } = useVideoRotation(videoRef, active && isConnected);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-lg bg-black ${className}`}
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
            className={`rounded-md border-[3px] border-emerald-400 bg-emerald-400/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] ${BARCODE_FRAME_CLASS}`}
          >
            <div className="flex h-full flex-col justify-end px-[4%] pb-[6%] pt-[8%]">
              <div className="flex-1 rounded-sm border border-dashed border-emerald-300/80" />
              <div className="mt-[6%] h-[18%] rounded-sm bg-emerald-400/10" />
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
