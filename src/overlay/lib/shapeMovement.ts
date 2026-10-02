import helpers from "../helpers.ts";
import { gsap } from "gsap";
import type { ShapePositionMovement } from "@/shared/types";

export type ResolvedShapeMovement = "centered" | "dvd" | "diceRoll";

const MOVEMENT_OPTIONS: ResolvedShapeMovement[] = ["centered", "dvd", "diceRoll"];

export function resolveShapePositionMovement(
  configured: ShapePositionMovement | undefined
): ResolvedShapeMovement {
  if (
    configured === "centered" ||
    configured === "dvd" ||
    configured === "diceRoll"
  ) {
    return configured;
  }
  // Legacy value from earlier builds
  if ((configured as string) === "dropIn") {
    return "diceRoll";
  }
  if (configured === "randomise") {
    return MOVEMENT_OPTIONS[Math.floor(Math.random() * MOVEMENT_OPTIONS.length)];
  }
  return "centered";
}

export interface ShapeMovementHandle {
  kill: () => void;
}

/**
 * Apply translational / tumbling movement to a 3D shape container.
 * The inner `shape` element continues (or receives) rotation; the `container` moves.
 */
export function applyShapeMovement(
  container: HTMLElement,
  shape: HTMLElement,
  mode: ResolvedShapeMovement,
  size: number,
  speedPercent: number,
  spinTween: gsap.core.Tween | null
): ShapeMovementHandle {
  switch (mode) {
    case "dvd":
      return startDvdMovement(container, size, speedPercent, spinTween);
    case "diceRoll":
      return startDiceRollMovement(container, shape, size, speedPercent, spinTween);
    case "centered":
    default:
      return { kill: () => undefined };
  }
}

function clampSpeed(speedPercent: number): number {
  return Math.max(1, Math.min(100, Math.floor(speedPercent)));
}

function startDvdMovement(
  container: HTMLElement,
  size: number,
  speedPercent: number,
  spinTween: gsap.core.Tween | null
): ShapeMovementHandle {
  const maxX = Math.max(window.innerWidth - size, 1);
  const maxY = Math.max(window.innerHeight - size, 1);
  const startX = helpers.Randomizer(0, maxX);
  const startY = helpers.Randomizer(0, maxY);

  // Match cube/dodecahedron removal timeout (10s)
  const lifetimeSeconds = 10;
  const fadeInDuration = 1;
  const fadeOutDuration = 1;

  gsap.set(container, {
    top: 0,
    left: 0,
    xPercent: 0,
    yPercent: 0,
    x: startX,
    y: startY,
    opacity: 0,
  });

  const speed = clampSpeed(speedPercent);
  // Higher speed => faster travel. 50 ≈ ~180px/s across a typical viewport.
  const pixelsPerSecond = 60 + speed * 2.4;
  const travel = pixelsPerSecond * lifetimeSeconds;

  const angle = helpers.Randomizer(0, Math.PI * 2);
  const targetX = startX + Math.cos(angle) * travel;
  const targetY = startY + Math.sin(angle) * travel;

  const bounceTween = gsap.to(container, {
    duration: lifetimeSeconds,
    x: targetX,
    y: targetY,
    ease: "none",
    modifiers: {
      x: (x) => bounceModifier(parseFloat(x), 0, maxX) + "px",
      y: (y) => bounceModifier(parseFloat(y), 0, maxY) + "px",
    },
  });

  const fadeInTween = gsap.to(container, {
    opacity: 1,
    duration: fadeInDuration,
    ease: "sine.out",
  });

  const fadeOutTween = gsap.to(container, {
    opacity: 0,
    duration: fadeOutDuration,
    delay: lifetimeSeconds - fadeOutDuration,
    ease: "sine.in",
  });

  return {
    kill: () => {
      bounceTween.kill();
      fadeInTween.kill();
      fadeOutTween.kill();
      spinTween?.kill();
    },
  };
}

/** Reflect a value into [min, max] like the classic DVD bounce. */
function bounceModifier(value: number, min: number, max: number): number {
  const range = Math.max(max - min, 1);
  if (value >= min && value <= max) {
    return value;
  }

  const offset = value - min;
  const period = range * 2;
  let wrapped = ((offset % period) + period) % period;
  if (wrapped > range) {
    wrapped = period - wrapped;
  }
  return min + wrapped;
}

