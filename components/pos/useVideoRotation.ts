"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Auto-rotate the camera preview when the video stream orientation
 * does not match the phone screen (common on mobile rear cameras).
 */
export function useVideoRotation(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!active) {
      setRotation(0);
      setScale(1);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const update = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      const screenPortrait = window.innerHeight >= window.innerWidth;
      const videoLandscape = vw > vh;

      if (screenPortrait && videoLandscape) {
        setRotation(90);
        setScale(1.35);
      } else if (!screenPortrait && !videoLandscape) {
        setRotation(-90);
        setScale(1.35);
      } else {
        setRotation(0);
        setScale(1);
      }
    };

    video.addEventListener("loadedmetadata", update);
    video.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);
    update();

    return () => {
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
    };
  }, [active, videoRef]);

  return { rotation, scale };
}
