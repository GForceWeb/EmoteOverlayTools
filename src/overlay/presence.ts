import logger from "./lib/logger";

const HEARTBEAT_INTERVAL_MS = 5000;

let heartbeatTimer: number | null = null;
let clientId: string | null = null;

function isPreviewSource(): boolean {
  try {
    // Admin live preview is always an iframe; OBS browser source is top-level.
    // Accessing window.top can throw for cross-origin embeds — treat that as preview/framed.
    if (window.self !== window.top) {
      return true;
    }
    return new URLSearchParams(window.location.search).get("source") === "preview";
  } catch {
    return true;
  }
}

function getClientId(): string {
  if (!clientId) {
    clientId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `overlay-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return clientId;
}

async function sendHeartbeat(): Promise<void> {
  try {
    await fetch(`${window.location.origin}/api/overlay/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: getClientId(),
        source: "overlay",
      }),
    });
  } catch (error) {
    logger.error(
      `Overlay heartbeat failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Start periodic heartbeats so the admin UI can detect a live OBS overlay.
 * No-ops for the in-app preview (?source=preview).
 */
export function startOverlayPresence(): void {
  if (isPreviewSource()) {
    logger.info("Skipping overlay presence heartbeats in preview mode");
    return;
  }

  if (heartbeatTimer !== null) {
    return;
  }

  void sendHeartbeat();
  heartbeatTimer = window.setInterval(() => {
    void sendHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);
}
