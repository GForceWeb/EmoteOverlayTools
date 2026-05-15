import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

type RippleSource = {
  centerX: number;
  centerY: number;
  emoteSize: number;
  baseRingSpacing: number;
};

const FULL_TURN = Math.PI * 2;
const EDGE_BUFFER_RATIO = 0.15;
const RIPPLE_INSTANCE_DELAY_MS = 250;
const MIN_RING_COUNT = 1;
const MAX_RING_COUNT = 18;
const MIN_RING_INTERVAL = 40;
const MAX_RING_INTERVAL = 1200;

export function ripple(
  images: string[],
  count: number = 6,
  interval: number = 180
): void {
  if (images.length === 0) {
    return;
  }

  const ringCount = clamp(Math.round(count), MIN_RING_COUNT, MAX_RING_COUNT);
  const ringInterval = clamp(
    Math.round(interval),
    MIN_RING_INTERVAL,
    MAX_RING_INTERVAL
  );
  const emoteSize = helpers.getCSSPixelValue(
    "--emote-size-standard",
    window.innerHeight / 14
  );
  const baseRingSpacing = Math.max(
    helpers.scaleRelativeToViewport(72),
    emoteSize * 0.82
  );
  const impactLeadTime = getImpactLeadTime(ringInterval);

  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
    const source = createRippleSource(emoteSize, baseRingSpacing);
    const sourceDelay = imageIndex * RIPPLE_INSTANCE_DELAY_MS;
    const image = images[imageIndex];

    setTimeout(() => {
      createImpact(image, source, ringInterval);
    }, sourceDelay);

    for (let ringIndex = 0; ringIndex < ringCount; ringIndex++) {
      setTimeout(() => {
        createRing(image, source, ringIndex, ringCount, ringInterval);
      }, sourceDelay + impactLeadTime + ringIndex * ringInterval);
    }
  }
}

function getImpactLeadTime(ringInterval: number): number {
  const impactDuration = clamp(ringInterval / 420, 0.34, 0.72);
  const splashDuration = clamp(ringInterval / 250, 0.44, 0.9);

  return Math.round((impactDuration + splashDuration * 0.82) * 1000);
}

function createRippleSource(
  emoteSize: number,
  baseRingSpacing: number
): RippleSource {
  const horizontalPadding = Math.min(innerWidth * EDGE_BUFFER_RATIO, innerWidth / 2);
  const verticalPadding = Math.min(innerHeight * EDGE_BUFFER_RATIO, innerHeight / 2);

  return {
    centerX: getBoundedCoordinate(innerWidth, horizontalPadding),
    centerY: getBoundedCoordinate(innerHeight, verticalPadding),
    emoteSize,
    baseRingSpacing,
  };
}

function getBoundedCoordinate(axisSize: number, padding: number): number {
  if (axisSize <= padding * 2) {
    return axisSize / 2;
  }

  return helpers.Randomizer(padding, axisSize - padding);
}

