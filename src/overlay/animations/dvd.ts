import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function dvd(
  images: string[],
  count: number = 8,
  interval: number = 50
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amounst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createEmoteDVD(images[imagenum]);
    }, j * interval);
  }
}

function createEmoteDVD(image: string): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  const elementSize = helpers.getCSSPixelValue(
    "--emote-size-standard",
    helpers.scaleRelativeToViewport(75)
  );

  gsap.set(Div, {
    className: "dvd-element",
    x: helpers.Randomizer(0, Math.max(innerWidth - elementSize, 0)),
    y: helpers.Randomizer(0, Math.max(innerHeight - elementSize, 0)),
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
  });

  globalVars.warp.appendChild(Div);

  // Run animation
  dvd_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

// DVD Bounce animation
function dvd_animation(element: HTMLElement): void {
  gsap.to(element, {
    duration: 15,
    x: helpers.Randomizer(4000, 8000) * helpers.randomSign(),
    y: helpers.Randomizer(4000, 8000) * helpers.randomSign(),
    modifiers: { x: modX, y: modY },
  });

  gsap.to(element, { duration: 1, opacity: 0, delay: 14 });
}

function modX(x) {
  var minX = 0;
  var size = helpers.getCSSPixelValue(
    "--emote-size-standard",
    helpers.scaleRelativeToViewport(75)
  );
  var maxX = Math.max(innerWidth - size, 1);
  x = parseInt(x);

  if (x > maxX || x < minX) {
    var delta = ((x % maxX) + maxX) % maxX;
    var start = x > maxX ? 1 : 0;
    var ratio = x / maxX + start;
    var even = !(ratio & 1);

    x = even ? maxX - delta : minX + delta;
  }

  return x + "px";
}

function modY(y) {
  var minY = 0;
  var size = helpers.getCSSPixelValue(
    "--emote-size-standard",
    helpers.scaleRelativeToViewport(75)
  );
  var maxY = Math.max(innerHeight - size, 1);
  y = parseInt(y);

  if (y > maxY || y < minY) {
    var delta = ((y % maxY) + maxY) % maxY;
    var start = y > maxY ? 1 : 0;
    var ratio = y / maxY + start;
    var even = !(ratio & 1);

    y = even ? maxY - delta : minY + delta;
  }

  return y + "px";
}
