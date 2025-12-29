import { globalVars } from "../config.ts";
import { gsap } from "gsap";

// A dodecahedron has 12 pentagonal faces
const FACE_COUNT = 12;

// Face positions and rotations for a regular dodecahedron
// The face normals are at arctan(2) ≈ 63.435° from vertical = 26.565° from horizontal
// CSS rotateX: positive angle tilts top away from viewer, making normal point upward
const FACE_TILT = 26.565; // Degrees from horizontal for ring faces

// The pentagon's circumcenter is at y=55.3% of the bounding box (not 50%)
// For rotateZ: 0, center is at 55.3%, so yPercent offset = -5.3
// For rotateZ: 180 (flipped), center is at 44.7%, so yPercent offset = +5.3
const CENTER_OFFSET = 5.3; // Percentage offset from bounding box center to pentagon circumcenter

// For caps, the yOffset becomes a depth offset after 90° rotation
// We use capCorrection (as fraction of pentagonSize) to apply a translateY after rotation
// This moves the cap in its local Y, which is world Z after rotation
const CAP_DEPTH_CORRECTION = -0.053; // Fraction of pentagonSize to correct cap depth

const FACE_TRANSFORMS = [
  // Top cap (1 face) - faces straight up (rotateX 90° tilts face to point upward)
  { rotateX: 90, rotateY: 0, rotateZ: 0, yOffset: 0, capCorrection: CAP_DEPTH_CORRECTION },
  // Upper ring (5 faces) - tilted upward-outward, spaced 72° apart
  { rotateX: FACE_TILT, rotateY: 0, rotateZ: 180, yOffset: CENTER_OFFSET, capCorrection: 0 },
  { rotateX: FACE_TILT, rotateY: 72, rotateZ: 180, yOffset: CENTER_OFFSET, capCorrection: 0 },
  { rotateX: FACE_TILT, rotateY: 144, rotateZ: 180, yOffset: CENTER_OFFSET, capCorrection: 0 },
  { rotateX: FACE_TILT, rotateY: 216, rotateZ: 180, yOffset: CENTER_OFFSET, capCorrection: 0 },
  { rotateX: FACE_TILT, rotateY: 288, rotateZ: 180, yOffset: CENTER_OFFSET, capCorrection: 0 },
  // Lower ring (5 faces) - tilted downward-outward, offset 36° from upper ring
  { rotateX: -FACE_TILT, rotateY: 36, rotateZ: 0, yOffset: -CENTER_OFFSET, capCorrection: 0 },
  { rotateX: -FACE_TILT, rotateY: 108, rotateZ: 0, yOffset: -CENTER_OFFSET, capCorrection: 0 },
  { rotateX: -FACE_TILT, rotateY: 180, rotateZ: 0, yOffset: -CENTER_OFFSET, capCorrection: 0 },
  { rotateX: -FACE_TILT, rotateY: 252, rotateZ: 0, yOffset: -CENTER_OFFSET, capCorrection: 0 },
  { rotateX: -FACE_TILT, rotateY: 324, rotateZ: 0, yOffset: -CENTER_OFFSET, capCorrection: 0 },
  // Bottom cap (1 face) - faces straight down
  { rotateX: -90, rotateY: 0, rotateZ: 0, yOffset: 0, capCorrection: CAP_DEPTH_CORRECTION },
];

