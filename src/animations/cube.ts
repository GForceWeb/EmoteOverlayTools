import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

interface CubeSide {
  front: HTMLElement;
  back: HTMLElement;
  right: HTMLElement;
  left: HTMLElement;
  top: HTMLElement;
  bottom: HTMLElement;
}

export function cube(images: string[], size: number = 150): void {
  const container = document.createElement("div");
  container.id = "cube-container-" + globalVars.divnumber;
  globalVars.divnumber++;
  container.className = "cube-container";

  // Set container styles
  gsap.set(container, {
    perspective: 1000,
    width: size,
    height: size,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 100,
  });

  // Create cube
  const cube = document.createElement("div");
  cube.className = "cube";
  gsap.set(cube, {
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
  });

  // Create sides
  const sides: CubeSide = {
    front: createCubeSide("front", size, images[0] || ""),
    back: createCubeSide("back", size, images[1] || images[0] || ""),
    right: createCubeSide("right", size, images[2] || images[0] || ""),
    left: createCubeSide(
      "left",
      size,
      images[3] || images[1] || images[0] || ""
    ),
    top: createCubeSide("top", size, images[4] || images[2] || images[0] || ""),
    bottom: createCubeSide(
      "bottom",
      size,
      images[5] || images[3] || images[1] || images[0] || ""
    ),
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
  globalConst.warp.appendChild(container);

  // Animate the cube
  animateCube(cube);

  // Remove after animation
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 10000);
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
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backfaceVisibility: "visible",
  });

  return side;
}

function animateCube(cube: HTMLElement): void {
  gsap.to(cube, {
    rotationX: `+=${helpers.Randomizer(360, 720)}`,
    rotationY: `+=${helpers.Randomizer(360, 720)}`,
    rotationZ: `+=${helpers.Randomizer(360, 720)}`,
    duration: 10,
    ease: "power1.inOut",
  });

  // Add some bounce
  gsap.to(cube, {
    y: `-=${helpers.Randomizer(50, 150)}`,
    duration: 1,
    repeat: 9,
    yoyo: true,
    ease: "power1.inOut",
  });
}
