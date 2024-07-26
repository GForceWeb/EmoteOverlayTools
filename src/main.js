import websocketFunctions from './websocket.js';
import Variables from './config.js';
//import * as animations from './animations.js';
import animations from './animations.js';
// import posthog from 'posthog-js';

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


// posthog.init('phc_2qM9NRYrCyXpC2B50bJTLGvt8Kxvhx40FJTJZpsG19G',
//     {
//         api_host: 'https://us.i.posthog.com',
//         person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
//     }
// )


// Start the application
init();