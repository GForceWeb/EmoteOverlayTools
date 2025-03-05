import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function spiral(
  images: string[],
  count: number = 100,
  interval: number = 75
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the different emote images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createSpiral(images[imagenum]);
    }, j * interval);
  }
}

function createSpiral(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  //create at random Y height at left edge of screen
  gsap.set(Div, {
    className: "spiral-element",
    x: innerWidth / 2,
    y: innerHeight / 2,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalConst.warp.appendChild(Div);

  // Run animation
  spiral_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

function spiral_animation(element: HTMLElement): void {
  //Travel left to right
  let spiralstartx = innerWidth / 2;
  let spiralstarty = innerHeight / 2;
  let spiralPath =
    "c -47 0 -85.1 -36.09 -85.1 -80.69 c 0 -52.43 44.84 -94.94 100.15 -94.94 c 65.08 0 117.84 50.01 117.84 111.69 c 0 72.58 -62.07 131.41 -138.63 131.41 c -90.09 0 -163.09 -69.21 -163.09 -154.59 c 0 -100.45 85.87 -181.88 191.87 -181.88 c 124.67 0 225.74 95.83 225.74 214 c 0 139 -118.9 251.73 -265.6 251.73 c -172.56 0 -312.44 -132.59 -312.44 -296.15 c 0 -192.42 164.57 -348.42 367.57 -348.42 c 238.83 0 432.44 183.52 432.44 409.9 c 0 266.34 -227.75 482.24 -508.75 482.24 c -330.53 0 -598.5 -254 -598.5 -567.3 c 0 -368.67 315.26 -667.5 704.15 -667.5 c 457.52 0 828.42 351.57 828.42 785.25";

  let finalPath = "M " + spiralstartx + " " + spiralstarty + " " + spiralPath;

  gsap.to(element, {
    duration: 13,
    // ease: "slow(0.7, 0.7, false)",
    ease: "power1.in",
    delay: 0,
    motionPath: {
      alignOrigin: [0.5, 0.5],
      path: finalPath,
    },
  });

  gsap.to(element, {
    opacity: 0,
    duration: 2,
    delay: 11.5,
    ease: Sine.easeOut,
  });
}
