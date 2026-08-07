import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import OverlaySettings from "../settings";
import type { BubblesPoppingBehaviour } from "@/shared/types";

type BubbleElements = {
  container: HTMLDivElement;
  shell: HTMLDivElement;
  emote: HTMLDivElement;
  highlight: HTMLDivElement;
  ring: HTMLDivElement;
};

type ResolvedPopMode = "burst" | "burstAndFall";

export function bubbles(
  images: string[],
  count: number = 36,
  interval: number = 180
): void {
  if (images.length === 0) {
    return;
  }

  const safeCount = Math.max(1, Math.floor(count));
  const safeInterval = Math.max(20, interval);
  const imageCount = images.length;
  const activationMode = resolveActivationPopMode();

  for (let index = 0; index < safeCount; index++) {
    const imageIndex = index % imageCount;
    setTimeout(() => {
      createBubble(images[imageIndex], resolveBubblePopMode(activationMode));
    }, index * safeInterval);
  }
}

function getConfiguredPoppingBehaviour(): BubblesPoppingBehaviour {
  const configured =
    OverlaySettings.settings.animations.bubbles?.poppingBehaviour;
  if (
    configured === "burst" ||
    configured === "burstAndFall" ||
    configured === "randomPerBubble" ||
    configured === "randomPerActivation"
  ) {
    return configured;
  }
  return "randomPerActivation";
}

function pickRandomPopMode(): ResolvedPopMode {
  return Math.random() < 0.5 ? "burst" : "burstAndFall";
}

function resolveActivationPopMode(): ResolvedPopMode | "perBubble" {
  switch (getConfiguredPoppingBehaviour()) {
    case "burst":
      return "burst";
    case "burstAndFall":
      return "burstAndFall";
    case "randomPerBubble":
      return "perBubble";
    case "randomPerActivation":
    default:
      return pickRandomPopMode();
  }
}

function resolveBubblePopMode(
  activationMode: ResolvedPopMode | "perBubble"
): ResolvedPopMode {
  if (activationMode === "perBubble") {
    return pickRandomPopMode();
  }
  return activationMode;
}

function createBubble(image: string, popMode: ResolvedPopMode): void {
  const baseSize = helpers.getCSSPixelValue(
    "--emote-size-standard",
    helpers.scaleRelativeToViewport(72)
  );
  const bubbleSize = baseSize * helpers.Randomizer(1.05, 1.55);
  const startX = helpers.Randomizer(bubbleSize * 0.2, innerWidth - bubbleSize * 1.2);
  const startY = innerHeight + bubbleSize * helpers.Randomizer(0.4, 1.2);
  const driftDirection = helpers.randomSign();
  const willFall = popMode === "burstAndFall";
  const endY = willFall
    ? helpers.Randomizer(innerHeight * 0.38, innerHeight * 0.72)
    : helpers.Randomizer(innerHeight * 0.12, innerHeight * 0.48);
  const duration = willFall
    ? helpers.Randomizer(3.8, 7.2)
    : helpers.Randomizer(7.5, 13.5);
  const swayDistance = helpers.Randomizer(
    helpers.scaleRelativeToWidth(20),
    helpers.scaleRelativeToWidth(85)
  );
  const finalX = clampX(
    startX +
      helpers.Randomizer(
        -helpers.scaleRelativeToWidth(130),
        helpers.scaleRelativeToWidth(130)
      ),
    bubbleSize
  );
  const controlPointOne = {
    x: clampX(startX + swayDistance * driftDirection, bubbleSize),
    y: innerHeight - helpers.Randomizer(innerHeight * 0.16, innerHeight * 0.28),
  };
  const controlPointTwo = {
    x: clampX(finalX - swayDistance * helpers.randomSign() * 0.7, bubbleSize),
    y: willFall
      ? helpers.Randomizer(
          Math.min(controlPointOne.y, endY) - innerHeight * 0.08,
          Math.max(controlPointOne.y, endY) + innerHeight * 0.04
        )
      : innerHeight - helpers.Randomizer(innerHeight * 0.42, innerHeight * 0.6),
  };

  const elements = buildBubbleElements(image, bubbleSize);

  gsap.set(elements.container, {
    x: startX,
    y: startY,
    opacity: 0,
    z: helpers.Randomizer(-220, 220),
    rotation: helpers.Randomizer(-10, 10),
    scale: helpers.Randomizer(0.92, 1.08),
    transformOrigin: "50% 50%",
  });

  globalVars.warp.appendChild(elements.container);

  const ambientTweens = startAmbientBubbleMotion(elements);

  const timeline = gsap.timeline({
    onComplete: () => {
      cleanupBubble(elements);
    },
  });

  timeline.to(elements.container, {
    opacity: helpers.Randomizer(0.82, 0.96),
    duration: 0.45,
    ease: "sine.out",
  });

  timeline.to(
    elements.container,
    {
      duration,
      ease: "none",
      motionPath: {
        path: [
          { x: startX, y: startY },
          controlPointOne,
          controlPointTwo,
          { x: finalX, y: endY },
        ],
        curviness: 1.45,
        autoRotate: false,
      },
    },
    0
  );

  timeline.to(
    elements.container,
    {
      scale: 1.06,
      duration: 0.2,
      ease: "power2.out",
    },
    duration - 0.22
  );

  if (willFall) {
    appendMidPopAndFall(timeline, elements, ambientTweens, bubbleSize, duration);
  } else {
    appendTopPop(timeline, elements, duration);
  }
}

