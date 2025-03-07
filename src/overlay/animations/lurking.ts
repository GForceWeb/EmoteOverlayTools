import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../../shared/types.ts";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function lurking(
  image: string,
  iterations: number = 3,
  interval: number = 5000
): void {
  for (let j = 0; j < iterations; j++) {
    let delay = j * interval; // Delay between each iteration in ms

    setTimeout(() => {
      createVisualLurk(image);
    }, delay);
  }
}

function lurking_animation_left(element: HTMLElement): void {
  gsap.to(element, 1, {
    rotationZ: "+=40",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    x: "+=200",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    rotationZ: "-=40",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
  gsap.to(element, 1, {
    x: "-=200",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
}

function lurking_animation_right(element: HTMLElement): void {
  gsap.to(element, 1, {
    rotationZ: "-=40",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    x: "-=200",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    rotationZ: "+=40",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
  gsap.to(element, 1, {
    x: "+=200",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
}

function lurking_animation_top(element: HTMLElement): void {
  gsap.to(element, 1, {
    y: "+=250",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    y: "-=250",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
}

function lurking_animation_bottom(element: HTMLElement): void {
  gsap.to(element, 1, {
    y: "-=250",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    y: "+=250",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
}

function createVisualLurk(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  Div.style.background = "url(" + image + ")";
  Div.style.backgroundSize = "100% 100%";

  console.log("Creating a Lurk Element");

  //randomise side to peep from
  var random = Math.floor(helpers.Randomizer(1, 4.99));

  switch (random) {
    case 1:
      // left
      gsap.set(Div, {
        className: "lurking-element",
        x: -400,
        y: helpers.Randomizer(0, innerHeight - 400),
        z: 0,
      });
      lurking_animation_left(Div);
      break;
    case 2:
      // right
      gsap.set(Div, {
        className: "lurking-element",
        x: innerWidth,
        y: helpers.Randomizer(0, innerHeight - 400),
        z: 0,
      });
      lurking_animation_right(Div);
      break;
    case 3:
      // top
      gsap.set(Div, {
        className: "lurking-element",
        x: helpers.Randomizer(0, innerWidth - 400),
        y: -400,
        z: 0,
        rotationX: 180,
      });
      lurking_animation_top(Div);
      break;
    default:
      // bottom
      gsap.set(Div, {
        className: "lurking-element",
        x: helpers.Randomizer(0, innerWidth - 400),
        y: innerHeight,
        z: 0,
      });
      lurking_animation_bottom(Div);
  }
  globalConst.warp.appendChild(Div);

  // Run animation
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}
