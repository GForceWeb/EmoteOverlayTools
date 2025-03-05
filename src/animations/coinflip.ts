import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

// Coin image URLs
const COIN_IMAGES = {
  heads: "https://www.joshworth.com/dev/78coins/img/cf/coin-heads.svg",
  tails: "https://www.joshworth.com/dev/78coins/img/cf/coin-tails.svg",
  edge: "https://www.joshworth.com/dev/78coins/img/cf/coin-edge.svg",
  line: "https://www.joshworth.com/dev/78coins/img/cf/coin-line.svg",
};

type CoinResult = "Heads" | "Tails";

/**
 * Creates a coin flip animation
 * @param count Number of coins to flip sequentially
 * @param result Optional result (Heads or Tails). If not provided, result is random
 */
export function coinFlip(count: number = 1, result?: string): void {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      // If no result provided, randomize between Heads and Tails
      const finalResult = result || (Math.random() < 0.5 ? "Heads" : "Tails");
      createCoinFlip(finalResult as CoinResult);
    }, i * 150);
  }
}

interface CoinElement {
  el: HTMLElement;
  heads: HTMLImageElement;
  tails: HTMLImageElement;
  edge: HTMLImageElement;
  line: HTMLImageElement;
  angle: number;
  rotateX: number;
  finalState: CoinResult;
}

function createCoinFlip(result: CoinResult): void {
  // Create container for perspective
  const container = document.createElement("div");
  gsap.set(container, {
    perspective: 1000,
    position: "absolute",
    left: "50%",
    bottom: "15%",
    xPercent: -50,
    width: "100px",
    height: "100px",
    zIndex: 10,
    opacity: 0,
  });

  document.body.appendChild(container);

  // Create coin wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "coin";
  wrapper.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  gsap.set(wrapper, {
    width: "100px",
    height: "100px",
    position: "absolute",
    transformStyle: "preserve-3d",
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
  });

  container.appendChild(wrapper);

  // Create heads side
  const heads = document.createElement("div");
  heads.className = "coinFace heads";
  gsap.set(heads, {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  });

  const headsImg = document.createElement("img");
  headsImg.src = COIN_IMAGES.heads;
  headsImg.style.width = "100%";
  headsImg.style.height = "100%";
  heads.appendChild(headsImg);

  // Create tails side
  const tails = document.createElement("div");
  tails.className = "coinFace tails";
  gsap.set(tails, {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    transform: "rotateX(180deg)", // Flip to back
    transformStyle: "preserve-3d",
  });

  const tailsImg = document.createElement("img");
  tailsImg.src = COIN_IMAGES.tails;
  tailsImg.style.width = "100%";
  tailsImg.style.height = "100%";
  tails.appendChild(tailsImg);

  // Create edge
  const edge = document.createElement("img");
  edge.src = COIN_IMAGES.edge;
  edge.className = "coinEdge";
  gsap.set(edge, {
    position: "absolute",
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    width: "100%",
    height: "100%",
    visibility: "hidden",
  });

  // Create line
  const line = document.createElement("img");
  line.src = COIN_IMAGES.line;
  line.className = "coinLine";
  gsap.set(line, {
    position: "absolute",
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    width: "100%",
    height: "100%",
    visibility: "hidden",
  });

  // Append all elements to wrapper
  wrapper.appendChild(heads);
  wrapper.appendChild(tails);
  wrapper.appendChild(edge);
  wrapper.appendChild(line);

  // Create coin object
  const coin: CoinElement = {
    el: wrapper,
    heads: headsImg,
    tails: tailsImg,
    edge: edge,
    line: line,
    angle: 0,
    rotateX: 0,
    finalState: result,
  };

  // Start animation
  flipCoinTrajectory(coin, container);

  // Remove after animation
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 20000);
}