function createImpact(
  image: string,
  source: RippleSource,
  ringInterval: number
): void {
  const element = createRippleElement(image);
  const shadow = createRippleElement(image);
  const originX = source.centerX - source.emoteSize / 2;
  const surfaceY = source.centerY - source.emoteSize / 2;
  const startY =
    surfaceY -
    Math.max(source.emoteSize * 2.4, helpers.scaleRelativeToHeight(220));
  const impactDuration = clamp(ringInterval / 420, 0.34, 0.72);
  const splashDuration = clamp(ringInterval / 250, 0.44, 0.9);
  const reboundLift = Math.max(source.emoteSize * 0.28, helpers.scaleRelativeToHeight(28));
  const horizontalDrift = helpers.Randomizer(
    -helpers.scaleRelativeToWidth(14),
    helpers.scaleRelativeToWidth(14)
  );
  const shadowWidth = source.emoteSize * 0.92;
  const shadowHeight = Math.max(source.emoteSize * 0.18, helpers.scaleRelativeToViewport(14));

  gsap.set(element, {
    className: "ripple-element",
    x: originX,
    y: startY,
    scale: 0.52,
    opacity: 0,
    rotation: helpers.Randomizer(-25, 25),
    zIndex: 40,
  });

  gsap.set(shadow, {
    className: "ripple-shadow",
    x: source.centerX - shadowWidth / 2,
    y: source.centerY - shadowHeight / 2,
    width: shadowWidth,
    height: shadowHeight,
    scaleX: 0.28,
    scaleY: 0.65,
    opacity: 0,
    zIndex: 8,
  });

  element.style.filter = "brightness(1.2) saturate(1.08) blur(0px)";
  globalVars.warp.appendChild(element);
  globalVars.warp.appendChild(shadow);

  const timeline = gsap.timeline({
    onComplete: () => {
      helpers.removeelement(element.id);
      helpers.removeelement(shadow.id);
    },
  });

  timeline.to(shadow, {
    duration: impactDuration * 0.7,
    opacity: 0.28,
    scaleX: 0.92,
    scaleY: 0.9,
    ease: "sine.out",
  });

  timeline.to(element, {
    duration: impactDuration * 0.72,
    y: surfaceY,
    x: originX + horizontalDrift,
    opacity: 0.98,
    scale: 1.02,
    rotation: `+=${helpers.Randomizer(-18, 18)}`,
    ease: "power3.in",
  });

  timeline.to(
    element,
    {
      duration: splashDuration * 0.36,
      y: surfaceY + reboundLift * 0.24,
      scaleX: 1.24,
      scaleY: 0.66,
      ease: "power3.out",
    }
  );

  timeline.to(
    element,
    {
      duration: splashDuration * 0.64,
      y: surfaceY - reboundLift,
      x: originX + horizontalDrift * 0.45,
      opacity: 0.58,
      scaleX: 0.82,
      scaleY: 1.24,
      rotation: `+=${helpers.Randomizer(-10, 10)}`,
      ease: "sine.out",
    }
  );

  timeline.to(
    shadow,
    {
      duration: splashDuration * 0.44,
      scaleX: 1.55,
      scaleY: 1.08,
      opacity: 0.18,
      ease: "power1.out",
    },
    `-=${splashDuration * 0.52}`
  );

  timeline.to(
    element,
    {
      duration: splashDuration * 0.78,
      y: surfaceY + reboundLift * 0.35,
      opacity: 0,
      scale: 1.48,
      ease: "power1.out",
    }
  );

  timeline.to(
    shadow,
    {
      duration: splashDuration * 0.78,
      scaleX: 1.95,
      scaleY: 1.24,
      opacity: 0,
      ease: "power1.out",
    },
    `-=${splashDuration * 0.78}`
  );
}

function createRing(
  image: string,
  source: RippleSource,
  ringIndex: number,
  ringCount: number,
  ringInterval: number
): void {
  const ringNumber = ringIndex + 1;
  const ringProgress = ringNumber / ringCount;
  const targetRadius =
    source.baseRingSpacing * ringNumber * helpers.Randomizer(0.97, 1.05);
  const circumference = FULL_TURN * targetRadius;
  const sampleSpacing = source.emoteSize * (0.9 + ringProgress * 0.2);
  const sampleCount = clamp(
    Math.round(circumference / Math.max(sampleSpacing, 1)),
    6,
    24
  );
  const expansionDuration = clamp(ringInterval / 170, 0.42, 1.75) + ringIndex * 0.04;
  const fadeDuration = 0.55 + ringProgress * 0.4;
  const settleDuration = 0.18 + ringProgress * 0.16;
  const fadeStart = expansionDuration * 0.42;
  const amplitude = 1 - ringProgress * 0.58;
  const ringRotation = helpers.Randomizer(0, FULL_TURN);
  const radialVariance = helpers.scaleRelativeToViewport(8) * amplitude;

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
    const angle =
      ringRotation +
      (sampleIndex / sampleCount) * FULL_TURN +
      helpers.Randomizer(-0.05, 0.05);
    const targetPoint = getPointOnCircle(
      source,
      targetRadius + helpers.Randomizer(-radialVariance, radialVariance),
      angle
    );
    const overshootPoint = getPointOnCircle(
      source,
      targetRadius * (1.06 + amplitude * 0.05),
      angle
    );
    const settlePoint = getPointOnCircle(
      source,
      targetRadius * (0.985 + helpers.Randomizer(-0.012, 0.012)),
      angle + helpers.Randomizer(-0.025, 0.025)
    );

    animateRingEmote(
      image,
      source,
      targetPoint,
      overshootPoint,
      settlePoint,
      ringIndex,
      amplitude,
      expansionDuration,
      settleDuration,
      fadeDuration,
      fadeStart
    );
  }
}

