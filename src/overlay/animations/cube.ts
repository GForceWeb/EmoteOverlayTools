import { globalVars } from "../config.ts";
import OverlaySettings from "../settings";
import { gsap } from "gsap";
import type { ShapePositionMovement } from "@/shared/types";
import {
  applyShapeMovement,
  resolveShapePositionMovement,
  type ShapeMovementHandle,
} from "../lib/shapeMovement.ts";

interface CubeSide {
  front: HTMLElement;
  back: HTMLElement;
  right: HTMLElement;
  left: HTMLElement;
  top: HTMLElement;
  bottom: HTMLElement;
}

export function cube(
  images: string[],
  sizeParam: number = 67,
  speedPercent: number = 50
): void {
  const container = document.createElement("div");
  container.id = "cube-container-" + globalVars.divnumber;
  globalVars.divnumber++;
  container.className = "cube-container";

  // Compute size: if <= 200 treat as percentage of min viewport, else treat as absolute px
  const minViewportDimension = Math.min(window.innerWidth, window.innerHeight);
  let size: number;
  if (sizeParam <= 200) {
    const clampedPercent = Math.max(1, Math.min(200, Math.floor(sizeParam)));
    const fraction = 0.05 + 0.90 * (clampedPercent / 200); // range ~5% .. 95%
    size = Math.floor(minViewportDimension * fraction);
  } else {
    size = Math.floor(sizeParam);
  }

  // Set container styles
  gsap.set(container, {
    perspective: 1200,
    width: size,
    height: size,
    position: "absolute",
    top: "50%",
    left: "50%",
    xPercent: -50,
    yPercent: -50,
    zIndex: 100,
    pointerEvents: "none",
  });

  // Create cube
  const cube = document.createElement("div");
  cube.className = "cube";
  gsap.set(cube, {
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
  });

  // Decide which images to use for the 6 faces
  const faceImages = getFaceImages(images);

  // Create sides
  const sides: CubeSide = {
    front: createCubeSide("front", size, faceImages[0]),
    back: createCubeSide("back", size, faceImages[1]),
    right: createCubeSide("right", size, faceImages[2]),
    left: createCubeSide("left", size, faceImages[3]),
    top: createCubeSide("top", size, faceImages[4]),
    bottom: createCubeSide("bottom", size, faceImages[5]),
  };

  // Position sides
  const halfSize = size / 2;
  gsap.set(sides.front, { transform: `translateZ(${halfSize}px)` });
  gsap.set(sides.back, {
    transform: `rotateY(180deg) translateZ(${halfSize}px)`,
  });
  gsap.set(sides.right, {
    transform: `rotateY(90deg) translateZ(${halfSize}px)`,
  });
  gsap.set(sides.left, {
    transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
  });
  gsap.set(sides.top, {
    transform: `rotateX(90deg) translateZ(${halfSize}px)`,
  });
  gsap.set(sides.bottom, {
    transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
  });

  // Append sides to cube
  Object.values(sides).forEach((side) => {
    cube.appendChild(side);
  });

  // Append cube to container
  container.appendChild(cube);

  // Append container to document
  globalVars.warp.appendChild(container);

  const movementMode = resolveShapePositionMovement(getConfiguredPositionMovement());
  const spinTween =
    movementMode === "diceRoll" ? null : animateCube(cube, speedPercent);
  const movement: ShapeMovementHandle = applyShapeMovement(
    container,
    cube,
    movementMode,
    size,
    speedPercent,
    spinTween
  );

  // Remove after animation
  setTimeout(() => {
    if (container.parentNode) {
      movement.kill();
      spinTween?.kill();
      container.parentNode.removeChild(container);
    }
  }, 10000);
}

function getConfiguredPositionMovement(): ShapePositionMovement {
  const configured = OverlaySettings.settings.animations.cube?.positionMovement;
  if (
    configured === "centered" ||
    configured === "dvd" ||
    configured === "diceRoll" ||
    configured === "randomise"
  ) {
    return configured;
  }
  if ((configured as string) === "dropIn") {
    return "diceRoll";
  }
  return "centered";
}

function createCubeSide(
  className: string,
  size: number,
  imageUrl: string
): HTMLElement {
  const side = document.createElement("div");
  side.className = `cube-side cube-${className}`;

  gsap.set(side, {
    position: "absolute",
    width: size,
    height: size,
    backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backfaceVisibility: "hidden",
  });

  return side;
}

function animateCube(cube: HTMLElement, speedPercent: number): gsap.core.Tween {
  // Clamp and map speed (1-100) so higher is faster. Keep 50 => 20s (previous default)
  const clamped = Math.max(1, Math.min(100, Math.floor(speedPercent)));
  const durationSeconds = 1000 / clamped; // 50 -> 20s, 100 -> 10s, 25 -> 40s, etc.

  return gsap.to(cube, {
    rotationX: "+=360",
    rotationY: "+=360",
    duration: durationSeconds,
    ease: "none",
    repeat: -1,
    transformOrigin: "50% 50%",
  });
}

function getFaceImages(images: string[]): string[] {
  // Use up to the first 6 images
  const trimmed = images.slice(0, 6);

  if (trimmed.length === 0) {
    return ["", "", "", "", "", ""];
  }

  if (trimmed.length === 1) {
    return Array(6).fill(trimmed[0]);
  }

  if (trimmed.length === 2) {
    // Alternate to ensure 3 faces each
    return [trimmed[0], trimmed[1], trimmed[0], trimmed[1], trimmed[0], trimmed[1]];
  }

  // 3-6 images: cycle through provided list to fill 6 faces
  const faces: string[] = [];
  for (let i = 0; i < 6; i++) {
    faces.push(trimmed[i % trimmed.length]);
  }
  return faces;
}
