import type {
  BubblesPoppingBehaviour,
  CheersPosition,
  RaidAnimationStyle,
  Settings,
  ShapePositionMovement,
  SpiralPathBehaviour,
  WaveStyle,
} from "@/shared/types";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export const BUBBLES_POPPING_BEHAVIOUR_OPTIONS: SelectOption<BubblesPoppingBehaviour>[] = [
  { value: "burst", label: "Burst" },
  { value: "burstAndFall", label: "Burst and emote fall" },
  { value: "randomPerBubble", label: "Random per bubble" },
  { value: "randomPerActivation", label: "Random per activation" },
];

export const SPIRAL_PATH_BEHAVIOUR_OPTIONS: SelectOption<SpiralPathBehaviour>[] = [
  { value: "unified", label: "Unified path" },
  { value: "randomPerEmote", label: "Randomised paths" },
  { value: "randomPerActivation", label: "Random per activation" },
];

export const SHAPE_POSITION_MOVEMENT_OPTIONS: SelectOption<ShapePositionMovement>[] = [
  { value: "centered", label: "Centered + No Movement" },
  { value: "dvd", label: "DVD Movement" },
  { value: "diceRoll", label: "Dice Roll" },
  { value: "randomise", label: "Randomise" },
];

export const WAVE_STYLE_OPTIONS: SelectOption<WaveStyle>[] = [
  { value: "sway", label: "Sway (individual drift)" },
  { value: "ocean", label: "Ocean wave" },
  { value: "both", label: "Both (random per trigger)" },
];

export const RAID_STYLE_OPTIONS: SelectOption<RaidAnimationStyle>[] = [
  { value: "random", label: "Random (new style each raid)" },
  { value: "countoff", label: "The Count-Off — mosaic digits" },
  { value: "murmuration", label: "The Murmuration — flock swoop" },
  { value: "airraid", label: "Air Raid — meteor impacts" },
  { value: "wave", label: "The Wave — crowd surf" },
  { value: "grandprix", label: "Grand Prix — race start" },
  { value: "stampede", label: "Stampede — classic charge" },
];

export const CHEERS_QUANTITY_OPTIONS: SelectOption<"1" | "2">[] = [
  { value: "1", label: "1 animation" },
  { value: "2", label: "2 animations" },
];

export const CHEERS_POSITION_OPTIONS: SelectOption<CheersPosition>[] = [
  { value: "center", label: "Center" },
  { value: "left", label: "Left Side" },
  { value: "right", label: "Right Side" },
];

export const FEATURE_LABELS: Record<keyof Settings["features"], string> = {
  lurk: "Lurk",
  welcome: "Welcome",
  kappagen: "Kappagen",
  cheers: "Cheers",
  hypetrain: "Hype Train",
  emoterain: "Emote Rain",
  choon: "Choon",
  gigantifyredeem: "Gigantify Emote Redeems",
  raids: "Raids",
};

export const FEATURE_DESCRIPTIONS: Record<keyof Settings["features"], string> = {
  lurk: "Show animations when viewers go into lurk mode",
  welcome: "Display welcome messages for new viewers",
  kappagen: "Generate Kappa emotes on certain events",
  cheers: "Special animations for Twitch Bits cheers",
  hypetrain: "Animations during Hype Train events",
  emoterain: "Make it rain emotes on command",
  choon: "Music-related animations and effects",
  gigantifyredeem: "Animate Twitch Gigantify an Emote power-up redemptions",
  raids: "Animate incoming raids — the raiding channel leads the show in your chosen style.",
};
