import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

type Point = {
  x: number;
  y: number;
};

type TrampolineGeometry = {
  centerX: number;
  leftX: number;
  rightX: number;
  width: number;
  height: number;
  topY: number;
  surfaceY: number;
  landingMinX: number;
  landingMaxX: number;
};

type ExitType = "up" | "left" | "right";

const MIN_BOUNCES = 3;
const MAX_BOUNCES = 5;

export function trampoline(
  images: string[],
  count: number = 18,
  interval: number = 140
): void {
  if (images.length === 0) {
    return;
  }

  const geometry = getTrampolineGeometry();
  const trampolineId = createTrampolineBase(geometry);
  const imgcount = images.length;
  const safeCount = Math.max(1, Math.floor(count));
  const safeInterval = Math.max(20, interval);
  const estimatedLifetime = safeCount * safeInterval + 12000;

  for (let j = 0; j < safeCount; j++) {
    const imagenum = j % imgcount;
    setTimeout(() => {
      createTrampolineEmote(images[imagenum], geometry, trampolineId);
    }, j * safeInterval);
  }

  setTimeout(() => {
    fadeOutTrampolineBase(trampolineId);
  }, estimatedLifetime);
}

function getTrampolineGeometry(): TrampolineGeometry {
  const width = innerWidth * 0.3;
  const height = Math.max(
    helpers.scaleRelativeToHeight(150),
    width * 0.26
  );
  const centerX = innerWidth / 2;
  const topY = innerHeight - height - helpers.scaleRelativeToHeight(34);
  const leftX = centerX - width / 2;
  const rightX = centerX + width / 2;
  const surfaceY = topY + height * 0.3;

  return {
    centerX,
    leftX,
    rightX,
    width,
    height,
    topY,
    surfaceY,
    landingMinX: leftX + width * 0.12,
    landingMaxX: rightX - width * 0.12,
  };
}

function createTrampolineBase(geometry: TrampolineGeometry): string {
  const trampoline = document.createElement("div");
  trampoline.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  trampoline.className = "trampoline-base";
  trampoline.innerHTML = getTrampolineSvg(trampoline.id);

  gsap.set(trampoline, {
    x: geometry.centerX,
    y: geometry.topY,
    width: geometry.width,
    height: geometry.height,
    xPercent: -50,
    opacity: 0,
    transformOrigin: "50% 100%",
  });

  globalVars.warp.appendChild(trampoline);

  gsap.to(trampoline, {
    duration: 0.35,
    opacity: 1,
    ease: "power2.out",
  });

  gsap.fromTo(
    trampoline,
    { scaleY: 0.95 },
    {
      scaleY: 1,
      duration: 0.4,
      ease: "back.out(1.4)",
    }
  );

  return trampoline.id;
}

function getTrampolineSvg(idPrefix: string): string {
  const frameGradientId = `trampoline-frame-gradient-${idPrefix}`;
  const matGradientId = `trampoline-mat-gradient-${idPrefix}`;
  const legGradientId = `trampoline-leg-gradient-${idPrefix}`;

  return `
    <svg viewBox="0 0 600 220" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${frameGradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8f99a3" />
          <stop offset="50%" stop-color="#dbe1e8" />
          <stop offset="100%" stop-color="#7f8b97" />
        </linearGradient>
        <linearGradient id="${matGradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4d6168" />
          <stop offset="100%" stop-color="#162026" />
        </linearGradient>
        <linearGradient id="${legGradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#6d7782" />
          <stop offset="100%" stop-color="#313942" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="202" rx="268" ry="14" fill="rgba(0, 0, 0, 0.22)" />
      <g class="trampoline-legs">
        <path d="M100 128 L52 202" stroke="url(#${legGradientId})" stroke-width="18" stroke-linecap="round" />
        <path d="M500 128 L548 202" stroke="url(#${legGradientId})" stroke-width="18" stroke-linecap="round" />
        <path d="M205 126 L172 202" stroke="url(#${legGradientId})" stroke-width="14" stroke-linecap="round" />
        <path d="M395 126 L428 202" stroke="url(#${legGradientId})" stroke-width="14" stroke-linecap="round" />
        <line x1="52" y1="202" x2="172" y2="202" stroke="#273039" stroke-width="10" stroke-linecap="round" />
        <line x1="428" y1="202" x2="548" y2="202" stroke="#273039" stroke-width="10" stroke-linecap="round" />
      </g>
      <g class="trampoline-springs" stroke="#d6dee6" stroke-width="4" stroke-linecap="round">
        <path d="M58 102 L88 118" />
        <path d="M110 89 L138 112" />
        <path d="M172 80 L192 106" />
        <path d="M235 73 L245 101" />
        <path d="M300 70 L300 100" />
        <path d="M365 73 L355 101" />
        <path d="M428 80 L408 106" />
        <path d="M490 89 L462 112" />
        <path d="M542 102 L512 118" />
      </g>
      <g class="trampoline-surface">
        <ellipse cx="300" cy="85" rx="258" ry="38" fill="#ff7f3f" opacity="0.95" />
        <ellipse cx="300" cy="90" rx="232" ry="28" fill="url(#${matGradientId})" />
        <ellipse cx="300" cy="88" rx="172" ry="15" fill="rgba(255, 255, 255, 0.08)" />
      </g>
      <ellipse cx="300" cy="106" rx="270" ry="33" fill="none" stroke="url(#${frameGradientId})" stroke-width="18" />
    </svg>`;
}

