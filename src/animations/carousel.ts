import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export function carousel(
  images: string[],
  count: number = 100,
  interval: number = 150
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the different emote images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createCarousel(images[imagenum]);
    }, j * interval);
  }
}

function createCarousel(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  //create at random Y height at left edge of screen
  gsap.set(Div, {
    className: "carousel-element",
    x: innerWidth / 2,
    y: innerHeight / 2,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalConst.warp.appendChild(Div);

  // Run animation
  carousel_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

function carousel_animation(element: HTMLElement): void {
  //Travel left to right
  let carouselstartx = innerWidth / 2;
  let carouselstarty = innerHeight / 2;
  let carouselRadius = innerHeight / 4;

  //Maths constants for a proper circle
  let r = carouselRadius;
  let cx = carouselstartx;
  let cy = carouselstarty;
  let carouselPath =
    "M" + cx + "," + (cy - r) + " a" + r + "," + r + " 0 1 1 -0.0001,0";

  gsap.to(element, {
    duration: 10,
    // ease: "slow(0.7, 0.7, false)",
    ease: "none",
    delay: 0,
    motionPath: {
      alignOrigin: [0.5, 0.5],
      path: carouselPath,
    },
  });

  gsap.to(element, { scale: 0.1, duration: 9, delay: 0, ease: "none" });
  gsap.to(element, { opacity: 0, duration: 9, delay: 0, ease: "none" });
}
