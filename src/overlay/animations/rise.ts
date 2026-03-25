import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function rise(
  images: string[],
  count: number = 100,
  interval: number = 20
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createEmoteRise(images[imagenum]);
    }, j * interval);
  }
}

function createEmoteRise(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const riseStartOffset = helpers.scaleRelativeToViewport(75);

  gsap.set(Div, {
    className: "rising-element",
    x: helpers.Randomizer(0, innerWidth),
    y: innerHeight - riseStartOffset,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  rising_animation(Div);
  //Destroy element after 8 seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

// Rising animation
function rising_animation(element: HTMLElement): void {
  const riseSize = helpers.getCSSPixelValue(
    "--emote-size-standard",
    helpers.scaleRelativeToViewport(75)
  );

  //Fade In
  gsap.to(element, 3, {
    opacity: 1,
    width: riseSize,
    height: riseSize,
    ease: Linear.easeNone,
    repeat: 0,
    delay: -1,
  });
  //Vertical Movement
  gsap.to(element, {
    duration: helpers.Randomizer(10, 20),
    y: -helpers.scaleRelativeToHeight(100),
    x: function () {
      let xMove = gsap.getProperty(element, "x") as number;
      return (
        helpers.Randomizer(
          -helpers.scaleRelativeToWidth(250),
          helpers.scaleRelativeToWidth(250)
        ) + xMove
      );
    },
    ease: Linear.easeNone,
    repeat: 0,
    delay: -1,
  });
  //Fade Out
  gsap.to(element, {
    duration: 4,
    opacity: 0,
    ease: Linear.easeNone,
    repeat: 0,
    delay: helpers.Randomizer(9, 11),
  });
}
