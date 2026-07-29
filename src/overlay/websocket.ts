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
          "HypeTrainStart",
          "HypeTrainUpdate",
          "HypeTrainLevelUp",
          "HypeTrainEnd",
          "Raid",
          "Cheer",
          "Sub",
          "Resub",
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

  const { type, feature, config, wsdata } = event.data;

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
  isElectron = checkElectron();

  if (isElectron) {
    logger.info("Running in Electron environment, using IPC for messages");
    setupElectronCommunication();

    window.addEventListener("message", handleElectronMessage);
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

    ws.onclose = function (): void {
      if (globalVars.ws === ws) {
        globalVars.ws = null;
      }

      scheduleReconnect();
    };

    ws.onerror = function (): void {
      ws.close();
    };

    //Enable all Events
    ws.onopen = function (): void {
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

    if (eventType == "AutomaticRewardRedemption") {
      handlers.gigantifyRedeemHandler(wsdata);
      return;
    }

    if (
      eventType == "Sub" ||
      eventType == "Resub" ||
      eventType == "GiftBomb" ||
      eventType == "GiftSub" ||
      eventType == "Cheer"
    ) {
      // Cheer uses message.username. Subs use userName
      let userName = getEventUsername(wsdata.data);

      //Add user to the front of the array
      if (userName) {
        globalVars.hypetrainCache.unshift(userName);

        //clear the end of cache if too long
        if (globalVars.hypetrainCache[3]) {
          globalVars.hypetrainCache.pop();
        }
      }
    }

    //Hype Train Events
    if (settings.features.hypetrain || settings.enableAllFeatures) {
      //Hype Train Start - Start the repeating train animation with the train head image and the first cart
      if (eventType == "HypeTrainStart") {
        animations.hypetrain.hypetrainstart();
        return;
      }

      //Hype Train Level Up - Add a cart to the end of the train
      if (eventType == "HypeTrainLevelUp") {
        animations.hypetrain.hypetrainlevelup();
        return;
      }

      //Hype Progression - Add a user to the current train cart
      if (eventType == "HypeTrainUpdate") {
        const userId = wsdata.data?.last_contribution?.user_id;
        if (userId) {
          animations.hypetrain.hypetrainprogression(userId);
        }
        return;
      }

      //Hype Train Finish - Remove the Train
      if (eventType == "HypeTrainEnd") {
        animations.hypetrain.hypetrainfinish();
        return;
      }
    }

    //Incoming Raid
    if (eventType == "Raid") {
      //animations.hypetrain.incomingRaid(wsdata.data.from_broadcaster_user_id, wsdata.data.from_broadcaster_user_name, wsdata.data.viewers);
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
