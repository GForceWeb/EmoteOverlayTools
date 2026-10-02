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

const MAX_RENDERED = 120;
const PER_ROW = 5;

const KART_COLORS = [
  "linear-gradient(180deg, #ff8fa3 0%, #e5383b 100%)",
  "linear-gradient(180deg, #95d5b2 0%, #2d6a4f 100%)",
  "linear-gradient(180deg, #a2d2ff 0%, #1d5b9e 100%)",
  "linear-gradient(180deg, #cdb4db 0%, #6d3b8e 100%)",
  "linear-gradient(180deg, #ffddd2 0%, #e07a5f 100%)",
  "linear-gradient(180deg, #b8f2e6 0%, #2a9d8f 100%)",
];

interface Kart {
  el: HTMLDivElement;
  smoke: HTMLDivElement;
  baseX: number;
  row: number;
}

/**
 * Grand Prix: the raid lines up on a starting grid behind the leader, revs
 * through a three-light countdown, then launches offscreen in a wall of smoke.
 */
export function raidGrandPrix(options: RaidStyleOptions): void {
  const count = clampRaidCount(options.originalRaiderCount ?? options.raiderCount);
  const { width: vw, height: vh } = raidViewport();
  const rendered = capRaidRenderCount(count, MAX_RENDERED);
  const rows = Math.ceil(rendered / PER_ROW);
  const kartWidth = scaledSize(64) * (rows > 5 ? 0.78 : 1);
  const kartHeight = kartWidth * 0.62;
  const slotWidth = kartWidth * 1.22;
  const rowHeight = kartHeight * 0.95;
  const groundY = vh * 0.88;
  const gridWidth = PER_ROW * slotWidth;
  const gridStartX = (vw - gridWidth) / 2 + slotWidth * 0.1;

  const { wrapper, wrapperId } = mountRaidWrapper(
    "raid-grandprix-wrapper",
    `${options.displayName} is raiding with ${count.toLocaleString("en-US")} raiders`
  );

  const gantry = document.createElement("div");
  gantry.className = "rgp-gantry";
  const lights = [0, 1, 2].map(() => {
    const light = document.createElement("div");
    light.className = "rgp-light";
    gantry.appendChild(light);
    return light;
  });
  wrapper.appendChild(gantry);

  const banner = createRaidBanner(options.displayName, raiderLabel(count));
  gsap.set(banner, {
    x: vw / 2,
    xPercent: -50,
    y: scaledSize(76),
    opacity: 0,
    scale: 0.85,
    force3D: true,
  });
  wrapper.appendChild(banner);

  const karts: Kart[] = [];
  const riderSize = kartWidth * 0.62;

  for (let i = 0; i < rendered; i++) {
    const isLeader = i === 0;
    const row = Math.floor(i / PER_ROW);
    const slot = i % PER_ROW;
    const depthScale = 1 - row * 0.022;
    const width = kartWidth * depthScale;
    const baseX = gridStartX + slot * slotWidth;
    const baseY = groundY - row * rowHeight - kartHeight;

    const el = document.createElement("div");
    el.className = `rgp-kart${isLeader ? " rgp-kart-leader" : ""}`;
    el.style.width = `${width}px`;
    el.style.height = `${kartHeight * depthScale}px`;

    const body = document.createElement("div");
    body.className = "rgp-body";
    body.style.background = isLeader
      ? "linear-gradient(180deg, #ffe08a 0%, #ffb703 100%)"
      : pickRandom(KART_COLORS);
    el.appendChild(body);

    const wheelBack = document.createElement("div");
    wheelBack.className = "rgp-wheel rgp-wheel-back";
    const wheelFront = document.createElement("div");
    wheelFront.className = "rgp-wheel rgp-wheel-front";
    el.append(wheelBack, wheelFront);

    const rider = createRaidTile({
      size: riderSize * depthScale,
      avatarUrl: isLeader ? options.avatarUrl : options.avatarUrl,
      hueRotate: isLeader ? undefined : (i * 47) % 360,
      ring: isLeader,
      className: "rgp-rider",
      radiusPercent: 50,
    });
    el.appendChild(rider);

    const smoke = document.createElement("div");
    smoke.className = "rgp-smoke";
    el.appendChild(smoke);

    gsap.set(el, { x: baseX, y: baseY, force3D: true });
    el.style.zIndex = `${1000 + (rows - row) * 10}`;
    wrapper.appendChild(el);
    karts.push({ el, smoke, baseX, row });
  }

  const beatStart = 0.7;
  const beatGap = 0.85;
  const greenTime = beatStart + beatGap * 3;
  const launchTime = greenTime + 0.12;
  const totalTime = launchTime + rows * 0.1 + 1.9;

  const timeline = gsap.timeline({
    onComplete: () => wrapper.remove(),
  });

  timeline.to(
    banner,
    { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
    0.25
  );

  [0, 1, 2].forEach((beat) => {
    const beatTime = beatStart + beat * beatGap;
    const shakeAmp = 1.5 + beat * 1.4;

    timeline.call(
      () => lights[beat].classList.add("lit-red"),
      undefined,
      beatTime
    );
    timeline.to(
      karts.map((kart) => kart.el),
      {
        x: `+=${shakeAmp}`,
        duration: 0.055,
        yoyo: true,
        repeat: 3 + beat,
        ease: "none",
        force3D: true,
      },
      beatTime + 0.1
    );
  });

  timeline.call(
    () => lights.forEach((light) => light.classList.add("lit-green")),
    undefined,
    greenTime
  );

  timeline.fromTo(
    wrapper,
    { x: 0 },
    { x: 5, duration: 0.04, yoyo: true, repeat: 5, ease: "none" },
    greenTime
  );

  karts.forEach((kart) => {
    const startT = launchTime + kart.row * 0.1 + Math.random() * 0.06;

    timeline.to(
      kart.el,
      {
        x: kart.baseX + vw * 0.95,
        duration: 1.05 + kart.row * 0.1 + Math.random() * 0.25,
        ease: "power3.in",
        force3D: true,
      },
      startT
    );

    timeline.fromTo(
      kart.smoke,
      { scale: 0.3, opacity: 0.9, x: 0, y: 0 },
      {
        scale: 2.6,
        opacity: 0,
        x: -kartWidth * 1.1,
        duration: 0.8,
        ease: "power1.out",
        force3D: true,
      },
      startT
    );
  });

  timeline.to(
    banner,
    { opacity: 0, duration: 0.35, ease: "power1.in" },
    greenTime + 0.8
  );

  fadeOutAndRemove(timeline, wrapper, wrapperId, totalTime);
}
