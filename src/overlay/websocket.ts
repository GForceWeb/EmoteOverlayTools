import { globalVars } from "./config.ts";
import animations from "./animations.ts";
import handlers from "./handlers.ts";
import { WSData } from "../shared/types.ts";
import { getEventUsername } from "../shared/streamerbotChat.ts";
import OverlaySettings from "./settings.ts";
import logger from "./lib/logger.ts";

let Botchat: boolean = false;
let isElectron = false;
let reconnectTimer: number | null = null;

function scheduleReconnect(): void {
  if (reconnectTimer !== null) {
    return;
  }

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectws();
  }, 10000);
}

function subscribeToEvents(ws: WebSocket): void {
  ws.send(
    JSON.stringify({
      request: "Subscribe",
      events: {
        Twitch: [
          "ChatMessage",
          "FirstWord",
          "AutomaticRewardRedemption",
          "PowerUpRedemption",
          "HypeTrainStart",
          "HypeTrainUpdate",
          "HypeTrainLevelUp",
          "HypeTrainEnd",
          "Raid",
          "Cheer",
          "Sub",
          "ReSub",
          "GiftBomb",
          "GiftSub",
        ],
        Raw: ["Action"],
        General: ["Custom"],
        Custom: ["Event"]
      },
      id: "123",
    })
  );

  ws.send(
    JSON.stringify({
      request: "GetActions",
      id: "ActionList",
    })
  );
}

const handleElectronMessage = (event: MessageEvent) => {
  // Optional: Validate the origin for security
  // if (event.origin !== "your-expected-origin") return;

  const { type, feature, animation, config, wsdata } = event.data ?? {};

  if (
    type === "PREVIEW_FEATURE" &&
    feature &&
    config &&
    feature in OverlaySettings.settings.features
  ) {
    OverlaySettings.updateSettings({
      features: {
        ...OverlaySettings.settings.features,
        [feature]: {
          ...OverlaySettings.settings.features[
            feature as keyof typeof OverlaySettings.settings.features
          ],
          ...config,
        },
      },
    });
  }

  // Preview animation sub-settings (e.g. poppingBehaviour, waveStyle) are
  // read from settings by the animation modules, so hot-merge the previewed
  // config before replaying the synthetic chat message.
  if (
    type === "PREVIEW_ANIMATION" &&
    animation &&
    config &&
    animation in OverlaySettings.settings.animations
  ) {
    OverlaySettings.updateSettings({
      animations: {
        ...OverlaySettings.settings.animations,
        [animation]: {
          ...OverlaySettings.settings.animations[animation],
          ...config,
        },
      },
    });
  }

  if (type === "PREVIEW_ANIMATION" || type === "PREVIEW_FEATURE") {
    handleMessage(JSON.stringify(wsdata));
  }
};

// Check if running in Electron
function checkElectron(): boolean {
  // Check if window.electronAPI exists (defined in our preload script)
  if (typeof window !== "undefined" && window.electronAPI) {
    return true;
  }

  // Check for Electron process
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return true;
  }

  return false;
}

