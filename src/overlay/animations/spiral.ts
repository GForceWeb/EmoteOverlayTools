import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import OverlaySettings from "../settings";
import type { SpiralPathBehaviour } from "@/shared/types";

gsap.registerPlugin(MotionPathPlugin);

const FULL_TURN = Math.PI * 2;
const SPIRAL_LIFETIME_MS = 15000;
const SPIRAL_DURATION_SECONDS = 13;
const FADE_OUT_DURATION_SECONDS = 2;
const FADE_OUT_START_SECONDS = 11.5;
const MIN_TURNS = 2.75;
const MAX_TURNS = 3.75;
const POINTS_PER_TURN = 48;
const MAX_START_RADIUS = 70;
const UNIFIED_START_ANGLE = -Math.PI / 2;
const UNIFIED_TURNS = 3.25;

type SpiralPoint = {
  x: number;
  y: number;
};

type SpiralGeometry = {
  centerX: number;
  centerY: number;
  startRadius: number;
  endRadius: number;
  startAngle: number;
  turns: number;
  direction: number;
};

export function spiral(
  images: string[],
  count: number = 100,
  interval: number = 75
): void {
  if (images.length === 0) {
    return;
  }

  let imgcount = images.length;
  const activationGeometry = createActivationGeometry(
    getConfiguredPathBehaviour()
  );

  for (let j = 0; j < count; j++) {
    // split the count amounst the different emote images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createSpiral(images[imagenum], activationGeometry);
    }, j * interval);
  }
}

function getConfiguredPathBehaviour(): SpiralPathBehaviour {
  const configured =
    OverlaySettings.settings.animations.spiral?.pathBehaviour;
  if (
    configured === "unified" ||
    configured === "randomPerEmote" ||
    configured === "randomPerActivation"
  ) {
    return configured;
  }
  return "unified";
}

function createActivationGeometry(
  behaviour: SpiralPathBehaviour
): SpiralGeometry | undefined {
  switch (behaviour) {
    case "unified":
      return createUnifiedSpiralGeometry();
    case "randomPerActivation":
      return createRandomSpiralGeometry();
    case "randomPerEmote":
    default:
      return undefined;
  }
}

function createUnifiedSpiralGeometry(): SpiralGeometry {
  return {
    centerX: innerWidth / 2,
    centerY: innerHeight / 2,
    startRadius: 0,
    endRadius: Math.hypot(innerWidth, innerHeight) / 2,
    startAngle: UNIFIED_START_ANGLE,
    turns: UNIFIED_TURNS,
    direction: 1,
  };
}

function createRandomSpiralGeometry(): SpiralGeometry {
  return {
    centerX: innerWidth / 2,
    centerY: innerHeight / 2,
    startRadius: helpers.scaleRelativeToViewport(
      helpers.Randomizer(0, MAX_START_RADIUS)
    ),
    endRadius: Math.hypot(innerWidth, innerHeight) / 2,
    startAngle: helpers.Randomizer(0, FULL_TURN),
    turns: helpers.Randomizer(MIN_TURNS, MAX_TURNS),
    direction: helpers.randomSign(),
  };
}

function createSpiral(image: string, geometry?: SpiralGeometry): void {
  const div = document.createElement("div");
  div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const spiralGeometry = geometry ?? createRandomSpiralGeometry();
  const startPoint = getSpiralPoint(spiralGeometry, 0);

  gsap.set(div, {
    className: "spiral-element",
    x: startPoint.x,
    y: startPoint.y,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalVars.warp.appendChild(div);

  // Run animation
  spiral_animation(div, spiralGeometry);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(div.id);
  }, SPIRAL_LIFETIME_MS);
}

function getSpiralPoint(
  geometry: SpiralGeometry,
  progress: number
): SpiralPoint {
  const angle =
    geometry.startAngle +
    geometry.direction * FULL_TURN * geometry.turns * progress;
  const radius =
    geometry.startRadius +
    (geometry.endRadius - geometry.startRadius) * progress;

  return {
    x: geometry.centerX + Math.cos(angle) * radius,
    y: geometry.centerY + Math.sin(angle) * radius,
  };
}

function buildSpiralPath(geometry: SpiralGeometry): SpiralPoint[] {
  const pointCount = Math.max(48, Math.ceil(geometry.turns * POINTS_PER_TURN));
  const points: SpiralPoint[] = [];

  for (let pointIndex = 0; pointIndex <= pointCount; pointIndex++) {
    points.push(getSpiralPoint(geometry, pointIndex / pointCount));
  }

  return points;
}

function spiral_animation(
  element: HTMLElement,
  geometry: SpiralGeometry
): void {
  const timeline = gsap.timeline();

  timeline.to(element, {
    duration: SPIRAL_DURATION_SECONDS,
    ease: "power1.in",
    motionPath: {
      alignOrigin: [0.5, 0.5],
      path: buildSpiralPath(geometry),
      curviness: 1.1,
    },
  });

  timeline.to(
    element,
    {
      opacity: 0,
      duration: FADE_OUT_DURATION_SECONDS,
      ease: "sine.out",
    },
    FADE_OUT_START_SECONDS
  );
}
