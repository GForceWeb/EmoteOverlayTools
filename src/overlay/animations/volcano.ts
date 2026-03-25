import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

type VolcanoPoint = {
  x: number;
  y: number;
};

export function volcano(
  images: string[],
  count: number = 100,
  interval: number = 30
): void {
  if (images.length === 0) {
    return;
  }

  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createEmoteVolcano(images[imagenum]);
    }, j * interval);
  }
}

function createEmoteVolcano(image: string): void {
  const launchPoint = getLaunchPoint();
  const baseScale = helpers.Randomizer(0.75, 1.15);
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  gsap.set(Div, {
    className: "volcano-element",
    x: launchPoint.x,
    y: launchPoint.y,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
    opacity: 0,
    scale: baseScale,
    rotation: helpers.Randomizer(-25, 25),
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  volcano_animation(Div, launchPoint, baseScale);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

function getLaunchPoint(): VolcanoPoint {
  const craterWidth = Math.max(35, innerWidth * 0.03);

  return {
    x: innerWidth / 2 + helpers.Randomizer(-craterWidth, craterWidth),
    y: innerHeight + helpers.Randomizer(10, 55),
  };
}

// Explosion Animation
function volcano_animation(
  element: HTMLElement,
  startPoint: VolcanoPoint,
  baseScale: number
): void {
  const direction = helpers.randomSign();
  const launchPower = helpers.Randomizer(0.35, 1);
  const launchDuration = helpers.Randomizer(0.7, 1.25);
  const fallDuration = helpers.Randomizer(1.8, 3.3);
  const totalDuration = launchDuration + fallDuration;

  const arcHeight = innerHeight * (0.2 + launchPower * 0.38);
  const lateralSpread = innerWidth * (0.08 + launchPower * 0.24) * direction;
  const landingDrift = helpers.Randomizer(40, innerWidth * 0.08) * direction;

  const burstPoint: VolcanoPoint = {
    x: startPoint.x + helpers.Randomizer(10, 60) * direction,
    y: startPoint.y - helpers.Randomizer(60, 140),
  };

  const apexPoint: VolcanoPoint = {
    x: startPoint.x + lateralSpread * helpers.Randomizer(0.25, 0.45),
    y: startPoint.y - arcHeight,
  };

  const driftPoint: VolcanoPoint = {
    x: startPoint.x + lateralSpread * helpers.Randomizer(0.65, 0.9),
    y: startPoint.y - arcHeight * helpers.Randomizer(0.55, 0.7),
  };

  const landingPoint: VolcanoPoint = {
    x: startPoint.x + lateralSpread + landingDrift,
    y: innerHeight + helpers.Randomizer(50, 220),
  };

  const peakScale = baseScale * helpers.Randomizer(1.05, 1.3);
  const finalScale = baseScale * helpers.Randomizer(0.75, 1);
  const spinAmount = helpers.Randomizer(120, 540) * direction;

  const timeline = gsap.timeline();

  timeline.to(element, {
    duration: 0.12,
    opacity: 1,
    ease: "power1.out",
  });

  timeline.to(
    element,
    {
      duration: launchDuration,
      ease: "power3.out",
      motionPath: {
        path: [startPoint, burstPoint, apexPoint],
        curviness: 1.4,
      },
      scale: peakScale,
    },
    0
  );

  timeline.to(
    element,
    {
      duration: fallDuration,
      ease: "power1.in",
      motionPath: {
        path: [apexPoint, driftPoint, landingPoint],
        curviness: 1.25,
      },
      scale: finalScale,
    },
    launchDuration
  );

  timeline.to(
    element,
    {
      duration: totalDuration,
      rotation: `+=${spinAmount}`,
      ease: "none",
    },
    0
  );

  timeline.to(element, {
    duration: fallDuration * 0.4,
    opacity: 0,
    ease: "power1.in",
  }, launchDuration + fallDuration * 0.6);
}
