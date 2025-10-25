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
  traffic: AnimationSettings;
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
  configFilePath?: string;
}

export interface GlobalVars {
  channelsub?: boolean;
  hypetrainCache: string[];
  BotChat?: boolean;
  divnumber: number;
  defaultemotes: number;
  ws: WebSocket;
  warp: HTMLElement;
}

export interface LogEntry {
  timestamp: Date;
  type: "info" | "warning" | "error";
  message: string;
}
