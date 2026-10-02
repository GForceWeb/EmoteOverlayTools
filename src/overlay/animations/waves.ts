import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import OverlaySettings from "../settings";
import type { WaveStyle } from "@/shared/types";

type WaveDirection = "ltr" | "rtl";

type WaveTravel = {
  startX: number;
  endX: number;
  baseY: number;
  lean: number;
};

type WaveDepth = {
  scale: number;
  brightness: number;
  blur: number;
  nearness: number;
};

type OceanWaveField = {
  centerY: number;
  waveNumber: number;
  amplitude: number;
  driftPerSecond: number;
  phase0: number;
  mirror: boolean;
};

const WAVE_LIFETIME_MS = 15000;
const FADE_IN_SECONDS = 0.45;
const FADE_OUT_SECONDS = 0.6;
const MIN_SCALE = 0.72;
const MAX_SCALE = 1.08;
const EDGE_MARGIN = 140;
const VIEWPORT_INSET = 120;
const MAX_WAVE_TILT_DEGREES = 40;
// Fraction of the cycle spent climbing the back of the wave; the rest is the plunge
const OCEAN_CLIMB_FRACTION = 0.68;
// Emotes stay near level while riding the back, pitch hard on the face
const OCEAN_BACK_TILT_WEIGHT = 0.35;
const PROFILE_SAMPLE_EPSILON = 0.01;

export function rightwave(
  images: string[],
  count: number = 100,
  interval: number = 20
): void {
  spawnWaveStream(images, count, interval, "ltr", "rightwave");
}

export function leftwave(
  images: string[],
  count: number = 100,
  interval: number = 20
): void {
  spawnWaveStream(images, count, interval, "rtl", "leftwave");
}

function spawnWaveStream(
  images: string[],
  count: number,
  interval: number,
  direction: WaveDirection,
  settingsKey: "rightwave" | "leftwave"
): void {
  if (images.length === 0) {
    return;
  }

  // Resolved once per activation so an ocean wave uses one shared field
  const oceanField =
    resolveStreamWaveMode(settingsKey) === "ocean"
      ? createOceanWaveField(direction)
      : null;

  for (let j = 0; j < count; j++) {
    // split the count amounst the different emote images
    let imagenum = j % images.length;
    setTimeout(() => {
      createWave(images[imagenum], direction, oceanField);
    }, j * interval);
  }
}

function resolveStreamWaveMode(
  settingsKey: "rightwave" | "leftwave"
): "sway" | "ocean" {
  const style = resolveWaveStyle(settingsKey);
  if (style === "both") {
    return Math.random() < 0.5 ? "sway" : "ocean";
  }
  return style;
}

function resolveWaveStyle(settingsKey: "rightwave" | "leftwave"): WaveStyle {
  const configured =
    OverlaySettings.settings.animations[settingsKey]?.waveStyle;
  if (configured === "sway" || configured === "ocean" || configured === "both") {
    return configured;
  }
  return "sway";
}

function createWave(
  image: string,
  direction: WaveDirection,
  oceanField: OceanWaveField | null
): void {
  const div = document.createElement("div");
  div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const travel = createTravelPlan(direction);
  const depth = createWaveDepth();

  gsap.set(div, {
    className: "rightwave-element",
    x: travel.startX,
    y: travel.baseY,
    backgroundImage: "url(" + image + ")",
    opacity: 0,
    scale: depth.scale,
    transformOrigin: "50% 50%",
    transformPerspective: helpers.scaleRelativeToViewport(900),
  });
  div.style.filter =
    "brightness(" + depth.brightness + ") blur(" + depth.blur + "px)";

  globalVars.warp.appendChild(div);

  // Run animation
  if (oceanField) {
    animateOceanWave(div, travel, depth, oceanField);
  } else {
    animateSwayWave(div, travel, depth);
  }
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(div.id);
  }, WAVE_LIFETIME_MS);
}

