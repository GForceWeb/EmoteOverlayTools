import { gsap } from "gsap";
import {
  clampRaidCount,
  createRaidBanner,
  createRaidTile,
  fadeOutAndRemove,
  formatRaiderCount,
  mountRaidWrapper,
  pickRandom,
  RAID_TILE_COLORS,
  raidViewport,
  raiderLabel,
  scaledSize,
  type RaidStyleOptions,
} from "./raid/shared.ts";

const PIXEL_GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ",": ["00000", "00000", "00000", "00000", "00110", "00110", "01100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
};

const GLYPH_WIDTH = 5;
const GLYPH_HEIGHT = 7;
const GLYPH_GAP = 1;

interface MosaicTile {
  el: HTMLDivElement;
  x: number;
  y: number;
  angle: number;
}

function mosaicLabel(count: number): string {
  const formatted = formatRaiderCount(count);
  const glyphs = formatted
    .split("")
    .filter((char) => PIXEL_GLYPHS[char] != null)
    .slice(0, 7);

  return glyphs.length > 0 ? glyphs.join("") : "1";
}

/**
 * The Count-Off: the raider count builds as a giant pixel-mosaic of avatar
 * tiles, the leader crashes down on top with a shockwave, then the mosaic
 * bursts apart.
 */
export function raidCountOff(options: RaidStyleOptions): void {
  const count = clampRaidCount(options.originalRaiderCount ?? options.raiderCount);
  const { width: vw, height: vh } = raidViewport();
  const label = mosaicLabel(count);
  const totalCols = label.length * GLYPH_WIDTH + (label.length - 1) * GLYPH_GAP;
  const cell = Math.max(
    8,
    Math.min(
      (vw * 0.58) / totalCols,
      (vh * 0.36) / GLYPH_HEIGHT,
      scaledSize(64)
    )
  );
  const tileSize = cell * 0.85;
  const originX = (vw - totalCols * cell) / 2;
  const originY = vh * 0.52 - (GLYPH_HEIGHT * cell) / 2;

  const { wrapper, wrapperId } = mountRaidWrapper(
    "raid-countoff-wrapper",
    `${options.displayName} is raiding with ${count.toLocaleString("en-US")} raiders`
  );

  const banner = createRaidBanner(options.displayName, "0 raiders");
  wrapper.appendChild(banner);
  gsap.set(banner, {
    x: vw / 2,
    xPercent: -50,
    y: Math.min(vh * 0.86, originY + GLYPH_HEIGHT * cell + tileSize * 0.8),
    opacity: 0,
    scale: 0.85,
    force3D: true,
  });

  const tiles: MosaicTile[] = [];
  let tileIndex = 0;

  for (let g = 0; g < label.length; g++) {
    const glyph = PIXEL_GLYPHS[label[g]];

    for (let row = 0; row < GLYPH_HEIGHT; row++) {
      for (let col = 0; col < GLYPH_WIDTH; col++) {
        if (glyph[row][col] !== "1") {
          continue;
        }

        const useAvatar = tileIndex % 6 === 0 && options.avatarUrl;
        const tile = createRaidTile({
          size: tileSize,
          avatarUrl: useAvatar ? options.avatarUrl : undefined,
          hueRotate: useAvatar ? (tileIndex * 47) % 360 : undefined,
          fallbackColor: pickRandom(RAID_TILE_COLORS),
          className: "rco-tile",
          radiusPercent: 24,
        });

        const x = originX + (g * (GLYPH_WIDTH + GLYPH_GAP) + col) * cell + (cell - tileSize) / 2;
        const y = originY + row * cell + (cell - tileSize) / 2;
        const angle = Math.atan2(y - vh / 2, x - vw / 2) + (Math.random() - 0.5) * 0.6;

        gsap.set(tile, { x, y, scale: 0, opacity: 0, force3D: true });
        wrapper.appendChild(tile);
        tiles.push({ el: tile, x, y, angle });
        tileIndex++;
      }
    }
  }

  const leaderSize = Math.max(tileSize * 3.4, scaledSize(110));
  const leader = createRaidTile({
    size: leaderSize,
    avatarUrl: options.avatarUrl,
    ring: true,
    className: "rco-leader",
    radiusPercent: 50,
  });
  const leaderX = vw / 2 - leaderSize / 2;
  const leaderY = originY - leaderSize * 0.86;
  gsap.set(leader, { x: leaderX, y: -leaderSize * 2, force3D: true });
  wrapper.appendChild(leader);

  const rings = [0, 1].map(() => {
    const ring = document.createElement("div");
    ring.className = "rco-ring";
    ring.style.width = `${leaderSize * 1.3}px`;
    ring.style.height = `${leaderSize * 1.3}px`;
    gsap.set(ring, {
      x: vw / 2 - leaderSize * 0.65,
      y: leaderY + leaderSize / 2 - leaderSize * 0.65,
      scale: 0.3,
      opacity: 0,
      force3D: true,
    });
    wrapper.appendChild(ring);
    return ring;
  });

  const stagger = Math.min(0.022, 1.5 / Math.max(tiles.length, 1));
  const assemblyTime = 0.15 + tiles.length * stagger;
  const landTime = assemblyTime * 0.55 + 0.15;
  const holdStart = assemblyTime + 0.75;
  const exitTime = holdStart + 1.6;
  const totalTime = exitTime + 1.1;

  const timeline = gsap.timeline({
    onComplete: () => wrapper.remove(),
  });

  const ticker = { v: 0 };
  timeline.to(
    ticker,
    {
      v: count,
      duration: assemblyTime,
      ease: "power2.inOut",
      onUpdate: () => {
        banner.querySelector(".raid-name-subtitle")!.textContent =
          raiderLabel(Math.round(ticker.v));
      },
    },
    0.15
  );

  tiles.forEach((tile, i) => {
    timeline.fromTo(
      tile.el,
      { scale: 0, opacity: 0, rotation: -30 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.36, ease: "back.out(2)", force3D: true },
      0.15 + i * stagger
    );
  });

  timeline.to(
    leader,
    {
      y: leaderY,
      duration: 0.62,
      ease: "power3.in",
      force3D: true,
    },
    landTime
  );

  timeline.fromTo(
    wrapper,
    { x: 0 },
    { x: 7, duration: 0.05, yoyo: true, repeat: 5, ease: "none" },
    landTime + 0.6
  );

  rings.forEach((ring, i) => {
    timeline.fromTo(
      ring,
      { scale: 0.3, opacity: 0.95 },
      { scale: 3.6, opacity: 0, duration: 0.75, ease: "power1.out", force3D: true },
      landTime + 0.58 + i * 0.14
    );
  });

  timeline.to(
    banner,
    {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: "back.out(1.6)",
    },
    landTime + 0.65
  );

  timeline.to(
    wrapper,
    {
      scale: 1.02,
      duration: 0.55,
      yoyo: true,
      repeat: 3,
      ease: "sine.inOut",
      force3D: true,
    },
    holdStart
  );

  tiles.forEach((tile, i) => {
    const dist = vw * 0.55 + Math.random() * vw * 0.35;
    timeline.to(
      tile.el,
      {
        x: tile.x + Math.cos(tile.angle) * dist,
        y: tile.y + Math.sin(tile.angle) * dist,
        rotation: (Math.random() - 0.5) * 440,
        opacity: 0,
        duration: 0.75,
        ease: "power2.in",
        force3D: true,
      },
      exitTime + i * 0.002
    );
  });

  timeline.to(
    leader,
    {
      y: -leaderSize * 2.4,
      rotation: -14,
      duration: 0.65,
      ease: "power2.in",
      force3D: true,
    },
    exitTime + 0.12
  );

  timeline.to(
    banner,
    {
      opacity: 0,
      duration: 0.35,
      ease: "power1.in",
    },
    exitTime + 0.3
  );

  fadeOutAndRemove(timeline, wrapper, wrapperId, totalTime);
}
