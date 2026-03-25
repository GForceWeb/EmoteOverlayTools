import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function explode(
  images: string[],
  count: number = 100,
  interval: number = 10
): void {
  const horizontalInset = helpers.scaleRelativeToWidth(200);
  const verticalInset = helpers.scaleRelativeToHeight(200);
  let explodeX = helpers.Randomizer(horizontalInset, innerWidth - horizontalInset);
  let explodeY = helpers.Randomizer(verticalInset, innerHeight - verticalInset);

  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amongst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createEmoteExplode(images[imagenum], explodeX, explodeY);
    }, j * interval);
  }
}

function createEmoteExplode(
  image: string,
  explodeX: number,
  explodeY: number
): void {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  // Slight origin jitter so emotes don't all spawn from the exact same pixel
  const jitter = helpers.scaleRelativeToViewport(20);
  const originX = explodeX + helpers.Randomizer(-jitter, jitter);
  const originY = explodeY + helpers.Randomizer(-jitter, jitter);

  const baseScale = helpers.Randomizer(0.55, 1.15);

  gsap.set(Div, {
    className: "explosion-element",
    x: originX,
    y: originY,
    z: helpers.Randomizer(-200, 200),
    backgroundImage: "url(" + image + ")",
    scale: baseScale * 0.3,
    rotation: helpers.Randomizer(-45, 45),
    opacity: 0,
  });

  globalVars.warp.appendChild(Div);

  explosion_animation(Div, originX, originY, baseScale);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

// Explosion Animation — uses independent axis tweens to create natural
// parabolic arcs: X decelerates (air drag) while Y accelerates (gravity).
function explosion_animation(
  element: HTMLElement,
  originX: number,
  originY: number,
  baseScale: number
): void {
  const angle = Math.random() * Math.PI * 2;
  const spinDir = helpers.randomSign();

  // Varied burst power — creates shells of debris at different distances
  const power = 0.25 + Math.pow(Math.random(), 0.7) * 0.75;
  const maxReach = Math.min(innerWidth, innerHeight) * 0.6;

  // Horizontal: launch velocity decelerates due to air drag
  const velocityX = Math.cos(angle) * maxReach * power;
  // Vertical: initial upward kick, then gravity takes over
  const launchVelocityY = Math.sin(angle) * maxReach * power;
  const gravity = innerHeight * helpers.Randomizer(0.3, 0.7);

  // Duration scales with power — weaker bursts settle faster
  const duration = helpers.Randomizer(2.0, 3.5) * (0.6 + power * 0.4);

  // Initial flash: instant scale-up and opacity pop
  gsap.to(element, {
    duration: 0.1,
    opacity: 1,
    scale: baseScale * helpers.Randomizer(1.1, 1.35),
    ease: "power2.out",
  });

  // X axis: strong initial velocity, heavy deceleration (debris dragging through air)
  gsap.to(element, {
    duration: duration,
    x: originX + velocityX,
    ease: "power3.out",
  });

  // Y axis: initial burst direction, then gravity pulls down.
  // Two-phase — brief upward/outward kick, then accelerating fall.
  const kickDuration = duration * helpers.Randomizer(0.15, 0.3);
  const fallDuration = duration - kickDuration;

  gsap.to(element, {
    duration: kickDuration,
    y: originY + launchVelocityY * 0.3,
    ease: "power2.out",
    onComplete: () => {
      gsap.to(element, {
        duration: fallDuration,
        y: originY + launchVelocityY * 0.5 + gravity,
        ease: "power2.in",
      });
    },
  });

  // Tumble: fast initial spin that decelerates like real debris
  const spinAmount = helpers.Randomizer(270, 900) * spinDir;
  gsap.to(element, {
    duration: duration,
    rotation: `+=${spinAmount}`,
    ease: "power2.out",
  });

  // Scale: shrink as debris flies outward and loses energy
  gsap.to(element, {
    duration: duration * 0.7,
    delay: 0.1,
    scale: baseScale * helpers.Randomizer(0.4, 0.75),
    ease: "power1.out",
  });

  // Fade out in the final stretch
  gsap.to(element, {
    duration: duration * 0.35,
    delay: duration * 0.65,
    opacity: 0,
    ease: "power1.in",
  });
}
