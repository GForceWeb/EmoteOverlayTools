import websocketFunctions from './websocket.js';
import Variables from './config.js';
//import * as animations from './animations.js';
import animations from './animations.js';

const { globalVars, globalConst} = Variables;

// Access the functions individually
const { connectws, handleMessage } = websocketFunctions;

// Use the functions as needed
// connectWebSocket();
// handleMessage(message);

// Initialize the application
function init() {
    gsap.registerPlugin(MotionPathPlugin);
    connectws();

    window.animations = animations;
}



// Start the application
init();