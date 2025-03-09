import websockets from "./websocket.ts";
import animations from "./animations.ts";
import config from "./config.ts";
import OverlaySettings from "./settings";

const settings = OverlaySettings.settings;

// Initialize the application
async function init(): Promise<void> {
  websockets.connectws();

  // Expose animations to the global window object for debugging
  window.animations = animations;
}

// Start the application
init();

// Add a type declaration for the window object to include animations
declare global {
  interface Window {
    animations: any;
  }
}
