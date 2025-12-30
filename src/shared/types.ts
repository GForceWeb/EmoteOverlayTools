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

export interface FeatureList {
  lurk: FeatureSettings;
  welcome: FeatureSettings;
  kappagen: FeatureSettings;
  cheers: FeatureSettings;
  hypetrain: FeatureSettings;
  emoterain: FeatureSettings;
  choon: FeatureSettings;
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
}

export interface GlobalVars {
  channelsub?: boolean; // TODO: Check if the channel is a gforce sub
  hypetrainCache: string[];
  BotChat?: boolean;
  divnumber: number;
  ws: WebSocket;
  warp: HTMLElement;
}

export interface EmoteData {
  name: string;
  imageUrl: string;
}

export interface WSData {
  event?: {
    type?: string;
    source?: string;
  };
  data?: {
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
