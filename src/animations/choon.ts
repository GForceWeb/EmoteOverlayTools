import Variables from "../config.ts";
import { GlobalVars, GlobalConst } from "../types";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function choon(images: string[]): void {
  if (images.length < 1) {
    console.error("No images provided for avatar choon animation");
    return;
  }

  // Create container for the animation
  const container = document.createElement("div");
  container.id = "choon-container-" + globalVars.divnumber;
  globalVars.divnumber++;
  container.className = "choon-container";

  // Create avatar element
  const avatar = createAvatarElement(images[0]);

  // Create music notes
  const musicNotes: HTMLElement[] = [];
  for (let i = 0; i < 10; i++) {
    const note = createMusicNote();
    musicNotes.push(note);
    container.appendChild(note);
  }

  // Add avatar to container
  container.appendChild(avatar);

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
  startChoonAnimation(avatar, musicNotes, container);
}

function createAvatarElement(imageUrl: string): HTMLElement {
  const avatar = document.createElement("div");
  avatar.className = "choon-avatar";

  gsap.set(avatar, {
    position: "absolute",
    bottom: "20%",
    left: "50%",
    width: "200px",
    height: "200px",
    xPercent: -50,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "50%",
    opacity: 0,
    scale: 0.7,
  });

  return avatar;
}

function createMusicNote(): HTMLElement {
  const note = document.createElement("div");
  note.className = "music-note";

  // Randomly choose which music note image to use
  const noteType = Math.random() < 0.5 ? "music1.png" : "music2.png";

  gsap.set(note, {
    position: "absolute",
    width: "40px",
    height: "40px",
    backgroundImage: `url(/assets/img/${noteType})`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    opacity: 0,
    scale: 0.5,
  });

  return note;
}

function startChoonAnimation(
  avatar: HTMLElement,
  musicNotes: HTMLElement[],
  container: HTMLElement
): void {
  const tl = gsap.timeline();

  // Fade in avatar with bounce
  tl.to(avatar, {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: "back.out(1.7)",
  });

  // Start head bobbing animation
  gsap.to(avatar, {
    rotate: 5,
    duration: 0.3,
    repeat: 20,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Animate each music note
  musicNotes.forEach((note, index) => {
    const delay = index * 0.4; // Stagger the notes
    animateMusicNote(note, avatar, delay);
  });

  // After all animations, fade everything out
  setTimeout(() => {
    gsap.to([avatar, ...musicNotes], {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        // Remove the container when done
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      },
    });
  }, 8000); // Adjust timing as needed
}

function animateMusicNote(
  note: HTMLElement,
  avatar: HTMLElement,
  delay: number
): void {
  const avatarRect = avatar.getBoundingClientRect();
  const startX = avatarRect.x + avatarRect.width / 2;
  const startY = avatarRect.y + avatarRect.height / 4;

  // Position the note near the avatar's head
  gsap.set(note, {
    x: startX,
    y: startY,
    rotation: Math.random() * 360,
  });

  // Random path for the note to follow
  const pathX =
    startX + (Math.random() < 0.5 ? -1 : 1) * (50 + Math.random() * 100);
  const pathY = startY - 100 - Math.random() * 150;

  // Animate the note
  gsap
    .timeline({ delay })
    .to(note, {
      opacity: 1,
      scale: 0.7 + Math.random() * 0.5,
      duration: 0.3,
    })
    .to(note, {
      x: pathX,
      y: pathY,
      rotation: Math.random() * 360,
      scale: 0.3,
      opacity: 0,
      duration: 2.5,
      ease: "power1.out",
    });
}
