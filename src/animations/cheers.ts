import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function cheers(images: string[]): void {
  createDrinkingAnimation(images);
}

function createDrinkingAnimation(images: string[]): void {
  if (images.length < 1) {
    console.error("No images provided for cheers animation");
    return;
  }

  // Create container for the animation
  const container = document.createElement("div");
  container.id = "cheers-container-" + globalVars.divnumber;
  globalVars.divnumber++;
  container.className = "cheers-container";

  // Create avatar elements
  const avatar1 = createAvatar(images[0], "left");
  const avatar2 = createAvatar(images[1] || images[0], "right");

  // Create beer mugs
  const beerMug1 = createBeerMug("left");
  const beerMug2 = createBeerMug("right");

  // Create a beer pour video in the middle (optional)
  const beerPour = createBeerPour();

  // Add all elements to container
  container.appendChild(avatar1);
  container.appendChild(avatar2);
  container.appendChild(beerMug1);
  container.appendChild(beerMug2);
  container.appendChild(beerPour);

  // Add container to the DOM
  document.body.appendChild(container);

  // Set container styles
  gsap.set(container, {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 1000,
  });

  // Start the animation sequence
  startCheersAnimation(
    avatar1,
    avatar2,
    beerMug1,
    beerMug2,
    beerPour,
    container
  );
}

function createAvatar(imageUrl: string, position: string): HTMLElement {
  const avatar = document.createElement("div");
  avatar.className = "cheers-avatar " + position;

  gsap.set(avatar, {
    position: "absolute",
    bottom: "10%",
    width: "150px",
    height: "150px",
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "50%",
    left: position === "left" ? "20%" : "auto",
    right: position === "right" ? "20%" : "auto",
    opacity: 0,
    scale: 0.7,
  });

  return avatar;
}

function createBeerMug(position: string): HTMLElement {
  const mug = document.createElement("div");
  mug.className = "beer-mug " + position;

  gsap.set(mug, {
    position: "absolute",
    width: "80px",
    height: "110px",
    bottom: position === "left" ? "23%" : "28%",
    left: position === "left" ? "28%" : "auto",
    right: position === "right" ? "28%" : "auto",
    backgroundImage: "url(https://i.imgur.com/LosbHO8.png)",
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    opacity: 0,
    scale: 0.7,
    transformOrigin: position === "left" ? "bottom right" : "bottom left",
  });

  return mug;
}

function createBeerPour(): HTMLElement {
  const pour = document.createElement("div");
  pour.className = "beer-pour";

  // Create a video element for the pour
  const video = document.createElement("video");
  video.style.width = "100%";
  video.style.height = "100%";
  video.style.objectFit = "cover";
  video.autoplay = false;
  video.loop = false;
  video.muted = true;
  video.src = "/assets/img/beerpourV2_VP9.webm";

  pour.appendChild(video);

  gsap.set(pour, {
    position: "absolute",
    width: "300px",
    height: "300px",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    opacity: 0,
  });

  return pour;
}

function startCheersAnimation(
  avatar1: HTMLElement,
  avatar2: HTMLElement,
  mug1: HTMLElement,
  mug2: HTMLElement,
  beerPour: HTMLElement,
  container: HTMLElement
): void {
  // Fade in avatars
  const tl = gsap.timeline();

  // Fade in avatars
  tl.to([avatar1, avatar2], {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: "back.out(1.7)",
  })

    // Fade in mugs
    .to([mug1, mug2], {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      stagger: 0.2,
      ease: "back.out(1.7)",
    })

    // Animate the beer pour in center
    .to(beerPour, {
      opacity: 1,
      duration: 0.5,
      onComplete: () => {
        // Start the video
        const video = beerPour.querySelector("video");
        if (video) video.play();
      },
    })

    // Start cheers motion
    .to(
      mug1,
      {
        rotation: 25,
        x: "+=40",
        y: "-=20",
        duration: 0.8,
        ease: "power1.inOut",
      },
      "cheers"
    )

    .to(
      mug2,
      {
        rotation: -25,
        x: "-=40",
        y: "-=20",
        duration: 0.8,
        ease: "power1.inOut",
      },
      "cheers"
    )

    // Clink!
    .to([mug1, mug2], {
      rotation: 0,
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "back.out(3)",
      onComplete: () => {
        // Add particle effect for the clink
        createClinkEffect(mug1, mug2);
      },
    })

    // Drinking motion
    .to(
      avatar1,
      {
        rotation: -20,
        duration: 0.7,
        ease: "power1.inOut",
      },
      "drink"
    )

    .to(
      mug1,
      {
        rotation: 45,
        y: "-=20",
        duration: 0.7,
        ease: "power1.inOut",
      },
      "drink"
    )

    .to(
      avatar2,
      {
        rotation: 20,
        duration: 0.7,
        ease: "power1.inOut",
      },
      "drink"
    )

    .to(
      mug2,
      {
        rotation: -45,
        y: "-=20",
        duration: 0.7,
        ease: "power1.inOut",
      },
      "drink"
    )

    // Return to normal position
    .to([avatar1, avatar2, mug1, mug2], {
      rotation: 0,
      y: 0,
      duration: 1,
      ease: "power1.inOut",
    })

    // Fade everything out
    .to([avatar1, avatar2, mug1, mug2, beerPour], {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        // Remove the container when done
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      },
    });
}

function createClinkEffect(mug1: HTMLElement, mug2: HTMLElement): void {
  // Calculate center point between the two mugs
  const mug1Rect = mug1.getBoundingClientRect();
  const mug2Rect = mug2.getBoundingClientRect();

  const centerX = (mug1Rect.right + mug2Rect.left) / 2;
  const centerY = (mug1Rect.top + mug2Rect.top) / 2;

  // Create particles
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    document.body.appendChild(particle);

    gsap.set(particle, {
      position: "absolute",
      width: "5px",
      height: "5px",
      backgroundColor: "rgba(255, 215, 0, 0.8)", // Gold color
      borderRadius: "50%",
      top: centerY,
      left: centerX,
      opacity: 1,
      zIndex: 1001,
    });

    // Animate particle outward in random direction
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    const duration = 0.5 + Math.random() * 1;

    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      duration: duration,
      ease: "power1.out",
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      },
    });
  }
}
