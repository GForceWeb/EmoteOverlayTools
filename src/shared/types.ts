// Common Type Definitions

export interface AnimationSettings {
  enabled: boolean;
  count?: number;
  interval?: number;
  text?: string;
}

export interface AnimationList {
  rain: AnimationSettings;
  rise: AnimationSettings;
  explode: AnimationSettings;
  volcano: AnimationSettings;
  firework: AnimationSettings;
  rightwave: AnimationSettings;
  leftwave: AnimationSettings;
  carousel: AnimationSettings;
  spiral: AnimationSettings;
  comets: AnimationSettings;
  dvd: AnimationSettings;
  text: AnimationSettings;
  cyclone: AnimationSettings;
  tetris: AnimationSettings;
  bounce: AnimationSettings;
  cube: AnimationSettings;
  fade: AnimationSettings;
  invaders: AnimationSettings;
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
  serverUrl: string;
  serverPort: number;
  twitchUsername: string;
  enableAllAnimations: boolean;
  enableAllFeatures: boolean;
  features: FeatureList;
  animations: AnimationList;
  maxEmotes: number;
  subOnly: boolean;
  defaultEmotes: number;
  debug: boolean;
}

export interface GlobalVars {
  channelsub?: boolean; // TODO: Check if the channel is a gforce sub
  hypetrainCache: string[];
  BotChat?: boolean;
  divnumber: number;
  defaultemotes: number;
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
