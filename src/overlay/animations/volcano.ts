import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export function volcano(
  images: string[],
  count: number = 100,
  interval: number = 30
): void {
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
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  gsap.set(Div, {
    className: "volcano-element",
    x: innerWidth / 2,
    y: innerHeight,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  volcano_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

// Explosion Animation
function volcano_animation(element: HTMLElement): void {
  //Set a base intensity value, then use that to derive the motion path
  let intensity = helpers.Randomizer(5, 100);

  let verticalStrengthx = 0;
  let verticalStrengthy = -200 * Math.ceil(intensity / 20);
  let horizontalStrengthx = 20 * Math.ceil(intensity / 5);
  let horizontalStrengthy = -400 * Math.ceil(intensity / 30);
  let finalLocationx = helpers.Randomizer(300, innerWidth / 2);
  let finalLocationy = helpers.Randomizer(-50, -350);

  //Flip half to the other side
  let direction = helpers.Randomizer(0, 1);
  if (Math.round(direction) == 1) {
    verticalStrengthx = -verticalStrengthx;
    horizontalStrengthx = -horizontalStrengthx;
    finalLocationx = -finalLocationx;
  }

  //Construct the Motion Path. Reference tool for paths: https://yqnn.github.io/svg-path-editor/
  let motionPath =
    "M" +
    " " +
    innerWidth / 2 +
    " " +
    innerHeight +
    " " +
    "c " +
    verticalStrengthx +
    " " +
    verticalStrengthy +
    " " +
    horizontalStrengthx +
    " " +
    horizontalStrengthy +
    " " +
    finalLocationx +
    " " +
    finalLocationy;

  //console.log(motionPath);

  gsap.to(element, {
    duration: helpers.Randomizer(4, 8),
    ease: "power2.out",
    delay: 0.5,
    motionPath: {
      path: motionPath,
    },
  });
  gsap.to(element, {
    duration: helpers.Randomizer(3, 5),
    opacity: 0,
    ease: Sine.easeIn,
    delay: 4,
  });
}
