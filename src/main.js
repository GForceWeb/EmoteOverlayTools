import websocketFunctions from './websocket.js';
import Variables from './config.js';
import * as animations from './animations.js';

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

    //setTimeout(animations.emoteFirework(["https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0"], 200, 20));
    window.animations = animations;
}



// Start the application
init();