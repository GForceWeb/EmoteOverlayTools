import { globalVars } from "../config";
import helpers from "../helpers";
import { gsap } from "gsap";

/*
Large Beer image fade in
Drops sender and target (or me) into the beer.
Floats/bounces around then all fade out
*/

export function cheers(images: string[]): void {
  let imgcount = images.length;
  let interval = 250;
  let basewidth = helpers.Randomizer(innerWidth / 2 - 50, innerWidth / 2 + 50);
  let xPos = [basewidth, basewidth - 175];
  let drop = [innerHeight - 500, innerHeight - 600];

  for (let j = 0; j < images.length; j++) {
    // split the count amongst the images
    let imagenum = j % imgcount;
    setTimeout(() => {
      createAvatarDivs(images[imagenum], xPos[imagenum], drop[imagenum]);
    }, j * interval);
  }

  const BeerDiv = document.createElement("div");
  BeerDiv.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  //BeerDiv.style.background = 'url(' + 'img/beer.jpg' + ')';
  BeerDiv.style.backgroundSize = "100% 100%";
  gsap.set(BeerDiv, {
    className: "beer-glass",
    x: innerWidth / 2,
    y: 0,
    z: 0,
    opacity: 0,
    transformOrigin: "center",
    xPercent: -50,
  });

  globalVars.warp.appendChild(BeerDiv);

  beer_animation(BeerDiv);

  const video: HTMLVideoElement = document.createElement("video");
  video.src = "img/beerpourV2_VP9.webm"; // Replace with your video URL
  video.autoplay = true;
  video.muted = true; // Autoplay requires muted for some browsers
  video.loop = true;
  video.controls = false;

  video.style.width = "100%";
  video.style.height = "100%";

  BeerDiv.appendChild(video);

  // Run animation
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
    y: -250,
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
        y: drop - 175, // Bobble up to 60% of the container's height
        yoyo: true, // Yoyo effect for bouncing
        repeat: 1, // Repeat indefinitely
        ease: "sine.inOut", // Easing function for the bobble
        onComplete: () => {
          gsap.to(element, {
            duration: 1.55, // Duration of the bobble
            y: drop - 125, // Bobble up to 60% of the container's height
            yoyo: true, // Yoyo effect for bouncing
            repeat: 1, // Repeat indefinitely
            ease: "sine.inOut", // Easing function for the bobble
            onComplete: () => {
              fadeout(element);
              gsap.to(element, {
                duration: 1.65, // Duration of the bobble
                y: drop - 100, // Bobble up to 60% of the container's height
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
