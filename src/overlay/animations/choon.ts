import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function choon(image) {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  Div.style.background = "url(" + image + ")";
  Div.style.backgroundSize = "100% 100%";
  Div.className = "choon-element"; // Add the class to the profile image

  // Create singing container to hold the profile
  var SingingContainer = document.createElement("div");
  SingingContainer.id = "singing-container-" + globalVars.divnumber.toString();
  SingingContainer.className = "singing-container";
  SingingContainer.appendChild(Div);

  // Randomise side to peep from
  var random = Math.floor(helpers.Randomizer(1, 2.99));
  let height = helpers.Randomizer(0, innerHeight - 400);
  let times = 8; // Increased number of notes
  let Notes = [];

  switch (random) {
    case 1:
      // left
      gsap.set(SingingContainer, {
        x: -400,
        y: height,
        z: 100,
        transformOrigin: "center",
      });

      for (var i = 0; i < times; i++) {
        // Alternate between music note types for variety
        let noteImg = i % 2 === 0 ? "img/music1.png" : "img/music2.png";
        Notes[i] = createNote(noteImg);

        // More varied positioning of notes
        gsap.set(Notes[i], {
          className: "note-element",
          x: helpers.Randomizer(-50, 250),
          y: height + helpers.Randomizer(-200, 200),
          z: 10,
          opacity: 0,
          scale: 0.01,
          rotation: helpers.Randomizer(-30, 30),
        });

        // Stagger the note animations for a more rhythmic feel
        note_animation(Notes[i], i * 0.7);
      }

      choon_animation_left(SingingContainer);
      break;

    case 2:
      // right
      gsap.set(SingingContainer, {
        x: innerWidth + 400,
        y: height,
        z: 0,
        transformOrigin: "center",
      });

      for (var i = 0; i < times; i++) {
        // Alternate between music note types for variety
        let noteImg = i % 2 === 0 ? "img/music1.png" : "img/music2.png";
        Notes[i] = createNote(noteImg);

        // More varied positioning of notes
        gsap.set(Notes[i], {
          className: "note-element",
          x: helpers.Randomizer(innerWidth - 100, innerWidth - 350),
          y: height + helpers.Randomizer(-200, 200),
          z: 10,
          opacity: 0,
          scale: 0.01,
          rotation: helpers.Randomizer(-30, 30),
        });

        // Stagger the note animations for a more rhythmic feel
        note_animation(Notes[i], i * 0.7);
      }

      choon_animation_right(SingingContainer);
      break;
  }

  globalVars.warp.appendChild(SingingContainer);

  // Add mouth animation to simulate singing
  animate_singing(Div);

  setTimeout(() => {
    helpers.removeelement(SingingContainer.id);
  }, 15000);
}

function createNote(image) {
  var MNoteDiv = document.createElement("div");
  MNoteDiv.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  MNoteDiv.style.background = "url(" + image + ")";
  MNoteDiv.style.backgroundSize = "100% 100%";

  globalVars.warp.appendChild(MNoteDiv);
  setTimeout(() => {
    helpers.removeelement(MNoteDiv.id);
  }, 15000);

  return MNoteDiv;
}

function animate_singing(element) {
  // Create a rhythmic pulsing effect to simulate singing
  const timeline = gsap.timeline({ repeat: 8, repeatDelay: 0.1 });

  // Simulate mouth opening/closing with scale changes
  timeline
    .to(element, {
      duration: 0.2,
      scaleY: 0.9,
      scaleX: 1.1,
      ease: "power1.out",
    })
    .to(element, {
      duration: 0.2,
      scaleY: 1,
      scaleX: 1,
      ease: "power1.in",
    })
    .to(element, {
      duration: 0.3,
      scaleY: 0.85,
      scaleX: 1.15,
      ease: "power1.out",
    })
    .to(element, {
      duration: 0.3,
      scaleY: 1,
      scaleX: 1,
      ease: "power1.in",
    });

  // Add a subtle brightness filter pulse to enhance the singing effect
  gsap.to(element, {
    duration: 0.5,
    filter: "brightness(1.3)",
    repeat: 16,
    yoyo: true,
    ease: "sine.inOut",
  });
}

