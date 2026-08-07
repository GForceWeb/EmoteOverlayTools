import { useState, useEffect, useCallback } from "react";
import type { ConnectionState } from "@/admin/hooks/use-connection-status";

type OverlayStatusResponse = {
  connected?: boolean;
  clientCount?: number;
  lastSeen?: number | null;
};

const OVERLAY_STALE_MS = 15000;

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
        const response = await fetch(`${overlayUrl}/api/overlay/status`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as OverlayStatusResponse;
        const lastSeen =
          typeof data.lastSeen === "number" ? data.lastSeen : null;
        const isFresh =
          lastSeen !== null && Date.now() - lastSeen < OVERLAY_STALE_MS;

        setOverlayState(
          data.connected && isFresh ? "connected" : "disconnected"
        );
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
