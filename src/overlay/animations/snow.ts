import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

type SnowPile = {
  columnWidth: number;
  heights: number[];
  emoteSize: number;
  maxHeight: number;
  landed: HTMLElement[];
  remaining: number;
  melting: boolean;
};

export function snow(
  images: string[],
  count: number = 100,
  interval: number = 80
): void {
  let imgcount = images.length;
  const pile = createSnowPile(count);

  for (let j = 0; j < count; j++) {
    // split the count amongst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createSnowflake(images[imagenum], pile);
    }, j * interval);
  }
}

function createSnowPile(count: number): SnowPile {
  const emoteSize = helpers.getCSSPixelValue(
    "--emote-size-standard",
    helpers.scaleRelativeToViewport(50)
  );
  const columnWidth = Math.max(emoteSize * 0.45, 18);
  const columnCount = Math.ceil(innerWidth / columnWidth) + 1;

  return {
    columnWidth,
    heights: new Array(columnCount).fill(0),
    emoteSize,
    maxHeight: innerHeight * 0.32,
    landed: [],
    remaining: count,
    melting: false,
  };
}

function createSnowflake(image: string, pile: SnowPile): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  // Random starting position across the screen width, slightly above viewport
  const startX = helpers.Randomizer(0, innerWidth);

  gsap.set(Div, {
    className: "falling-element",
    x: startX,
    y: helpers.Randomizer(-300, -100),
    z: helpers.Randomizer(-100, 100),
    backgroundImage: "url(" + image + ")",
    opacity: helpers.Randomizer(70, 100) / 100, // Slight opacity variation for depth
  });

  globalVars.warp.appendChild(Div);

  snowfall_animation(Div, pile);
}

function getColumnIndex(pile: SnowPile, x: number): number {
  const index = Math.floor(x / pile.columnWidth);
  return Math.max(0, Math.min(pile.heights.length - 1, index));
}

function getLandY(pile: SnowPile, x: number): number {
  const col = getColumnIndex(pile, x);
  const height = Math.min(pile.heights[col], pile.maxHeight);
  return innerHeight - pile.emoteSize * 0.85 - height;
}

function raisePile(pile: SnowPile, x: number): void {
  const col = getColumnIndex(pile, x);
  const stackStep = pile.emoteSize * helpers.Randomizer(0.22, 0.38);

  const addHeight = (index: number, amount: number) => {
    if (index < 0 || index >= pile.heights.length) {
      return;
    }
    pile.heights[index] = Math.min(pile.heights[index] + amount, pile.maxHeight);
  };

  // Bleed a little into neighbors so mounds look softer than strict columns
  addHeight(col, stackStep);
  addHeight(col - 1, stackStep * 0.4);
  addHeight(col + 1, stackStep * 0.4);
  addHeight(col - 2, stackStep * 0.15);
  addHeight(col + 2, stackStep * 0.15);
}

function settleSnowflake(element: HTMLElement, pile: SnowPile): void {
  if (element.dataset.settled === "1") {
    return;
  }
  element.dataset.settled = "1";

  gsap.killTweensOf(element);

  const x = gsap.getProperty(element, "x") as number;
  const landY = getLandY(pile, x);
  const settleX = x + helpers.Randomizer(-10, 10);

  gsap.set(element, {
    x: settleX,
    y: landY,
    rotationX: helpers.Randomizer(-8, 8),
    rotationY: helpers.Randomizer(-8, 8),
    rotationZ: helpers.Randomizer(-25, 25),
  });

  // Soft landing squash
  gsap.fromTo(
    element,
    { scaleX: 1.12, scaleY: 0.82 },
    {
      scaleX: 1,
      scaleY: 1,
      duration: 0.35,
      ease: "back.out(2)",
    }
  );

  raisePile(pile, settleX);
  pile.landed.push(element);
  pile.remaining--;

  if (pile.remaining <= 0) {
    scheduleMelt(pile);
  }
}

function scheduleMelt(pile: SnowPile): void {
  if (pile.melting) {
    return;
  }
  pile.melting = true;

  // Let the drift settle into a quiet snowbank before melting
  setTimeout(() => {
    meltSnow(pile);
  }, 2200);
}

function meltSnow(pile: SnowPile): void {
  pile.landed.forEach((element, index) => {
    const delay = helpers.Randomizer(0, 1.8) + index * 0.008;
    const sink = helpers.Randomizer(
      pile.emoteSize * 0.45,
      pile.emoteSize * 1.1
    );

    gsap.to(element, {
      y: `+=${sink}`,
      opacity: 0,
      scaleX: helpers.Randomizer(1.15, 1.45),
      scaleY: helpers.Randomizer(0.25, 0.45),
      duration: helpers.Randomizer(2.2, 4.2),
      delay,
      ease: "power1.in",
      onComplete: () => {
        helpers.removeelement(element.id);
      },
    });
  });
}

// Snow falling animation - slower, drifting, more floaty than rain
function snowfall_animation(element: HTMLElement, pile: SnowPile): void {
  // Slow, gentle descent - much slower than rain
  const fallDuration = helpers.Randomizer(10, 18);

  gsap.to(element, {
    y: innerHeight + 200,
    duration: fallDuration,
    ease: Linear.easeNone,
    onUpdate: function () {
      const y = gsap.getProperty(element, "y") as number;
      const x = gsap.getProperty(element, "x") as number;
      if (y >= getLandY(pile, x)) {
        this.kill();
        settleSnowflake(element, pile);
      }
    },
    onComplete: () => {
      // Safety settle if onUpdate never tripped (e.g. extreme drift)
      settleSnowflake(element, pile);
    },
  });

  // Gentle side-to-side drifting - the key snow characteristic
  const driftAmount = helpers.Randomizer(80, 180);
  const driftDuration = helpers.Randomizer(2, 4);

  gsap.to(element, driftDuration, {
    x: `+=${driftAmount}`,
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
  });

  // Secondary smaller drift for more organic feel
  gsap.to(element, helpers.Randomizer(1, 2), {
    x: `+=${helpers.Randomizer(20, 40)}`,
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
    delay: helpers.Randomizer(0, 1),
  });

  // Gentle slow rotation - snowflakes tumble slowly
  gsap.to(element, helpers.Randomizer(4, 10), {
    rotationZ: helpers.Randomizer(-180, 180),
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
  });

  // Very subtle 3D tumble for depth
  gsap.to(element, helpers.Randomizer(6, 12), {
    rotationX: helpers.Randomizer(-30, 30),
    rotationY: helpers.Randomizer(-30, 30),
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
    delay: helpers.Randomizer(0, 2),
  });

  // Subtle scale pulsing for "floating" feel
  gsap.to(element, helpers.Randomizer(2, 4), {
    scale: helpers.Randomizer(90, 110) / 100,
    repeat: -1,
    yoyo: true,
    ease: Sine.easeInOut,
  });
}
