import websocketFunctions from './websocket.ts';
import Variables from './config.ts';
import animations from './animations.ts';

const { globalVars, globalConst} = Variables;

// Access the functions individually
const { connectws, handleMessage } = websocketFunctions;

// Initialize the application
function init(): void {
    // @ts-ignore - GSAP is included via CDN and not as a module
    gsap.registerPlugin(MotionPathPlugin);
    connectws();

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