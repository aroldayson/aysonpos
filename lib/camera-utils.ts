export type CameraPermission = "prompt" | "granted" | "denied" | "unsupported";

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function getScannerVideoConstraints(deviceId?: string): MediaStreamConstraints {
  if (deviceId) {
    return {
      audio: false,
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };
  }

  if (isMobileDevice()) {
    return {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };
  }

  return {
    audio: false,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };
}

export async function getCameraPermission(): Promise<CameraPermission> {
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";

  try {
    const result = await navigator.permissions.query({ name: "camera" as PermissionName });
    return result.state as CameraPermission;
  } catch {
    return "prompt";
  }
}

export async function requestCameraPermission(): Promise<MediaDeviceInfo[]> {
  const stream = await navigator.mediaDevices.getUserMedia(getScannerVideoConstraints());

  stream.getTracks().forEach((track) => track.stop());

  const { BrowserMultiFormatReader } = await import("@zxing/browser");
  return BrowserMultiFormatReader.listVideoInputDevices();
}

export function pickDefaultCamera(devices: MediaDeviceInfo[]): MediaDeviceInfo | undefined {
  if (devices.length === 0) return undefined;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    return (
      devices.find((d) => /back|rear|environment/i.test(d.label)) ?? devices[devices.length - 1]
    );
  }

  return (
    devices.find((d) => /webcam|facetime|integrated|usb|hd user/i.test(d.label)) ??
    devices.find((d) => !/back|rear|environment/i.test(d.label)) ??
    devices[0]
  );
}
