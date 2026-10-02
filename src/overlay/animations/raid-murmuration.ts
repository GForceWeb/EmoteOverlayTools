import { gsap } from "gsap";
import {
  clampRaidCount,
  createRaidBanner,
  createRaidTile,
  fadeOutAndRemove,
  mountRaidWrapper,
  raidViewport,
  raiderLabel,
  scaledSize,
  type RaidStyleOptions,
} from "./raid/shared.ts";

const MAX_RENDERED = 110;

interface FlockMember {
  el: HTMLDivElement;
  isLeader: boolean;
  size: number;
  phase: number;
  wander: number;
  slotAngle: number;
  slotRadius: number;
}

/**
 * The Murmuration: the leader leads a starling-style flock in swooping
 * S-curves, the flock gathers into a spinning vortex, then bursts outward.
 */
export function raidMurmuration(options: RaidStyleOptions): void {
  const count = clampRaidCount(options.originalRaiderCount ?? options.raiderCount);
  const { width: vw, height: vh } = raidViewport();
  const density = Math.min(1, 70 / Math.max(count, 1));
  const followerCount = Math.min(
    Math.max(0, count - 1),
    MAX_RENDERED
  );

  const { wrapper, wrapperId } = mountRaidWrapper(
    "raid-murmuration-wrapper",
    `${options.displayName} is raiding with ${count.toLocaleString("en-US")} raiders`
  );

  const flock = document.createElement("div");
  flock.className = "rmu-flock";
  wrapper.appendChild(flock);

  const banner = createRaidBanner(options.displayName, raiderLabel(count));
  wrapper.appendChild(banner);
  gsap.set(banner, {
    x: vw / 2,
    xPercent: -50,
    y: scaledSize(24),
    opacity: 0,
    force3D: true,
  });

  const baseY = vh * 0.42;
  const amp = vh * 0.2;
  const leaderSize = scaledSize(58);
  const members: FlockMember[] = [];

  const leader = createRaidTile({
    size: leaderSize,
    avatarUrl: options.avatarUrl,
    ring: true,
    className: "rmu-bird rmu-leader",
    radiusPercent: 46,
  });
  gsap.set(leader, { x: -leaderSize * 3, y: baseY, force3D: true });
  leader.style.zIndex = "5000";
  flock.appendChild(leader);
  members.push({
    el: leader,
    isLeader: true,
    size: leaderSize,
    phase: 0,
    wander: 0,
    slotAngle: 0,
    slotRadius: 0,
  });

  for (let i = 0; i < followerCount; i++) {
    const size =
      scaledSize(22 + Math.random() * 12) * (0.72 + density * 0.28);
    const tile = createRaidTile({
      size,
      avatarUrl: options.avatarUrl,
      hueRotate: (i * 53 + 20) % 360,
      className: "rmu-bird",
      radiusPercent: 46,
    });

    gsap.set(tile, {
      x: -size * 3,
      y: baseY,
      scale: 0.9 + Math.random() * 0.2,
      force3D: true,
    });
    tile.style.zIndex = `${Math.round(1000 + i % 40)}`;
    flock.appendChild(tile);
    members.push({
      el: tile,
      isLeader: false,
      size,
      phase: Math.random(),
      wander: 0.5 + Math.random() * 0.7,
      slotAngle: 0,
      slotRadius: 0,
    });
  }

  assignVortexSlots(members);

  const passDuration = 2.9;
  const passGap = 0.35;
  const gatherStart = passDuration * 2 + passGap + 0.2;
  const vortexStart = gatherStart + 0.85;
  const exitStart = vortexStart + 1.5;
  const totalTime = exitStart + 0.9;

  const timeline = gsap.timeline({
    onComplete: () => wrapper.remove(),
  });

  timeline.to(
    banner,
    { opacity: 1, duration: 0.5, ease: "power2.out" },
    0.25
  );

  for (let pass = 0; pass < 2; pass++) {
    const goingRight = pass % 2 === 0;
    const dir = goingRight ? 1 : -1;
    const spread = pass === 0 ? 1 : 0.7;
    const startX = goingRight ? -vw * 0.15 : vw * 1.15;
    const endX = goingRight ? vw * 1.15 : -vw * 0.15;
    const passStart = pass * (passDuration + passGap);

    members.forEach((member) => {
      const laneOffset = member.isLeader
        ? 0
        : (member.phase - 0.5) * vh * 0.34 * spread;
      const waveScale = member.isLeader ? 1 : member.wander * spread;
      const upFirst = (member.phase > 0.5) !== goingRight;
      const yStart = baseY + laneOffset;
      const yPeak = baseY + laneOffset - amp * waveScale * (upFirst ? 1 : -1);
      const yReturn = baseY + laneOffset + amp * waveScale * (upFirst ? 0.55 : -0.55);
      const duration = passDuration / (member.isLeader ? 1.05 : 0.9 + Math.random() * 0.25);

      timeline.set(
        member.el,
        { x: startX + (goingRight ? -member.size : member.size), y: yStart },
        passStart
      );
      timeline.to(
        member.el,
        { x: endX, duration, ease: "none", force3D: true },
        passStart + Math.random() * 0.12
      );
      timeline.to(
        member.el,
        { y: yPeak, duration: duration / 2, ease: "sine.inOut", force3D: true },
        passStart
      );
      timeline.to(
        member.el,
        { y: yReturn, duration: duration / 2, ease: "sine.inOut", force3D: true },
        passStart + duration / 2
      );
      timeline.to(
        member.el,
        {
          rotation: dir * (member.isLeader ? 12 : 6 + Math.random() * 8),
          duration: duration / 2,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
          force3D: true,
        },
        passStart
      );
    });
  }

  timeline.to(
    banner,
    { opacity: 0, duration: 0.35, ease: "power1.in" },
    gatherStart - 0.15
  );

  members.forEach((member, i) => {
    const targetX = vw / 2 + Math.cos(member.slotAngle) * member.slotRadius - member.size / 2;
    const targetY = baseY + Math.sin(member.slotAngle) * member.slotRadius * 0.85 - member.size / 2;

    timeline.to(
      member.el,
      {
        x: member.isLeader ? vw / 2 - member.size / 2 : targetX,
        y: member.isLeader ? baseY - member.size / 2 - scaledSize(6) : targetY,
        rotation: 0,
        scale: 1,
        duration: 0.75,
        ease: "power2.inOut",
        force3D: true,
      },
      gatherStart + i * 0.004
    );
  });

  timeline.to(
    flock,
    { rotation: 540, duration: 1.55, ease: "power1.in", force3D: true },
    vortexStart
  );

  members.forEach((member, i) => {
    const burstRadius = Math.max(vw, vh) * (0.7 + Math.random() * 0.4);
    const burstX = vw / 2 + Math.cos(member.slotAngle) * burstRadius;
    const burstY = baseY + Math.sin(member.slotAngle) * burstRadius * 0.85;

    timeline.to(
      member.el,
      {
        x: member.isLeader ? vw / 2 + vw * 0.3 : burstX - member.size / 2,
        y: member.isLeader ? -vh : baseY + Math.sin(member.slotAngle) * burstRadius * 0.85 - member.size / 2,
        scale: member.isLeader ? 1.15 : 0.6,
        opacity: 0,
        duration: member.isLeader ? 0.7 : 0.55 + Math.random() * 0.2,
        ease: "power2.in",
        force3D: true,
      },
      exitStart + (member.isLeader ? 0.12 : i * 0.003)
    );
  });

  timeline.to(
    flock,
    { rotation: 720, duration: 0.9, ease: "power2.in", force3D: true },
    exitStart
  );

  fadeOutAndRemove(timeline, wrapper, wrapperId, totalTime);
}

function assignVortexSlots(members: FlockMember[]): void {
  const followers = members.filter((member) => !member.isLeader);
  const baseRadius = scaledSize(64);
  const ringGap = scaledSize(52);
  let ring = 0;
  let placed = 0;

  while (placed < followers.length) {
    const radius = baseRadius + ring * ringGap;
    const circumference = 2 * Math.PI * radius * 0.85;
    const slots = Math.max(4, Math.floor(circumference / scaledSize(34)));

    for (let s = 0; s < slots && placed < followers.length; s++, placed++) {
      const member = followers[placed];
      member.slotRadius = radius * (0.92 + Math.random() * 0.16);
      member.slotAngle =
        (s / slots) * Math.PI * 2 + ring * 0.7 + (Math.random() - 0.5) * 0.22;
    }

    ring++;
  }
}
