import { gsap } from "gsap";

import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";

const BASE_SIZE = 150;
const MAX_WIDTH_MULTIPLIER = 2.5;
const GROW_DURATION = 6.5;
const FADE_IN_DURATION = 1.2;

export function gigantify(images: string[]): void {
  const image = images[0];
  if (!image) {
    return;
  }

  createGigantifiedEmote(image);
}

function createGigantifiedEmote(image: string): void {
  const emote = document.createElement("div");
  emote.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const startSize = Math.max(
    helpers.scaleRelativeToViewport(BASE_SIZE),
    window.innerWidth * 0.08
  );
  const targetSize = window.innerWidth * MAX_WIDTH_MULTIPLIER;
  const targetScale = targetSize / startSize;
  const fadeOutStart = Math.max(
    1.5,
    ((window.innerWidth - startSize) / (targetSize - startSize)) * GROW_DURATION
  );

  gsap.set(emote, {
    className: "gigantify-emote",
    position: "absolute",
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    width: startSize,
    height: startSize,
    scale: 1,
    opacity: 0,
    zIndex: 30,
    pointerEvents: "none",
    backgroundImage: `url(${image})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    filter: "drop-shadow(0 0 30px rgba(255, 255, 255, 0.35))",
    willChange: "transform, opacity",
  });

  globalVars.warp.appendChild(emote);

  const timeline = gsap.timeline({
    onComplete: () => {
      helpers.removeelement(emote.id);
    },
  });

  timeline.to(
    emote,
    {
      opacity: 1,
      duration: FADE_IN_DURATION,
      ease: "sine.out",
    },
    0
  );

  timeline.to(
    emote,
    {
      scale: targetScale,
      duration: GROW_DURATION,
      ease: "none",
    },
    0
  );

  timeline.to(
    emote,
    {
      opacity: 0,
      duration: Math.max(2.2, GROW_DURATION - fadeOutStart + 0.6),
      ease: "sine.in",
    },
    fadeOutStart
  );
}