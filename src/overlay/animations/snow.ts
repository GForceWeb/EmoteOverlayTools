import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function snow(
  images: string[],
  count: number = 100,
  interval: number = 80
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amongst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createSnowflake(images[imagenum]);
    }, j * interval);
  }
}

function createSnowflake(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  // Random starting position across the screen width, slightly above viewport
  const startX = helpers.Randomizer(0, innerWidth);
  
  gsap.set(Div, {
    className: "falling-element",
    x: startX,
    y: helpers.Randomizer(-300, -100),
    z: helpers.Randomizer(-100, 100),
    backgroundImage: "url(" + image + ")",
    opacity: helpers.Randomizer(70, 100) / 100, // Slight opacity variation for depth
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  snowfall_animation(Div, startX);
  
  // Destroy element after animation completes
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 18000);
}

// Snow falling animation - slower, drifting, more floaty than rain
function snowfall_animation(element: HTMLElement, startX: number): void {
  // Slow, gentle descent - much slower than rain
  const fallDuration = helpers.Randomizer(10, 20);
  
  gsap.to(element, fallDuration, {
    y: innerHeight + 200,
    ease: Linear.easeNone,
    repeat: 0,
  });
  
  // Gentle side-to-side drifting - the key snow characteristic
  // Multiple overlapping sine waves for natural movement
  const driftAmount = helpers.Randomizer(80, 180);
  const driftDuration = helpers.Randomizer(2, 4);
  
  gsap.to(element, driftDuration, {
    x: `+=${driftAmount}`,
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
  });
  
  // Secondary smaller drift for more organic feel
  gsap.to(element, helpers.Randomizer(1, 2), {
    x: `+=${helpers.Randomizer(20, 40)}`,
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
    delay: helpers.Randomizer(0, 1),
  });
  
  // Gentle slow rotation - snowflakes tumble slowly
  gsap.to(element, helpers.Randomizer(4, 10), {
    rotationZ: helpers.Randomizer(-180, 180),
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
  });
  
  // Very subtle 3D tumble for depth
  gsap.to(element, helpers.Randomizer(6, 12), {
    rotationX: helpers.Randomizer(-30, 30),
    rotationY: helpers.Randomizer(-30, 30),
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
    delay: helpers.Randomizer(0, 2),
  });
  
  // Subtle scale pulsing for "floating" feel
  gsap.to(element, helpers.Randomizer(2, 4), {
    scale: helpers.Randomizer(90, 110) / 100,
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
  });
}