function createTravelPlan(direction: WaveDirection): WaveTravel {
  // Spawn fully offscreen so the fade-in is the only visible arrival
  const offscreenOffset =
    helpers.getCSSPixelValue("--emote-size-standard", 90) +
    helpers.scaleRelativeToViewport(EDGE_MARGIN);
  const baseY = helpers.Randomizer(
    helpers.scaleRelativeToHeight(VIEWPORT_INSET),
    innerHeight - helpers.scaleRelativeToHeight(VIEWPORT_INSET)
  );

  return direction === "ltr"
    ? {
        startX: -offscreenOffset,
        endX: innerWidth + offscreenOffset,
        baseY,
        lean: 7,
      }
    : {
        startX: innerWidth + offscreenOffset,
        endX: -offscreenOffset,
        baseY,
        lean: -7,
      };
}

function createWaveDepth(): WaveDepth {
  const scale = helpers.Randomizer(MIN_SCALE, MAX_SCALE);
  // 0 = far away, 1 = near the camera
  const nearness = (scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE);

  return {
    scale,
    nearness,
    brightness: lerp(0.82, 1.05, nearness),
    blur: lerp(helpers.scaleRelativeToViewport(1.6), 0, nearness),
  };
}

function createOceanWaveField(direction: WaveDirection): OceanWaveField {
  const centerY = helpers.Randomizer(
    helpers.scaleRelativeToHeight(VIEWPORT_INSET),
    innerHeight - helpers.scaleRelativeToHeight(VIEWPORT_INSET)
  );
  const wavelength = helpers.Randomizer(
    helpers.scaleRelativeToWidth(650),
    helpers.scaleRelativeToWidth(1050)
  );
  const waveNumber = (Math.PI * 2) / wavelength;
  const amplitude = helpers.Randomizer(
    helpers.scaleRelativeToHeight(150),
    helpers.scaleRelativeToHeight(270)
  );
  // Crests roll in the travel direction so emotes surf the swell
  const crestSpeed = helpers.Randomizer(
    helpers.scaleRelativeToWidth(110),
    helpers.scaleRelativeToWidth(220)
  );
  const driftPerSecond = crestSpeed * waveNumber;

  return {
    centerY,
    waveNumber,
    amplitude,
    driftPerSecond: direction === "ltr" ? -driftPerSecond : driftPerSecond,
    phase0: helpers.Randomizer(0, Math.PI * 2),
    mirror: direction === "rtl",
  };
}

function animateSwayWave(
  element: HTMLElement,
  travel: WaveTravel,
  depth: WaveDepth
): void {
  // Nearer emotes cross slightly faster for a subtle parallax feel
  const duration =
    helpers.Randomizer(6.5, 11) * lerp(1.15, 0.92, depth.nearness);
  const bobAmplitude = helpers.Randomizer(
    helpers.scaleRelativeToHeight(110),
    helpers.scaleRelativeToHeight(240)
  );
  const bobPeriod = helpers.Randomizer(2.6, 3.8);
  const swayTilt = helpers.Randomizer(5, 9);
  const swayTurn = helpers.Randomizer(8, 14);
  const startTheta = Math.random() * Math.PI * 2;
  const endTheta = startTheta + Math.PI * 2 * (duration / bobPeriod);

  const state = { theta: startTheta };

  // Bob, tilt and flip all derive from one phase so they stay locked together
  const render = () => {
    gsap.set(element, {
      y: travel.baseY + Math.sin(state.theta) * bobAmplitude,
      rotation: travel.lean + Math.cos(state.theta) * swayTilt,
      rotationY: Math.sin(state.theta * 0.5 + Math.PI / 3) * swayTurn,
    });
  };
  render();

  const timeline = gsap.timeline();
  timeline.to(element, { x: travel.endX, duration, ease: "none" }, 0);
  timeline.to(
    state,
    { theta: endTheta, duration, ease: "none", onUpdate: render },
    0
  );
  timeline.to(
    element,
    { opacity: 1, duration: FADE_IN_SECONDS, ease: "power1.out" },
    0
  );
  timeline.to(
    element,
    { opacity: 0, duration: FADE_OUT_SECONDS, ease: "power1.in" },
    Math.max(duration - FADE_OUT_SECONDS, 0)
  );
}