function startDiceRollMovement(
  container: HTMLElement,
  shape: HTMLElement,
  size: number,
  speedPercent: number,
  spinTween: gsap.core.Tween | null
): ShapeMovementHandle {
  // Dice roll uses its own tumbling rotation instead of the steady center spin.
  spinTween?.kill();

  const maxX = Math.max(window.innerWidth - size, 1);
  const floorY = Math.max(window.innerHeight - size, 1);
  const speed = clampSpeed(speedPercent);

  let x = helpers.Randomizer(0, maxX);
  let y = -size - helpers.Randomizer(40, 180);
  let vx = helpers.Randomizer(1.2, 3.2) * helpers.randomSign();
  let vy = helpers.Randomizer(0, 1.5);
  let rotX = helpers.Randomizer(0, 360);
  let rotY = helpers.Randomizer(0, 360);
  let rotZ = helpers.Randomizer(0, 360);
  let avx = helpers.Randomizer(-1.8, 1.8);
  let avy = helpers.Randomizer(-2.5, 2.5);
  let avz = helpers.Randomizer(-1.2, 1.2);

  // Speed slider scales gravity and energy lightly; overall motion stays deliberate.
  const speedFactor = 0.35 + speed / 220;
  const gravity = 0.18 * speedFactor;
  const bounceRestitution = 0.55;
  const wallRestitution = 0.72;
  const groundFriction = 0.988;
  const airDrag = 0.999;
  const settleThreshold = 0.35;

  gsap.set(container, {
    top: 0,
    left: 0,
    xPercent: 0,
    yPercent: 0,
    x,
    y,
  });
  gsap.set(shape, {
    rotationX: rotX,
    rotationY: rotY,
    rotationZ: rotZ,
    transformOrigin: "50% 50%",
  });

  let alive = true;
  let settled = false;
  let settleSpin: gsap.core.Tween | null = null;

  const tick = () => {
    if (!alive) {
      return;
    }

    if (!settled) {
      vy += gravity;
      vx *= airDrag;
      x += vx * speedFactor;
      y += vy * speedFactor;

      // Walls
      if (x < 0) {
        x = 0;
        vx = Math.abs(vx) * wallRestitution;
        kickAngularVelocity();
      } else if (x > maxX) {
        x = maxX;
        vx = -Math.abs(vx) * wallRestitution;
        kickAngularVelocity();
      }

      // Floor bounce — dice-like tumble
      if (y >= floorY) {
        y = floorY;
        if (Math.abs(vy) > settleThreshold) {
          vy = -Math.abs(vy) * bounceRestitution;
          // Couple horizontal roll to bounce impact
          avx += helpers.Randomizer(-3.5, 3.5);
          avy += -vx * helpers.Randomizer(0.35, 0.8);
          avz += helpers.Randomizer(-2.2, 2.2);
          vx += helpers.Randomizer(-0.7, 0.7);
        } else {
          vy = 0;
          vx *= groundFriction;
          avx *= 0.92;
          avy *= 0.94;
          avz *= 0.92;

          // Still "rolling" while sliding on the floor
          if (Math.abs(vx) > 0.2) {
            avy += -vx * 0.22;
          }

          if (
            Math.abs(vx) < 0.15 &&
            Math.abs(avy) < 0.25 &&
            Math.abs(avx) < 0.25 &&
            Math.abs(avz) < 0.25
          ) {
            settled = true;
            vx = 0;
            vy = 0;
            // Gentle idle spin after settling, like the centered mode
            settleSpin = gsap.to(shape, {
              rotationX: "+=360",
              rotationY: "+=360",
              duration: 1000 / speed,
              ease: "none",
              repeat: -1,
              transformOrigin: "50% 50%",
            });
          }
        }
      }

      if (!settled) {
        rotX += avx;
        rotY += avy;
        rotZ += avz;
        avx *= 0.997;
        avy *= 0.997;
        avz *= 0.997;
        gsap.set(shape, { rotationX: rotX, rotationY: rotY, rotationZ: rotZ });
      }
    }

    gsap.set(container, { x, y });
  };

  function kickAngularVelocity(): void {
    avx += helpers.Randomizer(-2.5, 2.5);
    avy += helpers.Randomizer(-3.5, 3.5);
    avz += helpers.Randomizer(-1.8, 1.8);
  }

  gsap.ticker.add(tick);

  return {
    kill: () => {
      alive = false;
      gsap.ticker.remove(tick);
      settleSpin?.kill();
    },
  };
}
