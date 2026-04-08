import { globalVars } from "../config";
import helpers from "../helpers";
import { gsap } from "gsap";
import OverlaySettings from "../settings";
import type { CheersPosition } from "@/shared/types";

/*
Large Beer image fade in
Drops sender and target (or me) into the beer.
Floats/bounces around then all fade out
*/

export function cheers(images: string[]): void {
  for (const centerX of getCheersCenters()) {
    createCheersInstance(images, centerX);
  }
}

function getCheersCenters(): number[] {
  const cheersSettings = OverlaySettings.settings.features.cheers;
  const leftFifth = innerWidth / 5;
  const rightFifth = (innerWidth * 4) / 5;

  if (cheersSettings.quantity === 2) {
    return [leftFifth, rightFifth];
  }

  return [getCenterXForPosition(cheersSettings.position)];
}

function getCenterXForPosition(position: CheersPosition): number {
  switch (position) {
    case "left":
      return innerWidth / 5;
    case "right":
      return (innerWidth * 4) / 5;
    case "center":
    default:
      return innerWidth / 2;
  }
}

function createCheersInstance(images: string[], centerX: number): void {
  const imgcount = images.length;
  const interval = 250;
  const centerVariance = helpers.scaleRelativeToWidth(50);
  const avatarSpacing = helpers.scaleRelativeToWidth(175);
  const basewidth = helpers.Randomizer(
    centerX - centerVariance,
    centerX + centerVariance
  );
  const xPos = [basewidth, basewidth - avatarSpacing];
  const drop = [
    innerHeight - helpers.scaleRelativeToHeight(500),
    innerHeight - helpers.scaleRelativeToHeight(600),
  ];

  for (let j = 0; j < images.length; j++) {
    const imagenum = j % imgcount;
    setTimeout(() => {
      createAvatarDivs(images[imagenum], xPos[imagenum], drop[imagenum]);
    }, j * interval);
  }

  const BeerDiv = document.createElement("div");
  BeerDiv.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  BeerDiv.style.backgroundSize = "100% 100%";
  gsap.set(BeerDiv, {
    className: "beer-glass",
    x: centerX,
    y: 0,
    z: 0,
    opacity: 0,
    transformOrigin: "center",
    xPercent: -50,
  });

  globalVars.warp.appendChild(BeerDiv);

  beer_animation(BeerDiv);

  const video: HTMLVideoElement = document.createElement("video");
  video.src = "img/beerpourV2_VP9.webm";
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.controls = false;

  video.style.width = "100%";
  video.style.height = "100%";

  BeerDiv.appendChild(video);

  setTimeout(() => {
    helpers.removeelement(BeerDiv.id);
  }, 15000);
}

function createAvatarDivs(image: string, xPos: number, drop: number): void {
  const Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  Div.style.background = "url(" + image + ")";
  Div.style.backgroundSize = "100% 100%";

  gsap.set(Div, {
    className: "beer-avatar",
    x: xPos,
    y: -helpers.scaleRelativeToHeight(250),
    z: 10,
    scale: 0.8,
    transformOrigin: "50% 50%",
  });

  globalVars.warp.appendChild(Div);

  drop_animation(Div, drop);

  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 15000);
}

function drop_animation(element: HTMLElement, drop: number): void {
  const largeBobble = helpers.scaleRelativeToHeight(175);
  const mediumBobble = helpers.scaleRelativeToHeight(125);
  const smallBobble = helpers.scaleRelativeToHeight(100);

  gsap.to(element, {
    rotation: helpers.Randomizer(-15, 15),
    delay: 1,
    duration: 4,
    ease: "sine.inOut",
  });

  gsap.to(element, {
    duration: 1.5, // Duration of the fall
    delay: 3,
    y: drop, // Fall to 75% of the container's height
    ease: "power1.out", // Easing function (you can choose a different one)
    onComplete: () => {
      // Callback when the drop reaches the bottom
      gsap.to(element, {
        duration: 1.45, // Duration of the bobble
        y: drop - largeBobble,
        yoyo: true, // Yoyo effect for bouncing
        repeat: 1, // Repeat indefinitely
        ease: "sine.inOut", // Easing function for the bobble
        onComplete: () => {
          gsap.to(element, {
            duration: 1.55, // Duration of the bobble
            y: drop - mediumBobble,
            yoyo: true, // Yoyo effect for bouncing
            repeat: 1, // Repeat indefinitely
            ease: "sine.inOut", // Easing function for the bobble
            onComplete: () => {
              fadeout(element);
              gsap.to(element, {
                duration: 1.65, // Duration of the bobble
                y: drop - smallBobble,
                yoyo: true, // Yoyo effect for bouncing
                repeat: 1, // Repeat indefinitely
                ease: "sine.inOut", // Easing function for the bobble
              });
            },
          });
        },
      });
    },
  });
}

function fadeout(element: HTMLElement): void {
  gsap.to(element, {
    duration: 4, // Duration of the bobble
    opacity: 0,
    yoyo: false, // Yoyo effect for bouncing
    repeat: 0, // Repeat indefinitely
    ease: "sine.inOut", // Easing function for the bobble
  });
}

function beer_animation(element: HTMLElement): void {
  gsap.to(element, { opacity: 1, duration: 2, delay: 0 });
  gsap.to(element, { opacity: 0, duration: 2, delay: 13 });
}
