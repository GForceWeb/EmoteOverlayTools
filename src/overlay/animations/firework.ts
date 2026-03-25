import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

type Point = {
  x: number;
  y: number;
};

type FireworkBurst = {
  launchPoint: Point;
  explodePoint: Point;
  boostPoint: Point;
  coastPoint: Point;
  travelTime: number;
  burstDelay: number;
  burstRadius: number;
  gravity: number;
  drift: number;
  upwardBias: number;
};

export function firework(
  images: string[],
  count: number = 100,
  interval: number = 1
): void {
  if (images.length === 0) {
    return;
  }

  let imgcount = images.length;
  let chargeCount = Math.ceil(count / imgcount);

  //separate firework for each image
  for (let i = 0; i < imgcount; i++) {
    const burst = createBurstProfile();

    setTimeout(() => {
      createFireworkTravel(images[i], burst);
    }, i * 50);

    for (let j = 0; j < chargeCount; j++) {
      setTimeout(() => {
        createFireworkExplode(images[i], burst, j, chargeCount);
      }, j * Math.max(interval, 8));
    }
  }
}

function createBurstProfile(): FireworkBurst {
  const horizontalMargin = innerWidth * 0.1;
  const topMargin = innerHeight * 0.05;
  const bottomMargin = innerHeight * 0.25;
  const launchDirection = helpers.randomSign();
  const launchPoint = {
    x: innerWidth / 2 + helpers.Randomizer(-innerWidth * 0.22, innerWidth * 0.22),
    y: innerHeight + helpers.Randomizer(30, 120),
  };
  const explodePoint = {
    x: helpers.Randomizer(horizontalMargin, innerWidth - horizontalMargin),
    y: helpers.Randomizer(topMargin, innerHeight - bottomMargin),
  };
  const travelTime = helpers.Randomizer(1.4, 2.6);
  const verticalTravel = launchPoint.y - explodePoint.y;
  const horizontalTravel = explodePoint.x - launchPoint.x;
  const boostHeight = verticalTravel * helpers.Randomizer(0.28, 0.4);
  const coastHeight = verticalTravel * helpers.Randomizer(0.72, 0.88);

  return {
    launchPoint,
    explodePoint,
    boostPoint: {
      x: launchPoint.x + horizontalTravel * helpers.Randomizer(0.08, 0.18),
      y: launchPoint.y - boostHeight,
    },
    coastPoint: {
      x: launchPoint.x + horizontalTravel * helpers.Randomizer(0.58, 0.78) + helpers.Randomizer(-18, 18) * launchDirection,
      y: launchPoint.y - coastHeight,
    },
    travelTime,
    burstDelay: travelTime + helpers.Randomizer(0.02, 0.18),
    burstRadius: helpers.Randomizer(Math.min(innerWidth, innerHeight) * 0.14, Math.min(innerWidth, innerHeight) * 0.28),
    gravity: helpers.Randomizer(innerHeight * 0.1, innerHeight * 0.22),
    drift: helpers.Randomizer(-innerWidth * 0.06, innerWidth * 0.06),
    upwardBias: helpers.Randomizer(0.12, 0.34),
  };
}

function createFireworkTravel(
  image: string,
  burst: FireworkBurst
): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const baseScale = helpers.Randomizer(0.5, 0.9);

  gsap.set(Div, {
    className: "firework-element",
    x: burst.launchPoint.x,
    y: burst.launchPoint.y,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
    opacity: 0,
    scale: baseScale,
    rotation: helpers.Randomizer(-20, 20),
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  firework_travel_animation(Div, burst, baseScale);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, Math.ceil((burst.travelTime + 0.4) * 1000));
}

function createFireworkExplode(
  image: string,
  burst: FireworkBurst,
  index: number,
  totalCharges: number
): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const initialScale = helpers.Randomizer(0.5, 1.25);

  gsap.set(Div, {
    className: "firework-element",
    x: burst.explodePoint.x,
    y: burst.explodePoint.y,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
    opacity: 0,
    scale: initialScale,
    rotation: helpers.Randomizer(-90, 90),
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  firework_explode_animation(Div, burst, initialScale, index, totalCharges);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 8000);
}

