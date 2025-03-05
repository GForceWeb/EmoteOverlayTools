import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function bounce(
  images: string[],
  count: number = 5,
  interval: number = 100
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createEmoteBounce(images[imagenum]);
    }, j * interval);
  }
}

function createEmoteBounce(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  gsap.set(Div, {
    className: "bounce-element",
    x: helpers.Randomizer(0, innerWidth),
    y: -300,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalConst.warp.appendChild(Div);

  // Run animation
  bounce_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

// Bounce animation
function bounce_animation(element: HTMLElement): void {
  gsap.to(element, 0.6, {
    y: innerHeight - 100,
    ease: Bounce.easeOut,
    delay: 1,
  });
  gsap.to(element, 5, { x: "+=" + helpers.Randomizer(-500, 500), delay: 1.6 });
  gsap.to(element, 5, {
    rotationY: 360,
    rotationX: 360,
    repeat: 1,
    delay: 1.6,
  });
  gsap.to(element, 3, { opacity: 0, delay: 6 });
}
