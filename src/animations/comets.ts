import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function comets(
  images: string[],
  count: number = 100,
  interval: number = 50
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createEmoteComets(images[imagenum]);
    }, j * interval);
  }
}

function createEmoteComets(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  gsap.set(Div, {
    className: "comet-element",
    x: helpers.Randomizer(0, innerWidth),
    y: helpers.Randomizer(-200, -75),
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalConst.warp.appendChild(Div);

  // Run animation
  comet_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

// Comets animation
function comet_animation(element: HTMLElement): void {
  // create random size of the travel
  let cometDuration = helpers.Randomizer(4, 8);
  let cometSize = helpers.Randomizer(25, 100);
  let cometX = gsap.getProperty(element, "x") as number;
  if (cometX > 920) {
    cometX = cometX - helpers.Randomizer(1150, 1500);
  } else if (cometX < 920) {
    cometX = cometX + helpers.Randomizer(1150, 1500);
  }
  gsap.to(element, { duration: cometDuration, x: cometX, ease: "sine.out" });
  gsap.to(element, {
    duration: cometDuration,
    y: helpers.Randomizer(800, 1080),
    ease: "power3.in",
  });
  gsap.to(element, {
    duration: cometDuration,
    width: cometSize,
    height: cometSize,
    ease: "sine.out",
  });
  gsap.to(element, {
    duration: 1,
    opacity: 0,
    ease: "sine.inOut",
    delay: cometDuration,
  });
  gsap.to(element, {
    duration: 1,
    height: 0,
    ease: "power3.out",
    delay: cometDuration,
  });
}
