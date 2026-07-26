"use client";

import { useEffect, useState } from "react";

export interface DeviceOrientationState {
  angle: number;
  isPortrait: boolean;
}

export function useDeviceOrientation(): DeviceOrientationState {
  const [state, setState] = useState<DeviceOrientationState>({
    angle: 0,
    isPortrait: true,
  });

  useEffect(() => {
    const read = () => {
      const angle =
        typeof window !== "undefined"
          ? (screen.orientation?.angle ??
            (typeof window.orientation === "number" ? window.orientation : 0))
          : 0;
      const isPortrait = angle === 0 || angle === 180;
      setState({ angle, isPortrait });
    };

    read();
    screen.orientation?.addEventListener("change", read);
    window.addEventListener("orientationchange", read);
    window.addEventListener("resize", read);

    return () => {
      screen.orientation?.removeEventListener("change", read);
      window.removeEventListener("orientationchange", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return state;
}
