import "../css/style.css";
import websockets from "./websocket.ts";
import animations from "./animations.ts";
import config from "./config.ts";
import OverlaySettings from "./settings";
import handlers from "./handlers.ts";
import { WSData } from "../shared/types.ts";
import { showNoticeBanner } from "./notice-banner.ts";

const settings = OverlaySettings.settings;

/** Black canvas for Live Preview / manual debug; OBS/production stay transparent. */
function applyPreviewBackground(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") === "preview" || params.get("debug") !== null) {
      document.documentElement.classList.add("preview-background");
    }
  } catch {
    // Ignore URL parse failures
  }
}

applyPreviewBackground();

// Initialize the application
async function init(): Promise<void> {
  // Show notice banner for non-app users (GitHub Pages, self-hosted, or with URL params)
  showNoticeBanner();

  await OverlaySettings.ready;
  websockets.connectws();

  // Expose animations to the global window object for debugging
  window.animations = animations;

  // Expose a helper to simulate chat messages
  window.testChat = (username: string, message: string): void => {
    const wsdata: WSData = {
      event: { type: "message", source: "Admin" },
      data: {
        message: {
          username,
          userId: `test-${username}`,
          message,
          role: "viewer",
          subscriber: true,
          emotes: [],
        },
      },
    };
    handlers.chatMessageHandler(wsdata);
  };
}

// Start the application
init();

// Add a type declaration for the window object to include animations
declare global {
  interface Window {
    animations: any;
    testChat: (username: string, message: string) => void;
  }
}