function updateCoinState(coin: CoinElement): void {
  // Apply rotation to the wrapper
  gsap.set(coin.el, {
    rotationX: coin.rotateX,
  });

  // Calculate edge visibility based on rotation angle
  const angle = coin.rotateX % 360;
  const isEdgeVisible = Math.abs((angle % 180) - 90) < 15;

  coin.edge.style.visibility = isEdgeVisible ? "visible" : "hidden";
  coin.line.style.visibility = isEdgeVisible ? "visible" : "hidden";
}

function flipCoinTrajectory(coin: CoinElement, container: HTMLElement): void {
  const timeline = gsap.timeline({
    onUpdate: function () {
      updateCoinState(coin);
    },
  });

  // Fade in at the bottom
  timeline.to(container, {
    duration: 0.5,
    opacity: 1,
    scale: 1,
    ease: "power1.out",
  });

  // Calculate final rotation based on result
  const finalRotation = coin.finalState === "Heads" ? 0 : 180;

  // Number of flips - reduced for slower rotation
  const flips = Math.floor(helpers.Randomizer(1, 3)) + 4; // Fewer flips
  const fullRotation = flips * 360 + finalRotation;

  console.log("Coin flip rotation:", fullRotation);

  // First phase: Start flipping with consistent speed as the coin moves up
  timeline.to(
    coin,
    {
      duration: 1.5,
      rotateX: `+=${Math.floor(fullRotation * 0.5)}`, // First portion of rotation
      angle: `+=${Math.floor(fullRotation * 0.5)}`,
      ease: "linear", // Linear for consistent speed
      onUpdate: function () {
        updateCoinState(coin);
      },
    },
    "<"
  );

  // Move up with easeOut for natural deceleration at top
  timeline.to(
    container,
    {
      duration: 1.5, // Match rotation duration
      bottom: "70%", // Move to top
      ease: "power2.out", // More pronounced easing for better deceleration
    },
    "<"
  );

  // Second phase: Continue spinning consistently as it starts to fall
  timeline.to(coin, {
    duration: 0.75,
    rotateX: `+=${Math.floor(fullRotation * 0.25)}`, // Second portion of rotation
    angle: `+=${Math.floor(fullRotation * 0.25)}`,
    ease: "linear", // Keep consistent speed
    onUpdate: function () {
      updateCoinState(coin);
    },
  });

  // Start falling with the coin still spinning
  timeline.to(
    container,
    {
      duration: 0.8,
      bottom: "40%", // Start moving down
      ease: "power1.in", // Start of gravity
    },
    "<" // Sync with spin
  );

  // Final phase: Slow the spinning down for landing and show result
  timeline.to(coin, {
    duration: 0.75,
    rotateX: fullRotation, // Final rotation to show result, // Final rotation to show result
    angle: fullRotation,
    ease: "power1.out", // Ease out the rotation
    onUpdate: function () {
      updateCoinState(coin);
    },
  });

  // Complete the fall with bounce
  timeline.to(
    container,
    {
      duration: 0.6,
      bottom: "15%", // Back to starting position
      ease: "power2.in", // Accelerate down
    },
    "<" // Sync with final spin
  );

  // Add bounce effect separately for more natural physics
  timeline.to(container, {
    duration: 0.4,
    bottom: "18%", // Small bounce up
    ease: "power2.out",
  });

  timeline.to(container, {
    duration: 0.3,
    bottom: "15%", // Settle back down
    ease: "power2.in",
  });

  // Final state adjustment to ensure correct result is shown
  // timeline.to(
  //   coin,
  //   {
  //     duration: 0.2,
  //     rotateX: fullRotation,
  //     angle: fullRotation,
  //     onUpdate: function () {
  //       updateCoinState(coin);
  //     },
  //     onComplete: function () {
  //       // Ensure final state shows correct result
  //       coin.angle = fullRotation;
  //       updateCoinState(coin);
  //     },
  //   },
  //   "-=0.3"
  // );

  // Hold for a moment then fade out
  timeline.to(container, {
    duration: 1.5,
    delay: 15,
    opacity: 0,
    ease: "power1.in",
  });
}