export function dodecahedron(
  images: string[],
  sizeParam: number = 67,
  speedPercent: number = 50
): void {
  const container = document.createElement("div");
  container.id = "dodecahedron-container-" + globalVars.divnumber;
  globalVars.divnumber++;
  container.className = "dodecahedron-container";

  // Compute size: if <= 200 treat as percentage of min viewport, else treat as absolute px
  const minViewportDimension = Math.min(window.innerWidth, window.innerHeight);
  let size: number;
  if (sizeParam <= 200) {
    const clampedPercent = Math.max(1, Math.min(200, Math.floor(sizeParam)));
    const fraction = 0.05 + 0.9 * (clampedPercent / 200); // range ~5% .. 95%
    size = Math.floor(minViewportDimension * fraction);
  } else {
    size = Math.floor(sizeParam);
  }

  // Set container styles
  gsap.set(container, {
    perspective: 1500,
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

  // Create dodecahedron wrapper
  const dodeca = document.createElement("div");
  dodeca.className = "dodecahedron";
  gsap.set(dodeca, {
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    position: "relative",
  });

  // Decide which images to use for the 12 faces
  const faceImages = getFaceImages(images);

  // Calculate the radius (distance from center to face center) and pentagon size
  // For a regular dodecahedron with inradius r and edge length a: r = a × 1.801
  // For our pentagon clip-path, edge length ≈ 0.618 × bounding box width
  // Therefore: pentagonSize = radius × 0.618 / (1/1.801) = radius × 0.618 × 1.801 / 1.801 ≈ radius × 0.898
  // Using 0.9 for cleaner math and slight overlap to hide any rounding gaps
  const radius = size * 0.5; // Distance from center to face (matches cube halfSize)
  const pentagonSize = radius * 1.35; // Mathematically correct size for faces to meet

  // Create all 12 faces
  for (let i = 0; i < FACE_COUNT; i++) {
    const face = createPentagonFace(i, pentagonSize, faceImages[i]);
    const transform = FACE_TRANSFORMS[i];
    
    // Position the face: azimuth first (rotateY), then elevation (rotateX), then push outward, then orient (rotateZ)
    // rotateY sets which direction around the vertical axis
    // rotateX tilts up/down relative to that direction
    // rotateZ rotates the pentagon around its own center to align edges with neighbors
    // yOffset corrects for pentagon circumcenter not being at bounding box center
    // capCorrection applies a final translateY to fix depth offset for cap faces
    const capAdjust = transform.capCorrection * pentagonSize;
    gsap.set(face, {
      position: "absolute",
      top: "50%",
      left: "50%",
      xPercent: -50,
      yPercent: -50 + transform.yOffset,
      transform: `rotateY(${transform.rotateY}deg) rotateX(${transform.rotateX}deg) translateZ(${radius}px) rotateZ(${transform.rotateZ}deg) translateY(${capAdjust}px)`,
    });

    dodeca.appendChild(face);
  }

  // Append dodecahedron to container
  container.appendChild(dodeca);

  // Append container to document
  globalVars.warp.appendChild(container);

  // Animate the dodecahedron (continuous center rotation)
  const spinTween = animateDodecahedron(dodeca, speedPercent);

  // Remove after animation
  setTimeout(() => {
    if (container.parentNode) {
      // Stop animation to avoid leaks
      if (spinTween) {
        spinTween.kill();
      }
      container.parentNode.removeChild(container);
    }
  }, 10000);
}

function createPentagonFace(
  index: number,
  size: number,
  imageUrl: string
): HTMLElement {
  const face = document.createElement("div");
  face.className = `dodecahedron-face face-${index}`;

  // Create pentagon shape using clip-path
  // Regular pentagon vertices (centered, pointing up)
  const pentagonClip = "polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)";

  gsap.set(face, {
    width: size,
    height: size,
    clipPath: pentagonClip,
    backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
    backgroundColor: imageUrl
      ? "rgba(220, 220, 220, 0.38)"
      : `hsl(${index * 30}, 22%, 70%)`,    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  });

  return face;
}

function animateDodecahedron(
  dodeca: HTMLElement,
  speedPercent: number
): gsap.core.Tween {
  // Clamp and map speed (1-100) so higher is faster. Keep 50 => 20s (previous default)
  const clamped = Math.max(1, Math.min(100, Math.floor(speedPercent)));
  const durationSeconds = 1000 / clamped; // 50 -> 20s, 100 -> 10s, 25 -> 40s, etc.

  return gsap.to(dodeca, {
    rotationX: "+=360",
    rotationY: "+=360",
    rotationZ: "+=180",
    duration: durationSeconds,
    ease: "none",
    repeat: -1,
    transformOrigin: "50% 50%",
  });
}

function getFaceImages(images: string[]): string[] {
  // Use up to the first 12 images
  const trimmed = images.slice(0, FACE_COUNT);

  if (trimmed.length === 0) {
    return Array(FACE_COUNT).fill("");
  }

  if (trimmed.length === 1) {
    return Array(FACE_COUNT).fill(trimmed[0]);
  }

  // Cycle through provided images to fill all 12 faces
  const faces: string[] = [];
  for (let i = 0; i < FACE_COUNT; i++) {
    faces.push(trimmed[i % trimmed.length]);
  }
  return faces;
}