// Launch animation
function firework_travel_animation(
  element: HTMLElement,
  burst: FireworkBurst,
  baseScale: number
): void {
  const boostDuration = burst.travelTime * helpers.Randomizer(0.2, 0.3);
  const coastDuration = burst.travelTime - boostDuration;
  const peakScale = baseScale * helpers.Randomizer(1.05, 1.22);
  const timeline = gsap.timeline();

  timeline.to(element, {
    duration: 0.08,
    opacity: 1,
    ease: "power1.out",
  });

  timeline.to(
    element,
    {
      duration: boostDuration,
      ease: "power3.in",
      motionPath: {
        path: [burst.launchPoint, burst.boostPoint],
        curviness: 1.05,
      },
      scale: peakScale,
    },
    0
  );

  timeline.to(
    element,
    {
      duration: coastDuration,
      ease: "power1.out",
      motionPath: {
        path: [burst.boostPoint, burst.coastPoint, burst.explodePoint],
        curviness: 1.08,
      },
      scale: baseScale * helpers.Randomizer(0.85, 1),
      rotation: `+=${helpers.Randomizer(-12, 12)}`,
    },
    boostDuration
  );

  timeline.to(
    element,
    {
      duration: 0.12,
      opacity: 0,
      scale: baseScale * 0.8,
      ease: "power1.in",
    },
    burst.travelTime - 0.08
  );
}

// Explosion Animation
function firework_explode_animation(
  element: HTMLElement,
  burst: FireworkBurst,
  initialScale: number,
  index: number,
  totalCharges: number
): void {
  const normalizedIndex = totalCharges <= 1 ? Math.random() : index / totalCharges;
  const baseAngle = normalizedIndex * Math.PI * 2;
  const angle = baseAngle + helpers.Randomizer(-0.42, 0.42);
  const distance = burst.burstRadius * helpers.Randomizer(0.45, 1.2);
  const firstLeg = distance * helpers.Randomizer(0.35, 0.6);
  const burstDirectionX = Math.cos(angle);
  const burstDirectionY = Math.sin(angle);
  const crossDrift = helpers.Randomizer(-distance * 0.18, distance * 0.18);
  const launchDelay = Math.max(0, burst.burstDelay + helpers.Randomizer(-0.04, 0.12));
  const spreadDuration = helpers.Randomizer(0.45, 0.8);
  const driftDuration = helpers.Randomizer(0.8, 1.8);
  const spin = helpers.Randomizer(120, 540) * helpers.randomSign();

  const firstPoint = {
    x: burst.explodePoint.x + burstDirectionX * firstLeg,
    y: burst.explodePoint.y + burstDirectionY * firstLeg - distance * burst.upwardBias,
  };

  const endPoint = {
    x: burst.explodePoint.x + burstDirectionX * distance + burst.drift + crossDrift,
    y:
      burst.explodePoint.y +
      burstDirectionY * distance +
      burst.gravity * helpers.Randomizer(0.65, 1.2) -
      distance * burst.upwardBias,
  };

  const timeline = gsap.timeline({ delay: launchDelay });

  timeline.to(element, {
    duration: 0.06,
    opacity: 1,
    scale: initialScale * helpers.Randomizer(1.05, 1.25),
    ease: "power2.out",
  });

  timeline.to(
    element,
    {
      duration: spreadDuration,
      ease: "power3.out",
      motionPath: {
        path: [burst.explodePoint, firstPoint],
        curviness: 1,
      },
      rotation: `+=${spin * 0.4}`,
    },
    0
  );

  timeline.to(
    element,
    {
      duration: driftDuration,
      ease: "power1.in",
      motionPath: {
        path: [firstPoint, endPoint],
        curviness: 1.15,
      },
      scale: initialScale * helpers.Randomizer(0.75, 1.05),
      rotation: `+=${spin * 0.6}`,
    },
    spreadDuration
  );

  timeline.to(
    element,
    {
      duration: helpers.Randomizer(0.35, 0.75),
      opacity: 0,
      ease: "power1.in",
    },
    spreadDuration + driftDuration * helpers.Randomizer(0.45, 0.7)
  );
}
