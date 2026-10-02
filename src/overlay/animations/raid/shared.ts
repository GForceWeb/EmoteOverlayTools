import { globalVars } from "../../config.ts";
import helpers from "../../helpers.ts";

export interface RaidStyleOptions {
  avatarUrl: string;
  displayName: string;
  raiderCount: number;
  originalRaiderCount?: number;
}

/** Gradient fallbacks used when only one avatar (the leader's) is available. */
export const RAID_TILE_COLORS: string[] = [
  "linear-gradient(160deg, #ff8fa3 0%, #e5383b 100%)",
  "linear-gradient(160deg, #ffd166 0%, #f4a261 100%)",
  "linear-gradient(160deg, #95d5b2 0%, #2d6a4f 100%)",
  "linear-gradient(160deg, #a2d2ff 0%, #1d5b9e 100%)",
  "linear-gradient(160deg, #cdb4db 0%, #6d3b8e 100%)",
  "linear-gradient(160deg, #ffddd2 0%, #e07a5f 100%)",
  "linear-gradient(160deg, #b8f2e6 0%, #2a9d8f 100%)",
  "linear-gradient(160deg, #fde4cf 0%, #fb8500 100%)",
];

export function clampRaidCount(value: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

/**
 * Visual safety cap: raids can arrive with thousands of viewers when the
 * renderer cap is disabled. Effects and formation size still scale with the
 * real count, but the number of DOM elements is bounded here.
 */
export function capRaidRenderCount(count: number, max: number): number {
  return Math.min(Math.max(1, Math.floor(count)), max);
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export interface RaidTileOptions {
  size: number;
  avatarUrl?: string;
  /** Hue rotation for crowd variety without extra image fetches. */
  hueRotate?: number;
  fallbackColor?: string;
  className?: string;
  ring?: boolean;
  radiusPercent?: number;
}

export function createRaidTile(options: RaidTileOptions): HTMLDivElement {
  const tile = document.createElement("div");
  tile.className = `raid-tile${options.className ? ` ${options.className}` : ""}`;
  tile.style.width = `${options.size}px`;
  tile.style.height = `${options.size}px`;

  if (options.radiusPercent != null) {
    tile.style.borderRadius = `${options.radiusPercent}%`;
  }

  if (options.avatarUrl) {
    tile.style.backgroundImage = `url("${options.avatarUrl}")`;
  } else if (options.fallbackColor) {
    tile.style.background = options.fallbackColor;
  }

  if (options.hueRotate) {
    tile.style.filter = `hue-rotate(${options.hueRotate}deg) saturate(1.08)`;
  }

  if (options.ring) {
    tile.style.boxShadow =
      "0 0 calc(var(--reference-pixel) * 16) rgba(255, 209, 102, 0.8), " +
      "0 0 0 calc(var(--reference-pixel) * 3) rgba(255, 209, 102, 0.95), " +
      "0 calc(var(--reference-pixel) * 6) calc(var(--reference-pixel) * 14) rgba(0, 0, 0, 0.4)";
  }

  return tile;
}

export function createRaidBanner(
  displayName: string,
  subtitle: string
): HTMLDivElement {
  const banner = document.createElement("div");
  banner.className = "raid-name-banner";

  const title = document.createElement("div");
  title.className = "raid-name-title";
  title.textContent = displayName;

  const subtitleEl = document.createElement("div");
  subtitleEl.className = "raid-name-subtitle";
  subtitleEl.textContent = subtitle;

  banner.append(title, subtitleEl);
  return banner;
}

export function mountRaidWrapper(
  className: string,
  ariaLabel: string
): { wrapper: HTMLDivElement; wrapperId: string } {
  const wrapper = document.createElement("div");
  const wrapperId = `raid-style-${Date.now()}-${Math.round(Math.random() * 10000)}`;
  wrapper.id = wrapperId;
  wrapper.className = `raid-style-wrapper ${className}`;
  wrapper.setAttribute("aria-label", ariaLabel);
  wrapper.style.width = `${window.innerWidth}px`;
  wrapper.style.height = `${window.innerHeight}px`;

  globalVars.warp.appendChild(wrapper);
  return { wrapper, wrapperId };
}

export function scheduleCleanup(
  wrapper: HTMLElement,
  wrapperId: string,
  totalSeconds: number
): void {
  window.setTimeout(() => {
    if (document.getElementById(wrapperId) === wrapper) {
      wrapper.remove();
    }
  }, (totalSeconds + 2.5) * 1000);
}

export function fadeOutAndRemove(
  tl: gsap.core.Timeline,
  wrapper: HTMLElement,
  wrapperId: string,
  atTime: number
): void {
  tl.to(
    wrapper,
    {
      opacity: 0,
      duration: 0.4,
      ease: "power1.in",
    },
    atTime
  );
  tl.call(() => wrapper.remove(), undefined, atTime + 0.5);
  scheduleCleanup(wrapper, wrapperId, atTime + 0.5);
}

export function raidViewport(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function scaledSize(px: number): number {
  return helpers.scaleRelativeToViewport(px);
}

/** Formatted viewer count for banners; compact for very large raids. */
export function formatRaiderCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }

  if (count >= 100_000) {
    return `${Math.round(count / 1000).toLocaleString("en-US")}K`;
  }

  return count.toLocaleString("en-US");
}

export function raiderLabel(count: number): string {
  return `${formatRaiderCount(count)} raider${count === 1 ? "" : "s"}`;
}
