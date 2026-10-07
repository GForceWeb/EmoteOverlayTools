export type ConnectionMode = "streamerbot" | "twitch";

export interface TwitchStatus {
  configured: boolean;
  state: "disconnected" | "connecting" | "connected" | "error";
  username?: string;
  userCode?: string;
  verificationUri?: string;
  error?: string;
  warnings: string[];
}

export const TWITCH_SCOPES = [
  "user:read:chat",
  "channel:read:subscriptions",
  "bits:read",
  "channel:read:hype_train",
  "channel:read:redemptions",
];

// The logged-in broadcaster is also the chat reader. No separate bot is needed.
export function twitchSubscriptions(userId: string) {
  const channel = { broadcaster_user_id: userId };
  return [
    { type: "channel.chat.message", version: "1", condition: { ...channel, user_id: userId } },
    { type: "channel.raid", version: "1", condition: { to_broadcaster_user_id: userId } },
    { type: "stream.online", version: "1", condition: channel },
    { type: "channel.subscribe", version: "1", condition: channel },
    { type: "channel.subscription.message", version: "1", condition: channel },
    { type: "channel.subscription.gift", version: "1", condition: channel },
    { type: "channel.bits.use", version: "1", condition: channel },
    { type: "channel.channel_points_automatic_reward_redemption.add", version: "2", condition: channel },
    { type: "channel.hype_train.begin", version: "2", condition: channel },
    { type: "channel.hype_train.progress", version: "2", condition: channel },
    { type: "channel.hype_train.end", version: "2", condition: channel },
  ];
}
