import { globalVars } from "../config.ts";
import { playLightning } from "../lib/lightning/renderer.ts";

/** Count is an emote budget: 25 count per strike, capped at ten strikes. */
export function lightning(images: string[], count = 200, interval = 50): void {
  playLightning(globalVars.warp, images, count, interval);
}
