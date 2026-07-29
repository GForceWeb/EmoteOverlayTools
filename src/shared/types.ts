// Common Type Definitions

export interface AnimationSettings {
  enabled: boolean;           // Legacy field for backward compatibility
  enabledManual: boolean;     // For !er command (manual trigger)
  enabledKappagen: boolean;   // For !k kappagen random pool
  count?: number;
  interval?: number;
  text?: string;
}

// Use index signature to allow dynamic animation keys
// This allows new animations to be added without type updates
export interface AnimationList {
  [key: string]: AnimationSettings;
}

export interface FeatureSettings {
  enabled: boolean;
}

export type CheersPosition = "center" | "left" | "right";

export interface CheersFeatureSettings extends FeatureSettings {
  quantity: 1 | 2;
  position: CheersPosition;
}

export interface FeatureList {
  lurk: FeatureSettings;
  welcome: FeatureSettings;
  kappagen: FeatureSettings;
  cheers: CheersFeatureSettings;
  hypetrain: FeatureSettings;
  emoterain: FeatureSettings;
  choon: FeatureSettings;
  gigantifyredeem: FeatureSettings;
}

export interface PreviewEmote {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Settings {
  streamerBotWebsocketUrl: string;
  overlayServerPort: number;
  twitchUsername: string;
  enableAllAnimations: boolean;
  enableAllFeatures: boolean;
  features: FeatureList;
  animations: AnimationList;
  maxEmotes: number;
  subOnly: boolean;
  defaultEmotes: number;
  debug: boolean;
  configFilePath: string;
  previewEmotes: PreviewEmote[];
}

export interface GlobalVars {
  channelsub?: boolean; // TODO: Check if the channel is a gforce sub
  hypetrainCache: string[];
  BotChat?: boolean;
  divnumber: number;
  ws: WebSocket | null;
  warp: HTMLElement;
}

export interface EmoteData {
  id?: string;
  name: string;
  imageUrl: string;
  begin?: number;
  end?: number;
}

export interface WSData {
  event?: {
    type?: string;
    source?: string;
  };
  data?: {
    id?: string;
    userId?: string;
    user_id?: string;
    user_login?: string;
    user_name?: string;
    user_input?: string;
    message?: {
      username?: string;
      userId?: string;
      message?: string;
      role?: string;
      subscriber?: boolean;
      emotes?: EmoteData[];
    };
    userName?: string;
    last_contribution?: {
      user_id?: string;
    };
    name?: string;
    coinFlipResult?: string;
    from_broadcaster_user_id?: string;
    from_broadcaster_user_name?: string;
    viewers?: number;
    reward_type?: string;
    cost?: number;
    message_text?: string;
    message_emotes?: EmoteData[];
    gigantified_emote?: EmoteData;
    redeemed_at?: string;
  };
  actions?: any[];
  id?: string;
}

export interface AnimationModule {
  [key: string]: (images: string[], count?: any, interval?: number) => void;
}

export interface LogEntry {
  timestamp: string;
  type: "info" | "warning" | "error";
  source: "main" | "overlay" | "admin";
  message: string;
}
