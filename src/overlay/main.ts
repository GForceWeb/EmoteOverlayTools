import websocketFunctions from "./websocket.ts";
import animations from "./animations.ts";

// Access the functions individually
const { connectws, handleMessage } = websocketFunctions;

// Initialize the application
function init(): void {
  // gsap.registerPlugin(MotionPathPlugin);
  connectws();

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
