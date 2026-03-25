import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

const LURK_BASE_SIZE = 400;

function getLurkSize(): number {
  return helpers.scaleRelativeToViewport(LURK_BASE_SIZE);
}

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
  const horizontalPeek = helpers.scaleRelativeToWidth(200);

  gsap.to(element, 1, {
    rotationZ: "+=40",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    x: `+=${horizontalPeek}`,
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
    x: `-=${horizontalPeek}`,
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
}

function lurking_animation_right(element: HTMLElement): void {
  const horizontalPeek = helpers.scaleRelativeToWidth(200);

  gsap.to(element, 1, {
    rotationZ: "-=40",
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    x: `-=${horizontalPeek}`,
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
    x: `+=${horizontalPeek}`,
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
}

function lurking_animation_top(element: HTMLElement): void {
  const verticalPeek = helpers.scaleRelativeToHeight(250);

  gsap.to(element, 1, {
    y: `+=${verticalPeek}`,
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    y: `-=${verticalPeek}`,
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 1.5,
  });
}

function lurking_animation_bottom(element: HTMLElement): void {
  const verticalPeek = helpers.scaleRelativeToHeight(250);

  gsap.to(element, 1, {
    y: `-=${verticalPeek}`,
    yoyo: true,
    repeat: 0,
    ease: Sine.easeInOut,
    delay: 0,
  });
  gsap.to(element, 1, {
    y: `+=${verticalPeek}`,
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
  const lurkSize = getLurkSize();

  console.log("Creating a Lurk Element");

  //randomise side to peep from
  var random = Math.floor(helpers.Randomizer(1, 4.99));

  switch (random) {
    case 1:
      // left
      gsap.set(Div, {
        className: "lurking-element",
        x: -lurkSize,
        y: helpers.Randomizer(0, Math.max(innerHeight - lurkSize, 0)),
        z: 0,
      });
      lurking_animation_left(Div);
      break;
    case 2:
      // right
      gsap.set(Div, {
        className: "lurking-element",
        x: innerWidth,
        y: helpers.Randomizer(0, Math.max(innerHeight - lurkSize, 0)),
        z: 0,
      });
      lurking_animation_right(Div);
      break;
    case 3:
      // top
      gsap.set(Div, {
        className: "lurking-element",
        x: helpers.Randomizer(0, Math.max(innerWidth - lurkSize, 0)),
        y: -lurkSize,
        z: 0,
        rotationX: 180,
      });
      lurking_animation_top(Div);
      break;
    default:
      // bottom
      gsap.set(Div, {
        className: "lurking-element",
        x: helpers.Randomizer(0, Math.max(innerWidth - lurkSize, 0)),
        y: innerHeight,
        z: 0,
      });
      lurking_animation_bottom(Div);
  }
  globalVars.warp.appendChild(Div);

  // Run animation
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}
