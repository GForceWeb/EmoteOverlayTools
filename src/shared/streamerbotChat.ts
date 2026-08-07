import type { EmoteData, WSData } from "./types.ts";

export interface NormalizedChatData {
  message: string;
  username: string;
  userId: string;
  subscriber: boolean;
  emotes: EmoteData[];
}

function mapEmotes(emotes: unknown[] | undefined | null): EmoteData[] {
  if (!Array.isArray(emotes)) {
    return [];
  }

  return emotes
    .map((emote) => {
      if (!emote || typeof emote !== "object") {
        return null;
      }

      const record = emote as Record<string, unknown>;
      const imageUrl = typeof record.imageUrl === "string" ? record.imageUrl : "";

      if (!imageUrl) {
        return null;
      }

      return {
        id: typeof record.id === "string" ? record.id : undefined,
        name: typeof record.name === "string" ? record.name : "",
        imageUrl,
        begin:
          typeof record.begin === "number"
            ? record.begin
            : typeof record.startIndex === "number"
              ? record.startIndex
              : undefined,
        end:
          typeof record.end === "number"
            ? record.end
            : typeof record.endIndex === "number"
              ? record.endIndex
              : undefined,
      } as EmoteData;
    })
    .filter((emote): emote is EmoteData => emote !== null);
}

/**
 * Normalize Twitch chat-related websocket payloads.
 * Supports legacy IRC payloads (data.message) and EventSub payloads (data.text/data.user).
 */
export function normalizeChatEventData(
  data?: WSData["data"]
): NormalizedChatData {
  const legacy = data?.message;

  if (legacy && (legacy.message !== undefined || legacy.username !== undefined)) {
    return {
      message: legacy.message || "",
      username: legacy.username || "",
      userId: legacy.userId || "",
      subscriber: legacy.subscriber ?? false,
      emotes: legacy.emotes || [],
    };
  }

  const user = data?.user;

  return {
    message: data?.text || "",
    username: user?.name || user?.login || data?.user_name || "",
    userId: user?.id || data?.user_id || data?.userId || "",
    subscriber: user?.subscribed ?? false,
    emotes: mapEmotes(data?.emotes),
  };
}

export function getEventUsername(data?: WSData["data"]): string | undefined {
  return (
    data?.message?.username ||
    data?.user?.name ||
    data?.user?.login ||
    data?.userName ||
    data?.user_name ||
    undefined
  );
}
