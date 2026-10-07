// Common Type Definitions

export type BubblesPoppingBehaviour =
  | "burst"
  | "burstAndFall"
  | "randomPerBubble"
  | "randomPerActivation";

export type SpiralPathBehaviour =
  | "unified"
  | "randomPerEmote"
  | "randomPerActivation";

/** Cube / dodecahedron: where the shape sits and how it moves */
export type ShapePositionMovement =
  | "centered"
  | "dvd"
  | "diceRoll"
  | "randomise";

/** Right / left wave: the path style emotes use while crossing the screen */
export type WaveStyle = "sway" | "ocean" | "both";

export interface AnimationSettings {
  enabled: boolean;           // Legacy field for backward compatibility
  enabledManual: boolean;     // For !er command (manual trigger)
  enabledKappagen: boolean;   // For !k kappagen random pool
  count?: number;
  interval?: number;
  text?: string;
  /** Bubbles: how bubbles finish — burst, fall, or random */
  poppingBehaviour?: BubblesPoppingBehaviour;
  /** Spiral: how the spiral path is chosen per activation */
  pathBehaviour?: SpiralPathBehaviour;
  /** Cube / dodecahedron: position and movement style */
  positionMovement?: ShapePositionMovement;
  /** Right / left wave: swaying drift, literal ocean wave, or random per trigger */
  waveStyle?: WaveStyle;
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

/** Which incoming-raid animation plays: a fixed style or "random" per raid. */
export type RaidAnimationStyle =
  | "random"
  | "stampede"
  | "countoff"
  | "murmuration"
  | "airraid"
  | "wave"
  | "grandprix";

export interface RaidFeatureSettings extends FeatureSettings {
  capEnabled: boolean;
  maxRaiders: number;
  /** Which raid animation style to play ("random" picks a new one each raid). */
  animationStyle: RaidAnimationStyle;
  /** How many times the raid pack charges across the screen (alternating direction). */
  chargePasses: number;
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
  raids: RaidFeatureSettings;
}

export interface PreviewEmote {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Settings {
  connectionMode: "streamerbot" | "twitch";
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
  startIndex?: number;
  endIndex?: number;
}

export interface StreamerBotTwitchUser {
  id?: string;
  login?: string;
  name?: string;
  subscribed?: boolean;
  subscriptionTier?: string;
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
    text?: string;
    user?: StreamerBotTwitchUser;
    emotes?: EmoteData[];
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
    rewardType?: string;
    reward?: { type?: string; rewardType?: string };
    type?: string;
    bits?: number;
    emote?: {
      imageUrl?: string;
      url?: string;
      text?: string;
      type?: string;
      zeroWidth?: boolean;
    };
    gigantifiedEmoteUrl?: string;
    gigantifiedEmote?: { imageUrl?: string; url?: string };
    cost?: number;
    message_text?: string;
    message_emotes?: EmoteData[];
    gigantified_emote?: EmoteData;
    redeemed_at?: string;
    redeemedAt?: string;
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
