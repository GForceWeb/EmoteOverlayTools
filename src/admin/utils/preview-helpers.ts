import type { Settings, WSData, EmoteData } from "@/shared/types";

/**
 * Get a reference to the overlay iframe
 * @returns The iframe element or null if not found
 */
export const getOverlayIframe = (): HTMLIFrameElement | null => {
  const iframe = document.getElementById("overlay-iframe") as HTMLIFrameElement;
  if (!iframe || !iframe.contentWindow) {
    console.error("Overlay iframe not found or not accessible");
    return null;
  }
  return iframe;
};

/**
 * Get the emotes to use for preview based on settings
 */
const getPreviewEmotes = (settings: Settings): EmoteData[] => {
  // Use custom preview emotes if set, otherwise use default Kappa
  if (settings.previewEmotes && settings.previewEmotes.length > 0) {
    return settings.previewEmotes.map(e => ({
      name: e.name,
      imageUrl: e.imageUrl,
    }));
  }
  
  // Default fallback
  return [{
    name: "Kappa",
    imageUrl: "https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/2.0",
  }];
};

/**
 * Preview an animation by sending a message to the iframe
 */
export const previewAnimation = (
  animation: string,
  config: any,
  settings: Settings
): void => {
  const iframe = getOverlayIframe();
  if (!iframe) return;

  // Determine the message content based on animation type
  const messageContent =
    animation === "text"
      ? `!er ${animation} ${config.text || "Preview Text"}`
      : `!er ${animation} ${config.count || 10} ${config.interval || 100}`;

  // Get custom preview emotes from settings
  const previewEmotes = getPreviewEmotes(settings);

  // Construct the message
  const wsMessage: WSData = {
    event: {
      source: "Twitch",
      type: "ChatMessage",
    },
    data: {
      message: {
        username: settings.twitchUsername || "PreviewUser",
        userId: "123456789", // Placeholder user ID
        message: messageContent,
        subscriber: true,
        emotes: previewEmotes,
      },
    },
  };

  // Send the message to the iframe
  iframe.contentWindow?.postMessage(
    {
      type: "PREVIEW_ANIMATION",
      animation: animation,
      wsdata: wsMessage,
    },
    "*"
  );

  console.log(`Previewing animation: ${animation} with config:`, wsMessage);
};

/**
 * Preview a feature by sending a message to the iframe
 */
export const previewFeature = (
  feature: string,
  config: any,
  settings: Settings
): void => {
  const iframe = getOverlayIframe();
  if (!iframe) return;

  const previewEmotes = getPreviewEmotes(settings);

  if (feature === "gigantifyredeem") {
    const gigantifiedEmoteUrl =
      previewEmotes[0]?.imageUrl ||
      "https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/3.0";

    const wsMessage: WSData = {
      event: {
        source: "Admin",
        type: "AutomaticRewardRedemption",
      },
      data: {
        userId: "123456789",
        userName: settings.twitchUsername || "gforce_bot",
        rewardType: "gigantify_an_emote",
        rewardTitle: "Gigantify an Emote",
        gigantifiedEmoteName: previewEmotes[0]?.name || "Kappa",
        gigantifiedEmoteUrl,
      },
    };

    iframe.contentWindow?.postMessage(
      {
        type: "PREVIEW_FEATURE",
        feature: feature,
        wsdata: wsMessage,
        config: config,
      },
      "*"
    );

    console.log(`Previewing feature: ${feature}`, wsMessage);
    return;
  }

  // Determine the command based on feature type
  let featureCommand = "";
  switch (feature) {
    case "welcome":
      featureCommand = `!so @${settings.twitchUsername || "GForce_Bot"}`;
      break;
    case "lurk":
      featureCommand = "!lurk";
      break;
    case "choon":
      featureCommand = "!choon";
      break;
    case "cheers":
      featureCommand = "!cheers @gforce_bot";
      break;
    case "hypetrain":
      featureCommand = "!hypetrainpreview";
      break;
    default:
      featureCommand = `!${feature}`;
  }

  // Construct the message
  const wsMessage: WSData = {
    event: {
      source: "Admin",
      type: "ChatMessage",
    },
    data: {
      message: {
        username: settings.twitchUsername || "gforce_bot",
        userId: "123456789", // Placeholder user ID
        message: featureCommand,
        subscriber: true,
        emotes: previewEmotes,
      },
    },
  };

  // Send the message to the iframe
  iframe.contentWindow?.postMessage(
    {
      type: "PREVIEW_FEATURE",
      feature: feature,
      wsdata: wsMessage,
      config: config,
    },
    "*"
  );

  console.log(
    `Previewing feature: ${feature} with command: ${featureCommand}`,
    wsMessage
  );
};