function getPointOnCircle(
  source: RippleSource,
  radius: number,
  angle: number
): { x: number; y: number } {
  return {
    x: source.centerX + Math.cos(angle) * radius,
    y: source.centerY + Math.sin(angle) * radius,
  };
}

function animateRingEmote(
  image: string,
  source: RippleSource,
  targetPoint: { x: number; y: number },
  overshootPoint: { x: number; y: number },
  settlePoint: { x: number; y: number },
  ringIndex: number,
  amplitude: number,
  expansionDuration: number,
  settleDuration: number,
  fadeDuration: number,
  fadeStart: number
): void {
  const element = createRippleElement(image);
  const baseScale = helpers.Randomizer(0.46, 0.8) * (1 - ringIndex * 0.025);
  const originJitter = helpers.scaleRelativeToViewport(10) * amplitude;
  const originX =
    source.centerX - source.emoteSize / 2 + helpers.Randomizer(-originJitter, originJitter);
  const originY =
    source.centerY - source.emoteSize / 2 + helpers.Randomizer(-originJitter, originJitter);
  const targetOpacity = clamp(0.18 + amplitude * 0.5, 0.18, 0.72);

  gsap.set(element, {
    className: "ripple-element",
    x: originX,
    y: originY,
    scale: baseScale * 0.15,
    opacity: 0,
    rotation: helpers.Randomizer(-35, 35),
    zIndex: Math.max(4, 30 - ringIndex),
  });

  element.style.filter =
    "brightness(" +
    (1.04 + amplitude * 0.14).toFixed(2) +
    ") blur(" +
    helpers.scaleRelativeToViewport(0.35 + (1 - amplitude) * 0.8).toFixed(2) +
    "px)";
  globalVars.warp.appendChild(element);

  const timeline = gsap.timeline({
    onComplete: () => {
      helpers.removeelement(element.id);
    },
  });

  timeline.to(element, {
    duration: 0.14,
    opacity: targetOpacity,
    scale: baseScale * (1.02 + amplitude * 0.14),
    ease: "sine.out",
  });

  timeline.to(
    element,
    {
      duration: expansionDuration,
      x: overshootPoint.x - source.emoteSize / 2,
      y: overshootPoint.y - source.emoteSize / 2,
      scale: baseScale * (0.86 + amplitude * 0.16),
      rotation: `+=${helpers.Randomizer(-70, 70)}`,
      ease: "power2.out",
    },
    0
  );

  timeline.to(
    element,
    {
      duration: settleDuration,
      x: settlePoint.x - source.emoteSize / 2,
      y: settlePoint.y - source.emoteSize / 2,
      scale: baseScale * (0.78 + amplitude * 0.1),
      ease: "sine.out",
    },
    expansionDuration * 0.72
  );

  timeline.to(
    element,
    {
      duration: fadeDuration,
      x: targetPoint.x - source.emoteSize / 2,
      y: targetPoint.y - source.emoteSize / 2,
      opacity: 0,
      scale: baseScale * 0.34,
      ease: "power1.out",
    },
    fadeStart
  );
}

function createRippleElement(image: string): HTMLDivElement {
  const element = document.createElement("div");

  element.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  element.style.backgroundImage = "url(" + image + ")";

  return element;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}