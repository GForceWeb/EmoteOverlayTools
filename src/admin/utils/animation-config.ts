import type { AnimationSettings, Settings } from "@/shared/types";
import { animationRegistry } from "@/shared/animationRegistry";

export const SHAPE_ANIMATIONS_WITH_POSITION_MOVEMENT = new Set([
  "cube",
  "dodecahedron",
]);

export const WAVE_ANIMATIONS_WITH_STYLE = new Set(["rightwave", "leftwave"]);

/** Build the default config for an animation from its registry definition. */
export function getDefaultAnimationConfig(
  animationName: string
): AnimationSettings {
  const def = animationRegistry[animationName];
  return {
    enabled: def?.defaultEnabledManual || def?.defaultEnabledKappagen || true,
    enabledManual: def?.defaultEnabledManual ?? true,
    enabledKappagen: def?.defaultEnabledKappagen ?? true,
    count: def?.defaultCount ?? 50,
    interval: def?.defaultInterval ?? 50,
    text: def?.requiresText ? "Hype" : undefined,
    ...(animationName === "bubbles"
      ? { poppingBehaviour: "randomPerActivation" as const }
      : {}),
    ...(animationName === "spiral"
      ? { pathBehaviour: "unified" as const }
      : {}),
    ...(SHAPE_ANIMATIONS_WITH_POSITION_MOVEMENT.has(animationName)
      ? { positionMovement: "centered" as const }
      : {}),
    ...(WAVE_ANIMATIONS_WITH_STYLE.has(animationName)
      ? { waveStyle: "sway" as const }
      : {}),
  };
}

/** Resolve an animation's effective config: saved settings layered over registry defaults. */
export function resolveAnimationConfig(
  settings: Settings,
  animationName: string
): AnimationSettings {
  const def = animationRegistry[animationName];
  const existing = settings.animations[animationName];
  const defaults = getDefaultAnimationConfig(animationName);

  // If no existing settings, return defaults
  if (!existing) {
    return defaults;
  }

  return {
    enabled: existing.enabled ?? defaults.enabled,
    enabledManual:
      existing.enabledManual ?? existing.enabled ?? defaults.enabledManual,
    // Use enabledKappagen, fallback to legacy enabledRandom, then to defaults
    enabledKappagen:
      existing.enabledKappagen ??
      (existing as { enabledRandom?: boolean }).enabledRandom ??
      defaults.enabledKappagen,
    count: existing.count ?? defaults.count,
    interval: existing.interval ?? defaults.interval,
    text: existing.text ?? defaults.text,
    poppingBehaviour: existing.poppingBehaviour ?? defaults.poppingBehaviour,
    pathBehaviour: existing.pathBehaviour ?? defaults.pathBehaviour,
    positionMovement: existing.positionMovement ?? defaults.positionMovement,
    waveStyle: existing.waveStyle ?? defaults.waveStyle,
  };
}
