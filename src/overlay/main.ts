import websockets from "./websocket.ts";
import animations from "./animations.ts";
import config from "./config.ts";
import OverlaySettings from "./settings";
import handlers from "./handlers.ts";
import { WSData } from "../shared/types.ts";

const settings = OverlaySettings.settings;

// Initialize the application
async function init(): Promise<void> {
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