function animateOceanWave(
  element: HTMLElement,
  travel: WaveTravel,
  depth: WaveDepth,
  field: OceanWaveField
): void {
  const duration =
    helpers.Randomizer(6.5, 11) * lerp(1.15, 0.92, depth.nearness);
  // Small per-emote amplitude variation keeps the swell organic
  const amplitude = field.amplitude * helpers.Randomizer(0.88, 1.12);
  const flutterAmplitude = helpers.scaleRelativeToHeight(14);
  const flutterPeriod = helpers.Randomizer(2.2, 3.4);
  const startTheta = field.waveNumber * travel.startX + field.phase0;
  const endTheta =
    startTheta +
    field.waveNumber * (travel.endX - travel.startX) +
    field.driftPerSecond * duration;
  const startFlutter = Math.random() * Math.PI * 2;
  const endFlutter = startFlutter + Math.PI * 2 * (duration / flutterPeriod);

  const state = { theta: startTheta, flutter: startFlutter };
  const wavelength = (Math.PI * 2) / field.waveNumber;

  // Emotes ride a shared plunging wave field: a long climb up the back that
  // stalls at the lip, then a quick drop down the face, pitching nose-down
  const render = () => {
    const u = oceanPhase(state.theta, field.mirror);
    const surface = plungeProfile(u);
    const slope = oceanSurfaceSlope(
      state.theta,
      field.mirror,
      amplitude,
      wavelength
    );
    const tiltWeight =
      u < OCEAN_CLIMB_FRACTION ? OCEAN_BACK_TILT_WEIGHT : 1;
    gsap.set(element, {
      y:
        field.centerY -
        surface * amplitude +
        Math.sin(state.flutter) * flutterAmplitude,
      rotation:
        travel.lean +
        clamp(
          Math.atan(slope) * (180 / Math.PI) * tiltWeight,
          -MAX_WAVE_TILT_DEGREES,
          MAX_WAVE_TILT_DEGREES
        ),
      rotationY: Math.sin(state.flutter * 0.5 + 1) * 8,
    });
  };
  render();

  const timeline = gsap.timeline();
  timeline.to(element, { x: travel.endX, duration, ease: "none" }, 0);
  timeline.to(
    state,
    { theta: endTheta, duration, ease: "none", onUpdate: render },
    0
  );
  timeline.to(
    state,
    { flutter: endFlutter, duration, ease: "none", onUpdate: render },
    0
  );
  timeline.to(
    element,
    { opacity: 1, duration: FADE_IN_SECONDS, ease: "power1.out" },
    0
  );
  timeline.to(
    element,
    { opacity: 0, duration: FADE_OUT_SECONDS, ease: "power1.in" },
    Math.max(duration - FADE_OUT_SECONDS, 0)
  );
}

function oceanPhase(theta: number, mirror: boolean): number {
  let u = (theta / (Math.PI * 2)) % 1;
  if (u < 0) {
    u += 1;
  }
  // Mirror the profile so the face points along the travel direction
  if (mirror) {
    u = 1 - u;
  }
  return u;
}

// Asymmetric breaker profile: broad easing back, peaked lip, steep face
function plungeProfile(u: number): number {
  if (u < OCEAN_CLIMB_FRACTION) {
    return lerp(-1, 1, easeInOutPow2(u / OCEAN_CLIMB_FRACTION));
  }
  const dropProgress = (u - OCEAN_CLIMB_FRACTION) / (1 - OCEAN_CLIMB_FRACTION);
  return lerp(1, -1, easeInOutPow2(dropProgress));
}

function oceanSurfaceSlope(
  theta: number,
  mirror: boolean,
  amplitude: number,
  wavelength: number
): number {
  const step = PROFILE_SAMPLE_EPSILON * Math.PI * 2;
  const yAhead = plungeProfile(oceanPhase(theta + step, mirror));
  const yBehind = plungeProfile(oceanPhase(theta - step, mirror));
  // Screen-space slope of the drawn surface (screen y grows downward, so the
  // profile is drawn inverted). One profile cycle spans one wavelength.
  return (
    (-amplitude * (yAhead - yBehind)) /
    (wavelength * 2 * PROFILE_SAMPLE_EPSILON)
  );
}

function easeInOutPow2(progress: number): number {
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(min: number, max: number, progress: number): number {
  return min + (max - min) * progress;
}