function connectws(): void {
  // HTTP preview iframes also receive commands from the admin window.
  window.addEventListener("message", handleElectronMessage);
  isElectron = checkElectron();

  if (isElectron) {
    logger.info("Running in Electron environment, using IPC for messages");
    setupElectronCommunication();

    return;
  }

  if ("WebSocket" in window) {
    if (
      globalVars.ws &&
      (globalVars.ws.readyState === WebSocket.OPEN ||
        globalVars.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(OverlaySettings.settings.streamerBotWebsocketUrl);
    globalVars.ws = ws;
    logger.info("Connecting overlay to Streamer.bot WebSocket");

    ws.onclose = function (): void {
      if (globalVars.ws === ws) {
        globalVars.ws = null;
      }

      scheduleReconnect();
      logger.warning("Overlay disconnected from Streamer.bot; reconnecting in 10 seconds");
    };

    ws.onerror = function (): void {
      logger.error("Overlay Streamer.bot WebSocket connection failed");
      ws.close();
    };

    //Enable all Events
    ws.onopen = function (): void {
      logger.info("Overlay connected to Streamer.bot; requesting event subscription");
      subscribeToEvents(ws);
    };

    ws.onmessage = function (event: MessageEvent): void {
      // grab message and parse JSON
      const msg = event.data;
      handleMessage(msg);
    };
  }
}

// Setup Electron communication if in Electron environment
function setupElectronCommunication(): void {
  if (typeof window !== "undefined" && window.electronAPI) {
    // Listen for WebSocket messages from the Electron main process
    window.electronAPI.onWebSocketMessage((data) => {
      console.log("Received message from Electron:", data);

      // Process test animation commands from admin panel
      if (data.type === "test-animation") {
        // Convert test animation into Streamer.Bot message format
        const wsdata = {
          event: {
            type: "ChatMessage",
          },
          data: {
            message: {
              message: `!er ${data.animationType}${
                data.params?.count ? ` count ${data.params.count}` : ""
              }`,
              username: data.params?.username || "TestUser",
              emotes: [
                {
                  // Use a default Twitch emote for testing
                  imageUrl:
                    "https://static-cdn.jtvnw.net/emoticons/v1/425618/2.0",
                  name: "test",
                },
              ],
              subscriber: true, // Allow sub-only animations in test mode
            },
          },
        };

        // Use the same message handler as regular Streamer.Bot messages
        handleMessage(JSON.stringify(wsdata));
      } else {
        // Process regular WebSocket messages
        handleMessage(JSON.stringify(data));
      }
    });
  }
}

// Function to process WebSocket messages
function handleMessage(msg: string): void {
  try {
    const settings = OverlaySettings.settings;
    const wsdata: WSData = JSON.parse(msg);

    console.log(wsdata);

    if (wsdata.id === "123" && wsdata.status) {
      if (wsdata.status === "ok") {
        logger.info("Streamer.bot event subscription accepted");
      } else {
        logger.error(`Streamer.bot event subscription failed: ${wsdata.error || wsdata.status}`);
      }
      return;
    }

    //SetupChecks
    if (
      typeof wsdata.actions != "undefined" &&
      typeof wsdata.id == "string" &&
      wsdata.id === "ActionList"
    ) {
      let ChatAction = wsdata.actions.filter(function (SBAction) {
        return SBAction.name == "ERTwitchBotChat";
      });
      console.log(ChatAction);
      if (ChatAction.length >= 1) {
        console.log("True");
        Botchat = true;
      }
    }

    //Check for Undefined WS Events
    if (typeof wsdata.event == "undefined") {
      console.log("Event undefined");
      return;
    }
    if (typeof wsdata.event.type == "undefined") {
      console.log("Event Type undefined");
      return;
    }

    let eventType = wsdata.event.type;

    if (["HypeTrainStart", "HypeTrainUpdate", "HypeTrainLevelUp", "HypeTrainEnd"].includes(eventType)) {
      const enabled = !!(settings.features.hypetrain?.enabled || settings.enableAllFeatures);
      logger.info(`Hype Train event received: ${wsdata.event.source || "Unknown"}.${eventType}; level=${wsdata.data?.level ?? "unspecified"}; test=${wsdata.data?.is_test ?? wsdata.data?.isTest ?? "unspecified"}; enabled=${enabled}`);
      if (!enabled) {
        logger.warning(`Hype Train ${eventType} ignored: feature disabled`);
        return;
      }
    }

    //Pass to ChatMessageHandler
    if (eventType == "ChatMessage") {
      handlers.chatMessageHandler(wsdata);
      if (settings.debug) {
        console.log("Passed to ChatMessageHandler");
      }
      return;
    }

    //Pass to FirstWordsHandler
    if (eventType == "FirstWord") {
      handlers.firstWordsHander(wsdata);
      return;
    }

    if (
      wsdata.event.source !== "Admin" &&
      (eventType == "Sub" ||
        eventType == "ReSub" ||
        eventType == "Resub" ||
        eventType == "GiftBomb" ||
        eventType == "GiftSub" ||
        eventType == "PowerUpRedemption" ||
        eventType == "Cheer")
    ) {
      // Cheer uses message.username. Subs use userName
      const data = wsdata.data;
      const userName = data?.user?.login || data?.user_login || getEventUsername(data);
      const displayName = getEventUsername(data);
      const userId = data?.user?.id || data?.user_id || data?.userId || data?.message?.userId;

      // Retain the recent contributors who may be about to trigger a train.
      if (userName) {
        const now = Date.now();
        globalVars.hypetrainCache = globalVars.hypetrainCache.filter(user => user.timestamp >= now - 120000);
        globalVars.hypetrainCache.push({ username: userName, id: userId, name: displayName, timestamp: now });

        // Current Hype Train updates no longer guarantee a last contribution.
        // Board contributors from their own Twitch events while a train is active.
        if (settings.features.hypetrain?.enabled || settings.enableAllFeatures) {
          animations.hypetrainprogression(userName, false, { id: userId, name: displayName });
        }
      }
    }

    if (eventType == "AutomaticRewardRedemption" || eventType == "PowerUpRedemption") {
      handlers.gigantifyRedeemHandler(wsdata);
      return;
    }

    //Hype Train Events
    if (settings.features.hypetrain?.enabled || settings.enableAllFeatures) {
      //Hype Train Start - Start the repeating train animation with the train head image and the first cart
      if (eventType == "HypeTrainStart") {
        animations.hypetrainstart(wsdata.data?.level);
        animations.hypetrainupdate(wsdata.data);
        return;
      }

      //Hype Train Level Up - Add a cart to the end of the train
      if (eventType == "HypeTrainLevelUp") {
        animations.hypetrainlevelup(wsdata.data?.level);
        animations.hypetrainupdate(wsdata.data);
        return;
      }

      //Hype Progression - Add a user to the current train cart
      if (eventType == "HypeTrainUpdate") {
        if (Number.isInteger(wsdata.data?.level)) {
          animations.hypetrainlevelup(wsdata.data.level);
        }
        animations.hypetrainupdate(wsdata.data);
        return;
      }

      //Hype Train Finish - Remove the Train
      if (eventType == "HypeTrainEnd") {
        animations.hypetrainfinish();
        return;
      }
    }

    //Incoming Raid
    if (eventType == "Raid") {
      handlers.incomingRaidHandler(wsdata);
      return;
    }

    //CoinFlipResults
    if (eventType == "Custom") {
      if (wsdata.data?.coinFlipResult == "undefined") {
        return;
      }

      if (wsdata.data?.coinFlipResult == "Heads") {
        animations.coinflip(1, "Heads");
      }
      if (wsdata.data?.coinFlipResult == "Tails") {
        animations.coinflip(1, "Tails");
      }
    }

    if (eventType == "Event") {
      handlers.customEventHandler(wsdata);
      return;
    }

    //Actions
    if (eventType == "Action") {
      handlers.actionsHandler(wsdata);
      return;
    }
  } catch (error) {
    logger.error(`Error processing WebSocket message: ${(error as Error).message}`);
  }
}

// Export the functions as a single object
export default {
  connectws,
  handleMessage,
};
