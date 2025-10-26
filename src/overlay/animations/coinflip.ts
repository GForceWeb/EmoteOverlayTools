import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

type CoinResult = "Heads" | "Tails";

/**
 * Creates a coin flip animation
 * @param count Number of coins to flip sequentially
 * @param result Optional result (Heads or Tails). If not provided, result is random
 */
const HEADS_IMG = new URL("../../../assets/img/heads.png", import.meta.url).toString();
const TAILS_IMG = new URL("../../../assets/img/tails.png", import.meta.url).toString();

export function coinflip(count: number = 1, result?: CoinResult): void {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      // If no result provided, randomize between Heads and Tails
      const finalResult = result || (Math.random() < 0.5 ? "Heads" : "Tails");
      createCoinFlip(finalResult as CoinResult);
    }, i * 1500);
  }
}

function createCoinFlip(result: CoinResult): void {
  // Create a wrapper positioned at bottom-center
  const wrapper = document.createElement("div");
  wrapper.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  // Resolve coin size from CSS variable with a sensible fallback
  const root = document.documentElement;
  const cssSize = getComputedStyle(root).getPropertyValue("--emote-size-large");
  const coinSize = Math.max(64, parseInt(cssSize || "0", 10) || Math.ceil(window.innerHeight / 7));

  gsap.set(wrapper, {
    className: "coinBox",
    x: window.innerWidth / 2 - coinSize / 2,
    y: window.innerHeight - coinSize - 20,
    width: coinSize,
    height: coinSize,
    perspective: 800,
    pointerEvents: "none",
  });

  // Build the coin with two faces for a 3D flip
  const coin = document.createElement("div");
  const faceHeads = document.createElement("div");
  const faceTails = document.createElement("div");
  const edgeWrap = document.createElement("div");

  // Common coin styling
  gsap.set(coin, {
    width: "100%",
    height: "100%",
    position: "absolute",
    transformStyle: "preserve-3d",
    transformOrigin: "50% 50%",
    borderRadius: "50%",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
  });

  // Thickness of the coin edge
  const thickness = Math.max(6, Math.round(coinSize * 0.08));
  const radius = coinSize / 2;
  // Offset inward by half the thickness so the outer rim aligns with the coin perimeter
  const ringRadius = radius - thickness / 2;

  // Faces
  const faceCommon = {
    position: "absolute" as const,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#3b2f18",
    backfaceVisibility: "hidden" as const,
    userSelect: "none" as const,
  };

  // Heads face (front)
  gsap.set(faceHeads, {
    ...faceCommon,
    background: "radial-gradient(circle at 35% 35%, #ffe8a6, #d4a94f 60%, #b0842a)",
    textShadow: "0 1px 0 #fff8, 0 -1px 0 #0002",
    fontSize: Math.round(coinSize * 0.25),
    innerText: "Heads",
    rotateX: 0,
    z: thickness / 2,
  } as any);
  faceHeads.innerText = "";

  // Tails face (back)
  gsap.set(faceTails, {
    ...faceCommon,
    background: "radial-gradient(circle at 35% 35%, #ffe8a6, #d4a94f 60%, #b0842a)",
    textShadow: "0 1px 0 #fff8, 0 -1px 0 #0002",
    fontSize: Math.round(coinSize * 0.25),
    innerText: "Tails",
    rotateX: 180,
    z: -thickness / 2,
  } as any);
  faceTails.innerText = "";

  // Optional image overlays for faces
  const overlayCommon = {
    position: "absolute" as const,
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    pointerEvents: "none" as const,
    borderRadius: "50%",
  };

  const headsOverlay = document.createElement("div");
  gsap.set(headsOverlay, {
    ...overlayCommon,
    backgroundImage: `url(${HEADS_IMG})`,
  } as any);
  faceHeads.appendChild(headsOverlay);

  const tailsOverlay = document.createElement("div");
  gsap.set(tailsOverlay, {
    ...overlayCommon,
    backgroundImage: `url(${TAILS_IMG})`,
  } as any);
  faceTails.appendChild(tailsOverlay);

  // Edge wrapper (contains many thin slices to simulate a cylinder)
  gsap.set(edgeWrap, {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    transformStyle: "preserve-3d",
  });

  // Slight inward scale so the rectangular slices visually match the circular face perimeter
  const fudgePx = Math.max(1, Math.round(coinSize * 0.15));
  const ringScale = (radius - fudgePx) / radius;
  gsap.set(edgeWrap, { transformOrigin: "50% 50%", scale: ringScale });

  const slices = 48; // more slices = smoother edge
  for (let i = 0; i < slices; i++) {
    const angle = (i / slices) * 360;
    const shade = i % 2 === 0 ? "#c59d3e" : "#b78e32";

    const sliceWrap = document.createElement("div");
    const slice = document.createElement("div");

    // Centered wrapper that rotates around Z to orient the slice position
    gsap.set(sliceWrap, {
      position: "absolute",
      width: "100%",
      height: "100%",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      rotateZ: angle,
    });

    // The actual thin rectangle positioned along the rotated X axis
    gsap.set(slice, {
      position: "absolute",
      width: thickness,
      height: "100%",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      transformOrigin: "50% 50%",
      background: `linear-gradient(90deg, #8a6b24, ${shade}, #e5bc5a)`,
      x: ringRadius,
      rotateY: 90,
    } as any);

    sliceWrap.appendChild(slice);
    edgeWrap.appendChild(sliceWrap);
  }

  coin.appendChild(faceHeads);
  coin.appendChild(faceTails);
  coin.appendChild(edgeWrap);
  wrapper.appendChild(coin);
  globalVars.warp.appendChild(wrapper);

  // Calculate the final rotation based on desired result
  const spins = Math.floor(helpers.Randomizer(4, 7)); // 4-6 full spins
  const endOffset = result === "Heads" ? 0 : 180; // Faces defined above
  const finalRotX = spins * 360 + endOffset;

  // Tiny wobble on X to give a 3D feel
  const wobble = helpers.Randomizer(6, 14) * helpers.randomSign();

  // Animate upward travel and spin
  const tl = gsap.timeline({
    onComplete: () => {
      helpers.removeelement(wrapper.id);
    },
  });

  const topY = Math.max(20, Math.round(window.innerHeight * 0.1));
  const startY = window.innerHeight - coinSize - 20;
  const upDur = 1.4;
  const downDur = 1.4;

  // Upward travel
  tl.to(wrapper, {
    duration: upDur,
    y: topY,
    ease: "power2.out",
  });

  // Split rotation to ensure it continues smoothly during descent and lands on the final face
  const topRotX = finalRotX * (upDur / (upDur + downDur));
  tl.to(
    coin,
    {
      duration: upDur,
      rotateX: topRotX,
      rotateY: `+=${wobble / 2}`,
      ease: "none",
    },
    0
  );

  // Descend and land with a small bounce at the starting point
  tl.to(wrapper, {
    duration: downDur,
    y: startY,
    ease: "power2.in",
  });

  // Continue spin during descent to the exact final orientation
  tl.to(
    coin,
    {
      duration: downDur,
      rotateX: finalRotX,
      rotateY: `+=${wobble / 2}`,
      ease: "none",
    },
    upDur
  );

  // Subtle landing squash
  tl.to(wrapper, { duration: 0.08, scaleY: 0.96, scaleX: 1.02, ease: "power1.out" });
  tl.to(wrapper, { duration: 0.12, scaleY: 1, scaleX: 1, ease: "power1.in" });

  // Brief hold showing result, then fade
  tl.to(wrapper, { duration: 7.0, ease: "none" });
  tl.to(wrapper, { duration: 0.4, opacity: 0, ease: "power1.in" });
}