function appendTopPop(
  timeline: gsap.core.Timeline,
  elements: BubbleElements,
  duration: number
): void {
  timeline.to(
    elements.shell,
    {
      opacity: 0,
      scale: 1.34,
      duration: 0.18,
      ease: "power2.in",
    },
    duration
  );

  timeline.to(
    elements.emote,
    {
      opacity: 0,
      scale: 1.18,
      duration: 0.12,
      ease: "power2.in",
    },
    duration
  );

  timeline.fromTo(
    elements.ring,
    { opacity: 0, scale: 0.25 },
    {
      opacity: 0.8,
      scale: 1.7,
      duration: 0.28,
      ease: "power2.out",
    },
    duration
  );

  timeline.to(
    elements.ring,
    {
      opacity: 0,
      duration: 0.16,
      ease: "power1.in",
    },
    duration + 0.12
  );

  timeline.to(
    elements.container,
    {
      opacity: 0,
      scale: 0.92,
      duration: 0.14,
      ease: "power1.in",
    },
    duration + 0.1
  );
}

function appendMidPopAndFall(
  timeline: gsap.core.Timeline,
  elements: BubbleElements,
  ambientTweens: gsap.core.Tween[],
  bubbleSize: number,
  duration: number
): void {
  const fallDuration = helpers.Randomizer(1.5, 2.6);
  const fallDrift = helpers.Randomizer(
    -helpers.scaleRelativeToWidth(110),
    helpers.scaleRelativeToWidth(110)
  );
  const fallSpin = helpers.Randomizer(-160, 160);

  timeline.call(
    () => {
      for (const tween of ambientTweens) {
        tween.kill();
      }
      // Lift emote out of the shell so it stays visible while the bubble pops
      elements.container.appendChild(elements.emote);
      gsap.set(elements.emote, {
        position: "absolute",
        inset: "16%",
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
      });
    },
    undefined,
    duration
  );

  timeline.to(
    elements.shell,
    {
      opacity: 0,
      scale: 1.4,
      duration: 0.18,
      ease: "power2.in",
    },
    duration
  );

  timeline.to(
    elements.highlight,
    {
      opacity: 0,
      duration: 0.12,
      ease: "power1.in",
    },
    duration
  );

  timeline.fromTo(
    elements.ring,
    { opacity: 0, scale: 0.25 },
    {
      opacity: 0.85,
      scale: 1.75,
      duration: 0.28,
      ease: "power2.out",
    },
    duration
  );

  timeline.to(
    elements.ring,
    {
      opacity: 0,
      duration: 0.16,
      ease: "power1.in",
    },
    duration + 0.12
  );

  timeline.to(
    elements.emote,
    {
      opacity: 1,
      scale: 1.08,
      filter: "none",
      duration: 0.12,
      ease: "power1.out",
    },
    duration
  );

  timeline.to(
    elements.container,
    {
      y: innerHeight + bubbleSize * 1.6,
      x: `+=${fallDrift}`,
      rotation: `+=${fallSpin}`,
      scale: helpers.Randomizer(0.88, 1.05),
      duration: fallDuration,
      ease: "power2.in",
    },
    duration + 0.08
  );

  timeline.to(
    elements.emote,
    {
      opacity: 0,
      duration: 0.28,
      ease: "power1.in",
    },
    duration + fallDuration - 0.2
  );

  timeline.to(
    elements.container,
    {
      opacity: 0,
      duration: 0.2,
      ease: "power1.in",
    },
    duration + fallDuration - 0.15
  );
}

