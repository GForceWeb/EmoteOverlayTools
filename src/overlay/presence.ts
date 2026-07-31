// Reports overlay browser-source presence to the Electron admin UI.
// Live Preview clients send role "preview" and do not count as Overlay Connected.

const HEARTBEAT_INTERVAL_MS = 4000;
const CLIENT_ID_KEY = "eot-overlay-client-id";

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `overlay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getClientId(): string {
  try {
    const existing = sessionStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const id = createClientId();
    sessionStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return createClientId();
  }
}

function isPreviewClient(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "1") {
      return true;
    }
  } catch {
    // ignore
  }

  // Live Preview is embedded in the admin iframe
  try {
    if (window.self !== window.top) {
      return true;
    }
  } catch {
    // Cross-origin iframe access can throw; treat as embedded preview
    return true;
  }

  return false;
}

export function startOverlayPresenceHeartbeat(): void {
  const clientId = getClientId();
  const role = isPreviewClient() ? "preview" : "overlay";

  const sendHeartbeat = () => {
    fetch(`${window.location.origin}/api/overlay-presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId, role }),
      keepalive: true,
    }).catch(() => {
      // Presence is best-effort; avoid noisy overlay errors
    });
  };

  sendHeartbeat();
  window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

  window.addEventListener("pagehide", () => {
    // Final best-effort ping so expiry can start promptly if needed
    navigator.sendBeacon?.(
      `${window.location.origin}/api/overlay-presence`,
      new Blob(
        [JSON.stringify({ id: clientId, role })],
        { type: "application/json" }
      )
    );
  });
}
