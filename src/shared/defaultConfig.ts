import { Settings, AnimationSettings, AnimationList } from "./types";
import { animationRegistry, AnimationDefinition } from "./animationRegistry";

/**
 * Generate default animation settings from the registry
 */
function generateDefaultAnimations(): AnimationList {
  const animations: AnimationList = {};
  
  for (const [name, def] of Object.entries(animationRegistry)) {
    animations[name] = {
      enabled: def.defaultEnabledManual || def.defaultEnabledKappagen,
      enabledManual: def.defaultEnabledManual,
      enabledKappagen: def.defaultEnabledKappagen,
      count: def.defaultCount,
      interval: def.defaultInterval,
    };
    
    // Add text field for text animation
    if (def.requiresText) {
      animations[name].text = "Hype";
    }
  }
  
  return animations;
}

/**
 * Deep merge animation settings, ensuring new animations from registry are added
 * while preserving user's existing settings
 */
export function deepMergeAnimations(
  userAnimations: AnimationList | undefined,
  defaultAnimations: AnimationList
): AnimationList {
  const merged: AnimationList = {};
  
  // Start with all defaults from registry
  for (const [name, defaultSettings] of Object.entries(defaultAnimations)) {
    if (userAnimations && userAnimations[name]) {
      // User has settings for this animation - merge with defaults
      const userSettings = userAnimations[name];
      merged[name] = {
        // Use defaults as base
        ...defaultSettings,
        // Override with user's values if they exist
        enabled: userSettings.enabled ?? defaultSettings.enabled,
        enabledManual: userSettings.enabledManual ?? userSettings.enabled ?? defaultSettings.enabledManual,
        // Support legacy enabledRandom field migration to enabledKappagen
        enabledKappagen: userSettings.enabledKappagen ?? (userSettings as any).enabledRandom ?? userSettings.enabled ?? defaultSettings.enabledKappagen,
        count: userSettings.count ?? defaultSettings.count,
        interval: userSettings.interval ?? defaultSettings.interval,
        text: userSettings.text ?? defaultSettings.text,
      };
    } else {
      // New animation not in user's settings - use defaults
      merged[name] = { ...defaultSettings };
    }
  }
  
  return merged;
}

/**
 * Deep merge full settings, handling nested objects properly
 */
export function deepMergeSettings(
  userSettings: Partial<Settings> | undefined,
  defaults: Settings
): Settings {
  if (!userSettings) {
    return { ...defaults };
  }
  
  return {
    ...defaults,
    ...userSettings,
    // Deep merge features
    features: {
      ...defaults.features,
      ...(userSettings.features || {}),
    },
    // Deep merge animations with special handling for new animations
    animations: deepMergeAnimations(
      userSettings.animations,
      defaults.animations
    ),
  };
}

export const defaultConfig: Settings = {
  streamerBotWebsocketUrl: "ws://localhost:8080/",
  overlayServerPort: 3030,
  twitchUsername: "",
  enableAllAnimations: true,
  enableAllFeatures: true,
  features: {
    lurk: { enabled: true },
    welcome: { enabled: true },
    kappagen: { enabled: true },
    cheers: { enabled: true },
    hypetrain: { enabled: true },
    emoterain: { enabled: true },
    choon: { enabled: true },
  },
  animations: generateDefaultAnimations(),
  maxEmotes: 200,
  subOnly: false,
  defaultEmotes: 100,
  debug: false,
  configFilePath: "",
};