function fadeOutTrampolineBase(trampolineId: string): void {
  const trampoline = document.getElementById(trampolineId);

  if (!trampoline) {
    return;
  }

  gsap.to(trampoline, {
    opacity: 0,
    duration: 0.4,
    ease: "power1.in",
    onComplete: () => {
      helpers.removeelement(trampolineId);
    },
  });
}

function createTrampolineEmote(
  image: string,
  geometry: TrampolineGeometry,
  trampolineId: string
): void {
  const emoteSize = helpers.getCSSPixelValue(
    "--emote-size-standard",
    helpers.scaleRelativeToViewport(75)
  );
  const baseScale = helpers.Randomizer(0.82, 1.18);
  const spawnPoint = getSpawnPoint(geometry, emoteSize);
  const landingPoint = getLandingPoint(geometry, emoteSize);
  const Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  const sprite = document.createElement("div");
  sprite.className = "trampoline-emote-sprite";

  gsap.set(Div, {
    className: "trampoline-element",
    x: spawnPoint.x,
    y: spawnPoint.y,
    z: helpers.Randomizer(-180, 180),
    opacity: 0,
  });

  gsap.set(sprite, {
    width: "100%",
    height: "100%",
    scale: baseScale,
    rotation: helpers.Randomizer(-18, 18),
    backgroundImage: "url(" + image + ")",
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    transformOrigin: "50% 50%",
  });

  Div.appendChild(sprite);

  globalVars.warp.appendChild(Div);

  const timeline = buildBounceTimeline(
    Div,
    sprite,
    spawnPoint,
    landingPoint,
    geometry,
    trampolineId,
    baseScale
  );
  const lifetime = Math.max(1000, timeline.totalDuration() * 1000 + 500);

  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, lifetime);
}

function getSpawnPoint(
  geometry: TrampolineGeometry,
  emoteSize: number
): Point {
  const useLeftSide = Math.random() < 0.5;
  const sidePadding = helpers.scaleRelativeToWidth(120);
  const maxX = Math.max(innerWidth - emoteSize, 0);
  const x = useLeftSide
    ? helpers.Randomizer(-emoteSize * 0.2, Math.max(geometry.leftX - sidePadding, 0))
    : helpers.Randomizer(
        Math.min(geometry.rightX + sidePadding, maxX),
        maxX + emoteSize * 0.2
      );

  return {
    x,
    y: helpers.Randomizer(
      helpers.scaleRelativeToHeight(40),
      Math.max(helpers.scaleRelativeToHeight(180), innerHeight * 0.55)
    ),
  };
}

function getLandingPoint(
  geometry: TrampolineGeometry,
  emoteSize: number
): Point {
  return {
    x: helpers.Randomizer(
      geometry.landingMinX,
      Math.max(geometry.landingMinX + 1, geometry.landingMaxX - emoteSize)
    ),
    y: geometry.surfaceY - emoteSize * 0.78,
  };
}

