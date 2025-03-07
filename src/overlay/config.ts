import { Settings, GlobalVars } from "../shared/types";

const urlParams = new URLSearchParams(window.location.search);

let server =
  urlParams.get("server") === null
    ? "ws://localhost:8080/"
    : "ws://" + urlParams.get("server") + "/";

// Initialize settings with URL parameters first
let maxemotes: number =
  urlParams.get("maxemotes") === null
    ? 200
    : parseInt(urlParams.get("maxemotes"));
let subonly: boolean = urlParams.get("subonly") === null ? false : true;
let emoterain: boolean = urlParams.get("emoterain") === null ? false : true;
let welcome: boolean = urlParams.get("welcome") === null ? false : true;
let all: boolean = urlParams.get("all") === null ? false : true;
let lurk: boolean = urlParams.get("lurk") === null ? false : true;
let kappagen: boolean = urlParams.get("kappagen") === null ? false : true;
let debug: boolean = urlParams.get("debug") === null ? false : true;
let hypetrain: boolean = urlParams.get("hypetrain") === null ? false : true;
let cheers: boolean = urlParams.get("cheers") === null ? false : true;
let choon: boolean = urlParams.get("choon") === null ? false : true;

// Create WebSocket connection to StreamerBot
const ws = new WebSocket(server);

// Create Websocket connection to Admin
const wsAdmin = new WebSocket("ws://localhost:3030/");

// Listen for settings updates from admin
wsAdmin.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.settings) {
      // Update settings
      maxemotes = data.settings.maxEmotes ?? maxemotes;
      subonly = data.settings.subOnly ?? subonly;
      all = data.settings.allFeatures ?? all;

      if (data.settings.selectedFeatures) {
        // Reset feature flags first if not using all features
        if (!data.settings.allFeatures) {
          emoterain = false;
          welcome = false;
          lurk = false;
          kappagen = false;
          hypetrain = false;
          cheers = false;
          choon = false;

          // Then enable only selected features
          data.selectedFeatures.forEach((feature: string) => {
            switch (feature) {
              case "emoterain":
                emoterain = true;
                break;
              case "welcome":
                welcome = true;
                break;
              case "lurk":
                lurk = true;
                break;
              case "kappagen":
                kappagen = true;
                break;
              case "hypetrain":
                hypetrain = true;
                break;
              case "cheers":
                cheers = true;
                break;
              case "choon":
                choon = true;
                break;
            }
          });
        }
      }

      // If all features are enabled, set all feature flags
      if (all) {
        lurk = true;
        emoterain = true;
        kappagen = true;
        welcome = true;
      }

      if (debug) {
        console.log("Settings updated:", {
          maxemotes,
          subonly,
          all,
          emoterain,
          welcome,
          lurk,
          kappagen,
          hypetrain,
          cheers,
          choon,
        });
      }
    }
  } catch (error) {
    if (debug) {
      console.error("Error processing WebSocket message:", error);
    }
  }
});

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
  defaultemotes: 50,
  ws: ws,
  warp: document.getElementById("confetti-container") as HTMLElement,
};

export const settings: Settings = {
  serverUrl: server,
  serverPort: 8080,
  twitchUsername: "G-Force",
  allFeatures: all,
  selectedFeatures: [],
  maxEmotes: maxemotes,
  subOnly: subonly,
  defaultEmotes: maxemotes,
  debug: debug,
  emoterain: emoterain,
  welcome: welcome,
  lurk: lurk,
  kappagen: kappagen,
  hypetrain: hypetrain,
  cheers: cheers,
  choon: choon,
};

if (settings.debug) {
  console.log(globalVars);
}

export default {
  globalVars,
  settings,
};