function startAmbientBubbleMotion(elements: BubbleElements): gsap.core.Tween[] {
  return [
    gsap.to(elements.container, {
      x: `+=${helpers.Randomizer(-18, 18)}`,
      duration: helpers.Randomizer(1.8, 3.1),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    }),
    gsap.to(elements.shell, {
      scaleX: helpers.Randomizer(0.94, 1.06),
      scaleY: helpers.Randomizer(0.97, 1.08),
      duration: helpers.Randomizer(1.5, 2.6),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      transformOrigin: "50% 50%",
    }),
    gsap.to(elements.emote, {
      xPercent: helpers.Randomizer(-10, 10),
      yPercent: helpers.Randomizer(-8, 8),
      rotation: helpers.Randomizer(-8, 8),
      duration: helpers.Randomizer(2.4, 4.2),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    }),
    gsap.to(elements.highlight, {
      xPercent: helpers.Randomizer(-12, 12),
      yPercent: helpers.Randomizer(-12, 12),
      opacity: helpers.Randomizer(0.45, 0.9),
      duration: helpers.Randomizer(1.8, 3.6),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    }),
    gsap.to(elements.container, {
      rotation: helpers.Randomizer(-4, 4),
      duration: helpers.Randomizer(2.8, 4.8),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    }),
  ];
}

function cleanupBubble(elements: BubbleElements): void {
  gsap.killTweensOf(elements.container);
  gsap.killTweensOf(elements.shell);
  gsap.killTweensOf(elements.emote);
  gsap.killTweensOf(elements.highlight);
  gsap.killTweensOf(elements.ring);
  helpers.removeelement(elements.container.id);
}

function buildBubbleElements(image: string, bubbleSize: number): BubbleElements {
  const container = document.createElement("div");
  container.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  container.className = "bubble-element";

  const shell = document.createElement("div");
  shell.className = "bubble-shell";

  const emote = document.createElement("div");
  emote.className = "bubble-emote";
  emote.style.backgroundImage = `url(${image})`;

  const highlight = document.createElement("div");
  highlight.className = "bubble-highlight";

  const ring = document.createElement("div");
  ring.className = "bubble-pop-ring";

  const sparkle = document.createElement("div");
  sparkle.className = "bubble-sparkle";

  shell.appendChild(emote);
  shell.appendChild(highlight);
  shell.appendChild(sparkle);
  container.appendChild(shell);
  container.appendChild(ring);

  gsap.set(container, {
    width: bubbleSize,
    height: bubbleSize,
    position: "absolute",
  });

  return {
    container,
    shell,
    emote,
    highlight,
    ring,
  };
}

function clampX(x: number, bubbleSize: number): number {
  return Math.min(Math.max(x, bubbleSize * 0.2), innerWidth - bubbleSize * 1.2);
}