function buildBounceTimeline(
  element: HTMLElement,
  sprite: HTMLElement,
  spawnPoint: Point,
  landingPoint: Point,
  geometry: TrampolineGeometry,
  trampolineId: string,
  baseScale: number
): gsap.core.Timeline {
  const timeline = gsap.timeline();
  const bounceCount = Math.floor(helpers.Randomizer(MIN_BOUNCES, MAX_BOUNCES + 1));
  const approachDuration = helpers.Randomizer(0.8, 1.35);
  const approachApex: Point = {
    x: (spawnPoint.x + landingPoint.x) / 2 + helpers.Randomizer(-geometry.width * 0.08, geometry.width * 0.08),
    y: Math.max(
      helpers.scaleRelativeToHeight(35),
      Math.min(spawnPoint.y, landingPoint.y) - helpers.Randomizer(geometry.height * 0.8, geometry.height * 1.45)
    ),
  };

  timeline.to(element, {
    opacity: 1,
    duration: 0.18,
    ease: "power1.out",
  });

  timeline.to(
    element,
    {
      duration: approachDuration,
      ease: "power2.in",
      motionPath: {
        path: [spawnPoint, approachApex, landingPoint],
        curviness: 1.15,
      },
      scale: baseScale * 1.04,
    },
    0
  );

  timeline.to(
    sprite,
    {
      rotation: `+=${helpers.Randomizer(-60, 60)}`,
      duration: approachDuration,
      ease: "sine.inOut",
    },
    0
  );

  timeline.add(() => pulseTrampoline(trampolineId, 0.22));
  timeline.add(() => impactEmote(sprite, baseScale));

  let currentPoint = landingPoint;
  const bounceTopMargin = helpers.scaleRelativeToHeight(42);
  const firstBounceApexY = Math.max(
    bounceTopMargin,
    Math.min(
      helpers.Randomizer(innerHeight * 0.18, innerHeight * 0.24),
      landingPoint.y - geometry.height * 0.95
    )
  );
  let bounceHeight = Math.max(geometry.height * 1.2, landingPoint.y - firstBounceApexY);
  let bounceDuration = helpers.Randomizer(0.78, 1.05);

  for (let bounceIndex = 0; bounceIndex < bounceCount; bounceIndex++) {
    const nextX = clamp(
      currentPoint.x + helpers.Randomizer(-geometry.width * 0.1, geometry.width * 0.1),
      geometry.landingMinX,
      geometry.landingMaxX
    );
    const nextLanding: Point = {
      x: nextX,
      y: landingPoint.y,
    };
    const apexY = Math.max(bounceTopMargin, landingPoint.y - bounceHeight);
    const apex: Point = {
      x: (currentPoint.x + nextLanding.x) / 2 + helpers.Randomizer(-geometry.width * 0.05, geometry.width * 0.05),
      y: apexY,
    };
    const trickType = pickBounceTrick();
    const launchDuration = bounceDuration * 0.44;
    const landingDuration = bounceDuration * 0.56;

    timeline.to(element, {
      duration: launchDuration,
      x: apex.x,
      y: apex.y,
      ease: "power2.out",
    });

    timeline.to(element, {
      duration: landingDuration,
      x: nextLanding.x,
      y: nextLanding.y,
      ease: "power3.in",
    });

    addBounceTrick(timeline, sprite, trickType, bounceDuration, baseScale);
    timeline.add(() => pulseTrampoline(trampolineId, Math.max(0.08, 0.18 - bounceIndex * 0.02)));
    timeline.add(() => impactEmote(sprite, baseScale));

    currentPoint = nextLanding;
    bounceHeight *= helpers.Randomizer(0.72, 0.84);
    bounceDuration *= helpers.Randomizer(0.97, 1.01);
  }

  addExitSequence(timeline, element, sprite, currentPoint, geometry, baseScale);

  return timeline;
}

function impactEmote(element: HTMLElement, baseScale: number): void {
  gsap.killTweensOf(element, "scale,scaleX,scaleY");

  gsap.fromTo(
    element,
    {
      scaleX: baseScale * 1.16,
      scaleY: baseScale * 0.84,
    },
    {
      scaleX: baseScale,
      scaleY: baseScale,
      duration: 0.18,
      ease: "back.out(1.7)",
      overwrite: false,
    }
  );
}

function pulseTrampoline(trampolineId: string, amount: number): void {
  const trampoline = document.getElementById(trampolineId);
  const surface = trampoline?.querySelector(".trampoline-surface") as SVGGElement | null;

  if (!surface) {
    return;
  }

  gsap.fromTo(
    surface,
    {
      scaleY: 1,
      y: 0,
      transformOrigin: "50% 50%",
    },
    {
      scaleY: Math.max(0.8, 1 - amount),
      y: amount * 45,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
      overwrite: true,
    }
  );
}

