import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function rain(
  images: string[],
  count: number = 100,
  interval: number = 50
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createEmoteRain(images[imagenum]);
    }, j * interval);
  }
}

function createEmoteRain(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const minSpawnHeight = helpers.scaleRelativeToHeight(450);
  const maxSpawnHeight = helpers.scaleRelativeToHeight(500);

  gsap.set(Div, {
    className: "falling-element",
    x: helpers.Randomizer(0, innerWidth),
    y: helpers.Randomizer(-maxSpawnHeight, -minSpawnHeight),
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  falling_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

// Falling animation
function falling_animation(element: HTMLElement): void {
  gsap.to(element, helpers.Randomizer(6, 16), {
    y: innerHeight + helpers.scaleRelativeToHeight(1400),
    ease: Linear.easeNone,
    repeat: 0,
    delay: -1,
  });
  gsap.to(element, helpers.Randomizer(4, 8), {
    x: `+=${helpers.scaleRelativeToWidth(100)}`,
    rotationZ: helpers.Randomizer(0, 180),
    repeat: 4,
    yoyo: true,
    ease: Sine.easeInOut,
  });
  gsap.to(element, helpers.Randomizer(2, 8), {
    rotationX: helpers.Randomizer(0, 360),
    rotationY: helpers.Randomizer(0, 360),
    repeat: 8,
    yoyo: true,
    ease: Sine.easeInOut,
    delay: -5,
  });
}
