import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

type OrbitPoint = {
  x: number;
  y: number;
};

type OrbitPath = {
  path: OrbitPoint[];
  startAngle: number;
  endAngle: number;
};

type OrbitGeometry = {
  centerX: number;
  centerY: number;
  horizontalRadius: number;
  verticalRadius: number;
};

const FULL_TURN = Math.PI * 2;
const ORBIT_LIFETIME_MS = 12000;

export function orbit(
  images: string[],
  count: number = 100,
  interval: number = 150
): void {
  if (images.length === 0) {
    return;
  }

  let imgcount = images.length;
  const geometry = createOrbitGeometry();

  for (let j = 0; j < count; j++) {
    // split the count amounst the different emote images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createOrbit(images[imagenum], j, count, geometry);
    }, j * interval);
  }
}

function createOrbit(
  image: string,
  index: number,
  totalCount: number,
  geometry: OrbitGeometry
): void {
  const orbitPath = buildOrbit(index, totalCount, geometry);
  const baseScale = helpers.Randomizer(0.82, 1.08);
  const div = document.createElement("div");

  div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  gsap.set(div, {
    className: "orbit-element",
    x: orbitPath.path[0].x,
    y: orbitPath.path[0].y,
    z: 0,
    backgroundImage: "url(" + image + ")",
    opacity: 0,
    scale: baseScale,
    transformOrigin: "50% 50%",
    transformPerspective: helpers.scaleRelativeToViewport(900),
  });

  globalVars.warp.appendChild(div);

  animateOrbit(div, orbitPath, baseScale);
  setTimeout(() => {
    helpers.removeelement(div.id);
  }, ORBIT_LIFETIME_MS);
}

function createOrbitGeometry(): OrbitGeometry {
  const minHorizontalRadius = Math.max(
    helpers.scaleRelativeToWidth(235),
    innerWidth * 0.15
  );
  const maxHorizontalRadius = Math.max(
    helpers.scaleRelativeToWidth(760),
    innerWidth * 0.42
  );
  const horizontalRadius = helpers.Randomizer(
    minHorizontalRadius,
    maxHorizontalRadius
  );
  const minVerticalRadius = Math.max(
    helpers.scaleRelativeToHeight(100),
    innerHeight * 0.08
  );
  const maxVerticalRadius = Math.max(
    helpers.scaleRelativeToHeight(290),
    innerHeight * 0.28
  );
  const verticalRadius = helpers.Randomizer(
    minVerticalRadius,
    maxVerticalRadius
  );

  return {
    centerX: innerWidth / 2,
    centerY: innerHeight / 2,
    horizontalRadius,
    verticalRadius,
  };
}

function buildOrbit(
  index: number,
  totalCount: number,
  geometry: OrbitGeometry
): OrbitPath {
  const baseAngle =
    ((index % Math.max(totalCount, 1)) / Math.max(totalCount, 1)) * FULL_TURN;
  const startAngle = baseAngle + helpers.Randomizer(-0.18, 0.18);
  const orbitCount = helpers.Randomizer(1.2, 1.65);
  const endAngle = startAngle + FULL_TURN * orbitCount;

  return {
    path: buildOrbitPath(
      geometry.centerX,
      geometry.centerY,
      geometry.horizontalRadius,
      geometry.verticalRadius,
      startAngle,
      endAngle
    ),
    startAngle,
    endAngle,
  };
}

function buildOrbitPath(
  centerX: number,
  centerY: number,
  horizontalRadius: number,
  verticalRadius: number,
  startAngle: number,
  endAngle: number
): OrbitPoint[] {
  const angleSpan = endAngle - startAngle;
  const pointCount = Math.max(36, Math.ceil((angleSpan / FULL_TURN) * 48));
  const points: OrbitPoint[] = [];

  for (let pointIndex = 0; pointIndex <= pointCount; pointIndex++) {
    const progress = pointIndex / pointCount;
    const angle = startAngle + angleSpan * progress;
    points.push(
      getOrbitPoint(centerX, centerY, horizontalRadius, verticalRadius, angle)
    );
  }

  return points;
}

function getOrbitPoint(
  centerX: number,
  centerY: number,
  horizontalRadius: number,
  verticalRadius: number,
  angle: number
): OrbitPoint {
  const depth = getOrbitDepth(angle);
  const widthMultiplier = lerp(0.84, 1.08, depth);
  const heightOffset = (1 - depth) * verticalRadius * 0.16;

  return {
    x: centerX + Math.cos(angle) * horizontalRadius * widthMultiplier,
    y: centerY + Math.sin(angle) * verticalRadius - heightOffset,
  };
}

function getOrbitDepth(angle: number): number {
  return (Math.sin(angle) + 1) / 2;
}

function lerp(min: number, max: number, progress: number): number {
  return min + (max - min) * progress;
}

function renderOrbitDepth(
  element: HTMLElement,
  angle: number,
  baseScale: number,
  fade: number
): void {
  const depth = getOrbitDepth(angle);
  const opacity = lerp(0.4, 1, depth) * fade;
  const scale = baseScale * lerp(0.62, 1.18, depth);
  const blur = lerp(helpers.scaleRelativeToViewport(2.5), 0, depth);
  const brightness = lerp(0.72, 1.08, depth);

  gsap.set(element, {
    scale,
    opacity,
    rotationX: lerp(68, 28, depth),
    rotationY: -Math.cos(angle) * 24,
    rotationZ: Math.cos(angle) * 7,
  });

  element.style.filter = "brightness(" + brightness + ") blur(" + blur + "px)";
  element.style.zIndex = Math.round(10 + depth * 20).toString();
}

function animateOrbit(
  element: HTMLElement,
  orbitPath: OrbitPath,
  baseScale: number
): void {
  const duration = helpers.Randomizer(7, 9.5);
  const fadeOutDuration = 0.55;
  const renderState = {
    angle: orbitPath.startAngle,
    fade: 0,
  };
  const timeline = gsap.timeline();

  renderOrbitDepth(element, renderState.angle, baseScale, renderState.fade);

  timeline.to(renderState, {
    duration: 0.2,
    fade: 1,
    ease: "power1.out",
    onUpdate: () => {
      renderOrbitDepth(element, renderState.angle, baseScale, renderState.fade);
    },
  });

  timeline.to(
    element,
    {
      duration,
      ease: "none",
      motionPath: {
        path: orbitPath.path,
        curviness: 1.1,
      },
    },
    0
  );

  timeline.to(
    renderState,
    {
      duration,
      angle: orbitPath.endAngle,
      ease: "none",
      onUpdate: () => {
        renderOrbitDepth(element, renderState.angle, baseScale, renderState.fade);
      },
    },
    0
  );

  timeline.to(
    renderState,
    {
      duration: fadeOutDuration,
      fade: 0,
      ease: "power1.in",
      onUpdate: () => {
        renderOrbitDepth(element, renderState.angle, baseScale, renderState.fade);
      },
    },
    Math.max(duration - fadeOutDuration, 0.2)
  );
}