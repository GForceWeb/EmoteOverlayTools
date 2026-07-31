import { useState, useEffect, useCallback } from "react";
import type { ConnectionState } from "@/admin/hooks/use-connection-status";

type OverlayStatusResponse = {
  overlayConnected?: boolean;
  previewConnected?: boolean;
  overlayClients?: number;
  previewClients?: number;
};

export function useOverlayStatus(overlayUrl: string) {
  const [overlayState, setOverlayState] =
    useState<ConnectionState>("disconnected");
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);

  const testOverlay = useCallback(
    async (_isManualTest = false) => {
      setOverlayState("connecting");
      setLastAttempt(new Date());

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      try {
        // Presence of OBS/browser-source clients — Live Preview heartbeats are excluded.
        const response = await fetch(`${overlayUrl}/api/overlay-status`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as OverlayStatusResponse;
        setOverlayState(data.overlayConnected ? "connected" : "disconnected");
      } catch {
        setOverlayState("error");
      } finally {
        clearTimeout(timeout);
      }
    },
    [overlayUrl]
  );

  useEffect(() => {
    testOverlay();
  }, [testOverlay]);

  useEffect(() => {
    const interval = setInterval(() => {
      testOverlay();
    }, 5 * 1000);

    return () => clearInterval(interval);
  }, [testOverlay]);

  return {
    overlayState,
    lastAttempt,
    testOverlay,
  };
}
