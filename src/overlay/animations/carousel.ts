import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../../shared/types.ts";
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
    x: -100,
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
  gsap.to(element, { x: innerWidth + 100, duration: 5, ease: Sine.easeInOut });
  gsap.to(element, {
    y: "+=200",
    duration: 2.5,
    ease: Sine.easeInOut,
    repeat: 1,
    yoyo: true,
  });

  gsap.to(element, { x: -100, duration: 5, ease: Sine.easeInOut, delay: 5 });
  gsap.to(element, {
    y: "-=200",
    duration: 2.5,
    ease: Sine.easeInOut,
    repeat: 1,
    yoyo: true,
    delay: 5,
  });
}
