import { GlobalVars, FeatureList } from "../shared/types";
import SettingsManager from "./SettingsManager";

// Create WebSocket connection to StreamerBot
const ws = new WebSocket("ws://localhost:8080/");

// Create Websocket connection to Admin
let wsAdmin = new WebSocket("ws://localhost:3030/");

// Get the singleton instance of settings
const settings = SettingsManager.settings;

// Function to request settings from the admin server
function requestSettingsFromAdmin() {
  if (wsAdmin.readyState === WebSocket.OPEN) {
    console.log("Requesting settings from admin server...");
    wsAdmin.send(JSON.stringify({ type: "get-settings" }));
  } else {
    console.log(
      "Admin WebSocket not yet open, will request settings when connected"
    );
  }
}

// Setup admin WebSocket event handlers
wsAdmin.addEventListener("open", () => {
  console.log("Admin WebSocket connection established");
  // Actively request settings as soon as the connection is established
  requestSettingsFromAdmin();
});

// Listen for settings updates from admin
wsAdmin.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.settings) {
      // Update settings from admin panel
      settings.maxEmotes = data.settings.maxEmotes ?? settings.maxEmotes;
      settings.subOnly = data.settings.subOnly ?? settings.subOnly;
      settings.enableAllFeatures =
        data.settings.allFeatures ?? settings.enableAllFeatures;

      if (data.settings.selectedFeatures) {
        // Reset feature flags first if not using all features
        if (!settings.enableAllFeatures) {
          settings.features = {
            lurk: { enabled: false },
            welcome: { enabled: false },
            kappagen: { enabled: false },
            cheers: { enabled: false },
            hypetrain: { enabled: false },
            emoterain: { enabled: false },
            choon: { enabled: false },
          };

          // Then enable only selected features
          data.settings.selectedFeatures.forEach((feature: string) => {
            if (feature in settings.features) {
              settings.features[feature as keyof FeatureList] = {
                enabled: true,
              };
            }
          });
        }
      }

      // If all features are enabled, set all feature flags
      if (settings.enableAllFeatures) {
        settings.features = {
          lurk: { enabled: true },
          welcome: { enabled: true },
          kappagen: { enabled: true },
          cheers: { enabled: true },
          hypetrain: { enabled: true },
          emoterain: { enabled: true },
          choon: { enabled: true },
        };
      }

      // Now check for URL parameters and override admin settings if present
      const urlParams = new URLSearchParams(window.location.search);

      // Server parameter has priority over admin settings
      if (urlParams.get("server") !== null) {
        settings.serverUrl = "ws://" + urlParams.get("server") + "/";
      }

      // Override settings from URL parameters if present
      if (urlParams.get("maxemotes") !== null) {
        settings.maxEmotes = parseInt(urlParams.get("maxemotes") || "200");
        settings.defaultEmotes = settings.maxEmotes;
      }

      if (urlParams.get("subonly") !== null) {
        settings.subOnly = true;
      }

      if (urlParams.get("emoterain") !== null) {
        settings.features.emoterain.enabled = true;
      }

      if (urlParams.get("welcome") !== null) {
        settings.features.welcome.enabled = true;
      }

      if (urlParams.get("all") !== null) {
        settings.enableAllFeatures = true;
      }

      if (urlParams.get("lurk") !== null) {
        settings.features.lurk.enabled = true;
      }

      if (urlParams.get("kappagen") !== null) {
        settings.features.kappagen.enabled = true;
      }

      if (urlParams.get("debug") !== null) {
        settings.debug = true;
      }

      if (urlParams.get("hypetrain") !== null) {
        settings.features.hypetrain.enabled = true;
      }

      if (urlParams.get("cheers") !== null) {
        settings.features.cheers.enabled = true;
      }

      if (urlParams.get("choon") !== null) {
        settings.features.choon.enabled = true;
      }

      if (settings.debug) {
        console.log("Settings after admin and URL updates:", settings);
      }
    }
  } catch (error) {
    console.error("Error processing WebSocket message:", error);
  }
});

// Setup error handling for admin WebSocket
wsAdmin.addEventListener("error", (error) => {
  console.error("Admin WebSocket error:", error);
});

// Attempt to reconnect if admin WebSocket connection closes
wsAdmin.addEventListener("close", () => {
  console.log(
    "Admin WebSocket connection closed, will attempt to reconnect in 5 seconds"
  );
  setTimeout(() => {
    console.log("Attempting to reconnect to admin WebSocket...");
    wsAdmin = new WebSocket("ws://localhost:3030/");
    // Re-attach event listeners (simplified for brevity)
    wsAdmin.addEventListener("open", () => requestSettingsFromAdmin());
  }, 5000);
});

// Check for URL parameters on initial load, before admin settings are received
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("server") !== null) {
  settings.serverUrl = "ws://" + urlParams.get("server") + "/";
}
if (urlParams.get("debug") !== null) {
  settings.debug = true;
}

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

// Try to request settings on page load, in case WebSocket connects later
window.addEventListener("load", () => {
  // Short timeout to allow WebSocket to establish connection
  setTimeout(() => {
    requestSettingsFromAdmin();
  }, 1000);
});

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

if (settings.debug) {
  console.log(globalVars);
}

export default {
  globalVars,
  settings,
};
