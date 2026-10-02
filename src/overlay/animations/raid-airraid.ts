import { gsap } from "gsap";
import {
  capRaidRenderCount,
  clampRaidCount,
  createRaidBanner,
  createRaidTile,
  fadeOutAndRemove,
  mountRaidWrapper,
  pickRandom,
  raidViewport,
  raiderLabel,
  scaledSize,
  type RaidStyleOptions,
} from "./raid/shared.ts";

const MAX_RENDERED = 130;

const METEOR_COLORS = [
  "linear-gradient(160deg, #ffe8a3 0%, #ff9f1c 100%)",
  "linear-gradient(160deg, #ffd166 0%, #e5383b 100%)",
  "linear-gradient(160deg, #fff3bf 0%, #fb8500 100%)",
];

interface Meteor {
  el: HTMLDivElement;
  burst: HTMLDivElement;
  startDelay: number;
  duration: number;
  impactTime: number;
  targetX: number;
  targetY: number;
}

/**
 * Air Raid: the leader crashes down like a comet, then the raid rains in as
 * a staggered meteor barrage around the impact crater before jetting off.
 */
export function raidAirRaid(options: RaidStyleOptions): void {
  const count = clampRaidCount(options.originalRaiderCount ?? options.raiderCount);
  const { width: vw, height: vh } = raidViewport();
  const rendered = capRaidRenderCount(count, MAX_RENDERED);
  const spread = Math.min(1, count / 150);
  const radiusX = vw * (0.16 + 0.26 * spread);
  const radiusY = vh * (0.1 + 0.2 * spread);
  const cx = vw / 2;
  const cy = vh * 0.46;

  const { wrapper, wrapperId } = mountRaidWrapper(
    "raid-airraid-wrapper",
    `${options.displayName} is raiding with ${count.toLocaleString("en-US")} raiders`
  );

  const banner = createRaidBanner(options.displayName, raiderLabel(count));
  gsap.set(banner, {
    x: cx,
    xPercent: -50,
    y: scaledSize(24),
    opacity: 0,
    scale: 0.8,
    force3D: true,
  });

  const flash = document.createElement("div");
  flash.className = "rar-flash";
  gsap.set(flash, { opacity: 0 });
  wrapper.appendChild(flash);

  const leaderSize = scaledSize(88);
  const leader = createRaidTile({
    size: leaderSize,
    avatarUrl: options.avatarUrl,
    ring: true,
    className: "rar-comet",
    radiusPercent: 50,
  });
  const leaderTrail = document.createElement("div");
  leaderTrail.className = "rar-trail";
  leader.appendChild(leaderTrail);
  const leaderLandY = cy - leaderSize * 0.2;
  gsap.set(leader, { x: cx - leaderSize / 2, y: -leaderSize * 1.6, force3D: true });
  leader.style.zIndex = "5000";
  wrapper.appendChild(leader);

  const shockRings = [0, 1].map((i) => {
    const ring = document.createElement("div");
    ring.className = "rar-shock";
    ring.style.width = `${leaderSize * 1.5}px`;
    ring.style.height = `${leaderSize * 1.5}px`;
    gsap.set(ring, {
      x: cx - leaderSize * 0.75,
      y: leaderLandY + leaderSize / 2 - leaderSize * 0.75,
      scale: 0.25,
      opacity: 0,
      force3D: true,
    });
    ring.style.zIndex = `${4500 - i}`;
    wrapper.appendChild(ring);
    return ring;
  });

  const followerCount = Math.max(0, rendered - 1);
  const meteorStagger = Math.min(0.03, 2.4 / Math.max(followerCount, 1));
  const firstImpact = 1.35;
  const meteors: Meteor[] = [];

  for (let i = 0; i < followerCount; i++) {
    const size = scaledSize(26 + Math.random() * 14) * (0.75 + spread * 0.25);
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    const targetX = cx + Math.cos(angle) * radiusX * r - size / 2;
    const targetY = cy + Math.sin(angle) * radiusY * r - size / 2;
    const el = createRaidTile({
      size,
      avatarUrl: options.avatarUrl,
      hueRotate: options.avatarUrl ? (i * 41) % 360 : undefined,
      fallbackColor: pickRandom(METEOR_COLORS),
      className: "rar-meteor",
      radiusPercent: 50,
    });
    const meteorTrail = document.createElement("div");
    meteorTrail.className = "rar-trail";
    el.appendChild(meteorTrail);
    const burst = document.createElement("div");
    burst.className = "rar-burst";
    el.appendChild(burst);

    const delay = firstImpact + i * meteorStagger + Math.random() * meteorStagger * 0.5;
    const duration = 0.5 + Math.random() * 0.4;
    const startDelay = delay - duration * 0.55;

    gsap.set(el, {
      x: targetX + (Math.random() - 0.5) * vw * 0.1,
      y: -size * 2,
      rotation: 36 + Math.random() * 10,
      force3D: true,
    });
    el.style.zIndex = `${Math.round(1000 + targetY)}`;
    wrapper.appendChild(el);

    meteors.push({
      el,
      burst,
      startDelay: Math.max(startDelay, 0.1),
      duration,
      impactTime: Math.max(startDelay, 0.1) + duration,
      targetX,
      targetY,
    });
  }

  wrapper.appendChild(banner);

  const lastImpact = firstImpact + followerCount * meteorStagger + 0.9;
  const hopStart = lastImpact + 0.3;
  const jetStart = hopStart + 1.6;
  const totalTime = jetStart + 1.2;

  const timeline = gsap.timeline({
    onComplete: () => wrapper.remove(),
  });

  timeline.fromTo(
    leader,
    { y: -leaderSize * 1.6 },
    {
      y: leaderLandY,
      duration: 0.9,
      ease: "power3.in",
      force3D: true,
    },
    0.2
  );

  timeline.fromTo(
    flash,
    { opacity: 0 },
    { opacity: 0.85, duration: 0.08, ease: "none" },
    1.1
  );
  timeline.to(
    flash,
    { opacity: 0, duration: 0.5, ease: "power1.out" },
    1.18
  );

  timeline.fromTo(
    wrapper,
    { x: 0 },
    { x: 9, duration: 0.05, yoyo: true, repeat: 7, ease: "none" },
    1.1
  );

  shockRings.forEach((ring, i) => {
    timeline.fromTo(
      ring,
      { scale: 0.25, opacity: 0.95 },
      { scale: 4.2, opacity: 0, duration: 0.85, ease: "power1.out", force3D: true },
      1.1 + i * 0.16
    );
  });

  meteors.forEach((meteor) => {
    timeline.fromTo(
      meteor.el,
      { y: -scaledSize(80) },
      {
        x: meteor.targetX,
        y: meteor.targetY,
        duration: meteor.duration,
        ease: "power2.in",
        force3D: true,
      },
      meteor.startDelay
    );
    timeline.fromTo(
      meteor.burst,
      { scale: 0.25, opacity: 0.9 },
      { scale: 2.4 + Math.random(), opacity: 0, duration: 0.5, ease: "power1.out", force3D: true },
      meteor.impactTime
    );
    timeline.to(
      meteor.el,
      {
        scaleY: 0.7,
        scaleX: 1.18,
        duration: 0.09,
        yoyo: true,
        repeat: 1,
        ease: "none",
        force3D: true,
      },
      meteor.impactTime
    );
  });

  timeline.to(
    [leader, ...meteors.map((m) => m.el)],
    {
      y: "-=34",
      duration: 0.24,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
      stagger: 0.006,
      force3D: true,
    },
    hopStart
  );

  timeline.to(
    banner,
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
    },
    hopStart + 0.2
  );

  const jetDir = Math.random() < 0.5 ? 1 : -1;
  const jetTargets = [leader, ...meteors.map((m) => m.el)];
  jetTargets.forEach((el, i) => {
    timeline.to(
      el,
      {
        x: jetDir > 0 ? vw + 160 : -160,
        y: vh * (0.3 + Math.random() * 0.4),
        rotation: jetDir * (18 + Math.random() * 14),
        duration: 0.7 + Math.random() * 0.2,
        ease: "power2.in",
        force3D: true,
      },
      jetStart + i * 0.0035
    );
  });

  timeline.to(
    banner,
    { opacity: 0, duration: 0.35, ease: "power1.in" },
    jetStart + 0.25
  );

  fadeOutAndRemove(timeline, wrapper, wrapperId, totalTime);
}
