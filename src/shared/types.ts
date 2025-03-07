// Common Type Definitions

export interface AnimationToggles {
  rain: boolean;
  rise: boolean;
  explode: boolean;
  volcano: boolean;
  firework: boolean;
  rightwave: boolean;
  leftwave: boolean;
  carousel: boolean;
  spiral: boolean;
  comets: boolean;
  dvd: boolean;
  text: boolean;
  cyclone: boolean;
  tetris: boolean;
  bounce: boolean;
  cube: boolean;
  fade: boolean;
  invaders: boolean;
}

export interface FeatureToggles {
  lurk: boolean;
  welcome: boolean;
  kappagen: boolean;
  cheers: boolean;
  hypetrain: boolean;
  emoterain: boolean;
  choon: boolean;
}

export interface Settings {
  serverUrl: string;
  serverPort: number;
  twitchUsername: string;
  allAnimations: boolean;
  allFeatures: boolean;
  selectedFeatures: string[];
  selectedAnimations: AnimationToggles;
  features: FeatureToggles;
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