function note_animation(element, delay = 0) {
  // Reduce the minimum starting delay from 1 to 0.3
  // This will make notes start appearing much sooner
  let randomDelay = helpers.Randomizer(0.3, 1.5) + delay;
  let randomDuration = helpers.Randomizer(3, 6);
  let verticalTravel = helpers.Randomizer(100, 300);

  // Create a more dynamic note animation
  // Fade in
  gsap.to(element, {
    opacity: 1,
    scale: helpers.Randomizer(0.8, 1.2),
    ease: "power2.out",
    delay: randomDelay,
    duration: 1,
  });

  // Floating movement pattern - more natural
  gsap.to(element, {
    y: "-=" + verticalTravel,
    x: "+=" + helpers.Randomizer(-50, 50),
    rotation: helpers.Randomizer(-180, 180),
    duration: randomDuration,
    delay: randomDelay,
    ease: "power1.out",
  });

  // Color variation
  gsap.to(element, {
    duration: randomDuration,
    delay: randomDelay,
    ease: "none",
    "--hue-rotate": helpers.Randomizer(180, 360),
    onUpdate: () => {
      element.style.filter = `invert(44%) sepia(61%) saturate(1001%) brightness(99%) contrast(101%) hue-rotate(${gsap.getProperty(
        element,
        "--hue-rotate"
      )}deg)`;
    },
  });

  // Fade out with a little spin
  gsap.to(element, {
    duration: 1.5,
    delay: randomDelay + randomDuration - 1,
    ease: "power2.out",
    scale: 0.5,
    opacity: 0,
    rotation: "+=" + helpers.Randomizer(90, 180),
    onComplete: () => {
      element.style.display = "none";
    },
  });
}

function choon_animation_left(element) {
  // Entrance animation
  gsap.to(element, {
    duration: 1.5,
    x: "+=450",
    ease: "back.out(1.2)",
  });

  // More natural head-bobbing with varying intensity
  const bobbingTimeline = gsap.timeline({ repeat: 8, repeatDelay: 0.1 });

  bobbingTimeline
    .to(element, {
      duration: 0.3,
      y: "-=30",
      rotation: helpers.Randomizer(-5, 5),
      ease: "sine.inOut",
    })
    .to(element, {
      duration: 0.3,
      y: "+=30",
      rotation: 0,
      ease: "sine.inOut",
    })
    .to(element, {
      duration: 0.2,
      y: "-=15",
      rotation: helpers.Randomizer(-3, 3),
      ease: "sine.inOut",
    })
    .to(element, {
      duration: 0.2,
      y: "+=15",
      rotation: 0,
      ease: "sine.inOut",
    });

  // Add enthusiastic sideways movement
  gsap.to(element, {
    x: "+=30",
    duration: 0.8,
    repeat: 5,
    yoyo: true,
    ease: "sine.inOut",
    delay: 2,
  });

  // Exit animation - mirror the entrance animation in reverse
  gsap
    .to(element, {
      duration: 1.5,
      delay: helpers.Randomizer(9, 11),
      ease: "back.in(1.2)",
      x: "-=450", // Mirror the entrance animation distance
      rotation: 0, // Return to neutral rotation
      scale: 1, // Keep normal scale until the very end
      opacity: 1,
    })
    .then(() => {
      // Quick fade out at the end of movement
      gsap.to(element, {
        duration: 0.3,
        opacity: 0,
        scale: 0.8,
        onComplete: () => {
          element.style.display = "none";
        },
      });
    });
}

function choon_animation_right(element) {
  // Entrance animation
  gsap.to(element, {
    duration: 1.5,
    x: "-=650",
    ease: "back.out(1.2)",
  });

  // More natural head-bobbing with varying intensity
  const bobbingTimeline = gsap.timeline({ repeat: 8, repeatDelay: 0.1 });

  bobbingTimeline
    .to(element, {
      duration: 0.3,
      y: "-=30",
      rotation: helpers.Randomizer(-5, 5),
      ease: "sine.inOut",
    })
    .to(element, {
      duration: 0.3,
      y: "+=30",
      rotation: 0,
      ease: "sine.inOut",
    })
    .to(element, {
      duration: 0.2,
      y: "-=15",
      rotation: helpers.Randomizer(-3, 3),
      ease: "sine.inOut",
    })
    .to(element, {
      duration: 0.2,
      y: "+=15",
      rotation: 0,
      ease: "sine.inOut",
    });

  // Add enthusiastic sideways movement
  gsap.to(element, {
    x: "-=30",
    duration: 0.8,
    repeat: 5,
    yoyo: true,
    ease: "sine.inOut",
    delay: 2,
  });

  // Exit animation - mirror the entrance animation in reverse
  gsap
    .to(element, {
      duration: 1.5,
      delay: helpers.Randomizer(9, 11),
      ease: "back.in(1.2)",
      x: "+=650", // Mirror the entrance animation distance
      rotation: 0, // Return to neutral rotation
      scale: 1, // Keep normal scale until the very end
      opacity: 1,
    })
    .then(() => {
      // Quick fade out at the end of movement
      gsap.to(element, {
        duration: 0.3,
        opacity: 0,
        scale: 0.8,
        onComplete: () => {
          element.style.display = "none";
        },
      });
    });
}
