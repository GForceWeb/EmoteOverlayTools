import { GlobalVars } from "../shared/types";
import animations from "./animations";
import OverlaySettings from "./settings";
const settings = OverlaySettings.settings;

// Create WebSocket connection to StreamerBot using configured URL
const ws = new WebSocket(settings.streamerBotWebsocketUrl);

// // Check for URL parameters on initial load, before admin settings are received
// const urlParams = new URLSearchParams(window.location.search);
// if (urlParams.get("server") !== null) {
//   settings.streamerBotWebsocketUrl = "ws://" + urlParams.get("server") + "/";
// }
// if (urlParams.get("debug") !== null) {
//   settings.debug = true;
// }

// Initialize other variables
let channelsub: boolean; //TODO: Build out the G-Force Sub Requirement
let hypetrainCache: string[] = [];
// Checks for SB Actions
let BotChat: boolean;

const root = document.documentElement;

function setCSSVars(): void {
  // Get the window width and height
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let cssEmoteSizeStandard = Math.ceil(window.innerHeight / 14);
  let cssAvatarSizeStandard = Math.ceil(window.innerHeight / 5);

  // Set CSS variables based on window size
  root.style.setProperty("--emote-size-standard", cssEmoteSizeStandard + "px");
  root.style.setProperty("--emote-size-large", cssEmoteSizeStandard * 2 + "px");
  root.style.setProperty("--emote-size-small", cssEmoteSizeStandard / 2 + "px");
  root.style.setProperty(
    "--avatar-size-standard",
    cssAvatarSizeStandard + "px"
  );
  root.style.setProperty(
    "--avatar-size-large",
    cssAvatarSizeStandard * 2 + "px"
  );
  root.style.setProperty(
    "--avatar-size-small",
    cssAvatarSizeStandard / 2 + "px"
  );
}

// Call the function on page load and resize
window.addEventListener("load", setCSSVars);
window.addEventListener("resize", setCSSVars);

// Global variables
export const globalVars: GlobalVars = {
  channelsub,
  hypetrainCache,
  BotChat,
  divnumber: 0,
  ws: ws,
  warp: document.getElementById("confetti-container") as HTMLElement,
};

if (settings.debug) {
  console.log(globalVars);
}

export default {
  globalVars,
};
