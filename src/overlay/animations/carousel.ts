import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export function carousel(
  images: string[],
  count: number = 100,
  interval: number = 150
): void {
  const imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the different emote images
    const imagenum = j % imgcount;
    setTimeout(() => {
      createCarousel(images[imagenum]);
    }, j * interval);
  }
}

function createCarousel(image: string): void {
  const Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const startX = -100;
  const centerY = innerHeight / 2;

  //create at random Y height at left edge of screen
  gsap.set(Div, {
    className: "carousel-element",
    x: startX,
    y: centerY,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  carousel_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

function buildCarouselPath(): string {
  const startX = -100;
  const endX = innerWidth + 100;
  const centerY = innerHeight / 2;
  const controlOffset = (endX - startX) * 0.25;
  const verticalRadius = Math.min(Math.max(innerHeight * 0.18, 140), 240);
  const lowerY = centerY + verticalRadius;
  const upperY = centerY - verticalRadius;

  return [
    `M ${startX} ${centerY}`,
    `C ${startX + controlOffset} ${lowerY} ${endX - controlOffset} ${lowerY} ${endX} ${centerY}`,
    `C ${endX - controlOffset} ${upperY} ${startX + controlOffset} ${upperY} ${startX} ${centerY}`,
  ].join(" ");
}

function renderCarouselDepth(element: HTMLElement, progress: number): void {
  const isTopHalf = progress >= 0.5;
  const topHalfProgress = isTopHalf ? (progress - 0.5) / 0.5 : 0;
  const depthAmount = isTopHalf ? Math.sin(topHalfProgress * Math.PI) : 0;
  const scale = 1 - depthAmount * 0.12;
  const opacity = 1 - depthAmount * 0.2;

  gsap.set(element, {
    scale,
    opacity,
  });
}

function carousel_animation(element: HTMLElement): void {
  const carouselPath = buildCarouselPath();
  const renderState = { progress: 0 };
  const timeline = gsap.timeline();

  renderCarouselDepth(element, renderState.progress);

  timeline.to(element, {
    duration: 5,
    ease: "sine.inOut",
    motionPath: {
      path: carouselPath,
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 0.5,
    },
  });

  timeline.to(
    renderState,
    {
      duration: 5,
      progress: 0.5,
      ease: "sine.inOut",
      onUpdate: () => {
        renderCarouselDepth(element, renderState.progress);
      },
    },
    0
  );

  timeline.to(element, {
    duration: 5,
    ease: "sine.inOut",
    motionPath: {
      path: carouselPath,
      alignOrigin: [0.5, 0.5],
      start: 0.5,
      end: 1,
    },
  });

  timeline.to(
    renderState,
    {
      duration: 5,
      progress: 1,
      ease: "sine.inOut",
      onUpdate: () => {
        renderCarouselDepth(element, renderState.progress);
      },
    },
    5
  );
}