function pickBounceTrick(): string {
  const roll = Math.random();

  if (roll < 0.36) {
    return "wiggle";
  }

  if (roll < 0.58) {
    return "squash";
  }

  if (roll < 0.77) {
    return "forwardFlip";
  }

  if (roll < 0.9) {
    return "backFlip";
  }

  return "tilt";
}

function addBounceTrick(
  timeline: gsap.core.Timeline,
  element: HTMLElement,
  trickType: string,
  duration: number,
  baseScale: number
): void {
  const trickDuration = Math.max(0.24, duration * 0.9);
  const startAt = `>-${duration}`;

  if (trickType === "wiggle") {
    timeline.to(
      element,
      {
        duration: trickDuration / 3,
        rotation: `+=${helpers.Randomizer(12, 24)}`,
        yoyo: true,
        repeat: 2,
        ease: "sine.inOut",
      },
      startAt
    );
    return;
  }

  if (trickType === "squash") {
    timeline.to(
      element,
      {
        duration: trickDuration / 2,
        scaleX: baseScale * 0.82,
        scaleY: baseScale * 1.2,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      },
      startAt
    );
    return;
  }

  if (trickType === "forwardFlip") {
    timeline.to(
      element,
      {
        duration: trickDuration,
        rotation: "+=360",
        ease: "power1.inOut",
      },
      startAt
    );
    return;
  }

  if (trickType === "backFlip") {
    timeline.to(
      element,
      {
        duration: trickDuration,
        rotation: "-=360",
        ease: "power1.inOut",
      },
      startAt
    );
    return;
  }

  timeline.to(
    element,
    {
      duration: trickDuration / 2,
      rotation: `+=${helpers.Randomizer(-28, -14)}`,
      scale: baseScale * 1.08,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    },
    startAt
  );
}

function addExitSequence(
  timeline: gsap.core.Timeline,
  element: HTMLElement,
  sprite: HTMLElement,
  startPoint: Point,
  geometry: TrampolineGeometry,
  baseScale: number
): void {
  const exitType = pickExitType();
  const exitDuration = helpers.Randomizer(0.95, 1.55);
  const exitPath = getExitPath(exitType, startPoint, geometry);
  const exitSpin = helpers.Randomizer(180, 540) * (exitType === "left" ? -1 : 1);

  timeline.to(element, {
    duration: exitDuration,
    ease: exitType === "up" ? "power2.in" : "power1.inOut",
    motionPath: {
      path: exitPath,
      curviness: 1.2,
    },
    scale: baseScale * helpers.Randomizer(0.88, 1.04),
  });

  timeline.to(
    sprite,
    {
      duration: exitDuration,
      rotation: `+=${exitSpin}`,
      ease: "none",
    },
    `>-${exitDuration}`
  );

  timeline.to(
    element,
    {
      opacity: 0,
      duration: exitDuration * 0.45,
      ease: "power1.in",
    },
    `>-${exitDuration * 0.35}`
  );
}

function pickExitType(): ExitType {
  const roll = Math.random();

  if (roll < 0.34) {
    return "up";
  }

  if (roll < 0.67) {
    return "left";
  }

  return "right";
}

function getExitPath(
  exitType: ExitType,
  startPoint: Point,
  geometry: TrampolineGeometry
): Point[] {
  if (exitType === "up") {
    return [
      startPoint,
      {
        x: startPoint.x + helpers.Randomizer(-geometry.width * 0.05, geometry.width * 0.05),
        y: startPoint.y - helpers.Randomizer(geometry.height * 1.5, geometry.height * 2.2),
      },
      {
        x: startPoint.x + helpers.Randomizer(-geometry.width * 0.1, geometry.width * 0.1),
        y: -helpers.scaleRelativeToHeight(160),
      },
    ];
  }

  const direction = exitType === "left" ? -1 : 1;

  return [
    startPoint,
    {
      x: startPoint.x + geometry.width * 0.2 * direction,
      y: startPoint.y - helpers.Randomizer(geometry.height * 0.85, geometry.height * 1.35),
    },
    {
      x: exitType === "left"
        ? -helpers.scaleRelativeToWidth(180)
        : innerWidth + helpers.scaleRelativeToWidth(180),
      y: startPoint.y - helpers.Randomizer(geometry.height * 0.2, geometry.height * 0.8),
    },
  ];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}