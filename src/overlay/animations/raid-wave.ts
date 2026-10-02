import { gsap } from "gsap";
import {
  capRaidRenderCount,
  clampRaidCount,
  createRaidBanner,
  createRaidTile,
  fadeOutAndRemove,
  mountRaidWrapper,
  pickRandom,
  RAID_TILE_COLORS,
  raidViewport,
  raiderLabel,
  scaledSize,
  type RaidStyleOptions,
} from "./raid/shared.ts";

const MAX_RENDERED = 130;

interface CrowdHead {
  el: HTMLDivElement;
  baseY: number;
  col: number;
}

/**
 * The Wave: an ocean of bobbing raider heads carries the leader across the
 * screen on a golden board, throws them sky-high at the apex, then sinks away.
 */
export function raidWave(options: RaidStyleOptions): void {
  const count = clampRaidCount(options.originalRaiderCount ?? options.raiderCount);
  const { width: vw, height: vh } = raidViewport();
  const rendered = capRaidRenderCount(count, MAX_RENDERED);
  const rows = Math.min(7, Math.max(2, Math.ceil(rendered / 24)));
  const cols = Math.ceil(rendered / rows);
  const density = Math.min(1, 60 / rendered);
  const headSize = scaledSize(38) * (0.66 + density * 0.34);
  const colGap = Math.min(headSize * 1.6, (vw * 0.86) / cols);
  const rowGap = headSize * 0.6;
  const crowdWidth = cols * colGap;
  const startX = Math.max(headSize * 0.4, (vw - crowdWidth) / 2);

  const { wrapper, wrapperId } = mountRaidWrapper(
    "raid-wave-wrapper",
    `${options.displayName} is raiding with ${count.toLocaleString("en-US")} raiders`
  );

  const heads: CrowdHead[] = [];
  let index = 0;

  for (let row = 0; row < rows && index < rendered; row++) {
    for (let col = 0; col < cols && index < rendered; col++, index++) {
      const inCol = Math.min(rows, rendered - col * rows);
      const centeredRow = row - (inCol - 1) / 2;
      const el = createRaidTile({
        size: headSize,
        avatarUrl: options.avatarUrl,
        hueRotate: (index * 61) % 360,
        fallbackColor: pickRandom(RAID_TILE_COLORS),
        className: "rwv-head",
        radiusPercent: 50,
      });
      const inner = document.createElement("div");
      inner.className = "rwv-head-inner";
      if (el.style.backgroundImage) {
        inner.style.backgroundImage = el.style.backgroundImage;
        el.style.backgroundImage = "";
      }
      if (el.style.background) {
        inner.style.background = el.style.background;
        el.style.background = "";
      }
      inner.style.setProperty("--rwv-delay", `${(-Math.random() * 2.4).toFixed(2)}s`);
      inner.style.setProperty("--rwv-dur", `${(1.6 + Math.random() * 1).toFixed(2)}s`);
      el.appendChild(inner);

      const baseY = vh - headSize * 1.1 + centeredRow * rowGap;
      gsap.set(el, {
        x: startX + col * colGap,
        y: baseY + vh * 0.45,
        force3D: true,
      });
      el.style.zIndex = `${2000 - Math.round(centeredRow * 10)}`;
      wrapper.appendChild(el);
      heads.push({ el, baseY, col });
    }
  }

  const crowdTopY = vh - headSize * 1.1 - ((rows - 1) / 2) * rowGap;
  const leaderSize = scaledSize(72);
  const rider = document.createElement("div");
  rider.className = "rwv-rider";
  rider.style.width = `${leaderSize * 2.1}px`;
  rider.style.height = `${leaderSize * 1.5}px`;

  const board = document.createElement("div");
  board.className = "rwv-board";
  rider.appendChild(board);

  const riderAvatar = createRaidTile({
    size: leaderSize,
    avatarUrl: options.avatarUrl,
    ring: true,
    className: "rwv-leader",
    radiusPercent: 50,
  });
  rider.appendChild(riderAvatar);

  const riderStartY = crowdTopY - leaderSize * 1.25;
  gsap.set(rider, {
    x: -leaderSize * 4,
    y: riderStartY,
    force3D: true,
  });
  rider.style.zIndex = "5000";
  wrapper.appendChild(rider);

  const banner = createRaidBanner(options.displayName, raiderLabel(count));
  gsap.set(banner, {
    x: vw / 2,
    xPercent: -50,
    y: scaledSize(24),
    opacity: 0,
    scale: 0.8,
    force3D: true,
  });
  wrapper.appendChild(banner);

  const waveAmp = headSize * 1.5;
  const waveOneStart = 1.3;
  const waveTwoStart = 2.5;
  const throwStart = 3.9;
  const exitStart = throwStart + 2.1;
  const totalTime = exitStart + 1.2;

  const timeline = gsap.timeline({
    onComplete: () => wrapper.remove(),
  });

  heads.forEach((head, i) => {
    timeline.to(
      head.el,
      {
        y: head.baseY,
        duration: 0.7,
        ease: "power2.out",
        force3D: true,
      },
      0.1 + i * 0.006
    );
  });

  timeline.fromTo(
    rider,
    { x: -leaderSize * 4 },
    {
      x: vw * 0.44,
      duration: 2.7,
      ease: "sine.inOut",
      force3D: true,
    },
    0.2
  );

  timeline.to(
    rider,
    {
      rotation: 3,
      duration: 0.9,
      yoyo: true,
      repeat: 5,
      ease: "sine.inOut",
      force3D: true,
    },
    0.4
  );

  [waveOneStart, waveTwoStart].forEach((waveStart, waveIndex) => {
    heads.forEach((head) => {
      timeline.to(
        head.el,
        {
          y: `-=${waveAmp}`,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
          force3D: true,
        },
        waveStart + head.col * (waveIndex === 0 ? 0.06 : 0.075)
      );
    });

    timeline.to(
      rider,
      {
        y: `-=${waveAmp * 0.7}`,
        duration: 0.32,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
        force3D: true,
      },
      waveStart + (vw * 0.44 + leaderSize) / (vw + leaderSize) * 0.5
    );
  });

  heads.forEach((head) => {
    timeline.to(
      head.el,
      { y: `+=${headSize * 0.55}`, duration: 0.3, ease: "power2.in", force3D: true },
      throwStart
    );
    timeline.to(
      head.el,
      { y: `-=${headSize * 1.1}`, duration: 0.42, ease: "power2.out", force3D: true },
      throwStart + 0.3
    );
    timeline.to(
      head.el,
      { y: head.baseY, duration: 0.5, ease: "sine.inOut", force3D: true },
      throwStart + 0.75
    );
  });

  timeline.to(
    rider,
    {
      y: riderStartY - vh * 0.34,
      scale: 1.12,
      rotation: -4,
      duration: 0.6,
      ease: "power2.out",
      force3D: true,
    },
    throwStart + 0.3
  );

  const apexX = vw * 0.44 + leaderSize * 1.05;
  const apexY = riderStartY - vh * 0.34 + leaderSize * 0.5;
  for (let s = 0; s < 10; s++) {
    const angle = (s / 10) * Math.PI * 2;
    const sparkle = createRaidTile({
      size: scaledSize(10 + Math.random() * 8),
      fallbackColor: "linear-gradient(160deg, #fff3bf 0%, #ffd166 100%)",
      className: "rwv-sparkle",
      radiusPercent: 50,
    });
    const dist = leaderSize * (1.1 + Math.random() * 0.7);
    gsap.set(sparkle, {
      x: apexX + Math.cos(angle) * dist * 0.5,
      y: apexY + Math.sin(angle) * dist * 0.5,
      scale: 0,
      opacity: 0,
      force3D: true,
    });
    wrapper.appendChild(sparkle);

    timeline.fromTo(
      sparkle,
      { scale: 0, opacity: 1 },
      {
        x: apexX + Math.cos(angle) * dist,
        y: apexY + Math.sin(angle) * dist,
        scale: 1,
        opacity: 0,
        duration: 0.7,
        ease: "power1.out",
        force3D: true,
      },
      throwStart + 0.85
    );
  }

  timeline.to(
    banner,
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
    },
    throwStart + 0.9
  );

  timeline.to(
    rider,
    {
      y: riderStartY - vh * 0.34 - scaledSize(12),
      duration: 0.8,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
      force3D: true,
    },
    throwStart + 0.95
  );

  timeline.to(
    rider,
    {
      x: vw + leaderSize * 3,
      y: riderStartY + vh * 0.1,
      rotation: 24,
      scale: 0.9,
      duration: 0.75,
      ease: "power2.in",
      force3D: true,
    },
    exitStart
  );

  heads.forEach((head, i) => {
    timeline.to(
      head.el,
      {
        y: `+=${vh * 0.6}`,
        duration: 0.6,
        ease: "power2.in",
        force3D: true,
      },
      exitStart + 0.15 + i * 0.004
    );
  });

  timeline.to(
    banner,
    { opacity: 0, duration: 0.35, ease: "power1.in" },
    exitStart + 0.2
  );

  fadeOutAndRemove(timeline, wrapper, wrapperId, totalTime);
}
