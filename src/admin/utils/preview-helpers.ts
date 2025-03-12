import type { Settings, WSData } from "@/shared/types";

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
        emotes: [
          {
            name: "test",
            imageUrl: "https://static-cdn.jtvnw.net/emoticons/v1/425618/2.0",
          },
        ],
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

  // Determine the command based on feature type
  let featureCommand = "";
  switch (feature) {
    case "welcome":
      featureCommand = `!so @${settings.twitchUsername || "PreviewUser"}`;
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
        emotes: [
          {
            name: "test",
            imageUrl: "https://static-cdn.jtvnw.net/emoticons/v1/425618/2.0",
          },
        ],
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
