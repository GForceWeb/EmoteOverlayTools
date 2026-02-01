import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

// Buffer time for entry and exit segments (seconds each)
const ENTRY_EXIT_BUFFER = 2;

type Edge = "left" | "right" | "top";

interface Waypoint {
  x: number;
  y: number;
}

/**
 * UFO Animation - A UFO flies across the screen dropping emotes
 * @param images Array of emote URLs to drop
 * @param count Number of emotes to drop during the flight
 * @param interval Milliseconds between each emote drop
 */
export function ufo(
  images: string[],
  count: number = 30,
  interval: number = 200
): void {
  createUFOFlight(images, count, interval);
}

/**
 * Create and animate the UFO with emote dropping
 */
function createUFOFlight(
  images: string[],
  count: number,
  interval: number
): void {
  const imgCount = images.length;
  let emotesDropped = 0;
  let dropInterval: ReturnType<typeof setInterval> | null = null;

  // UFO dimensions
  const ufoWidth = 120;
  const ufoHeight = 60;

  // Create the UFO container
  const ufoContainer = document.createElement("div");
  ufoContainer.id = `ufo-${globalVars.divnumber}`;
  globalVars.divnumber++;

  gsap.set(ufoContainer, {
    className: "ufo-ship",
    width: ufoWidth,
    height: ufoHeight + 30, // Extra space for dome
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1000,
  });

  // Build the UFO body (metallic ellipse)
  const ufoBody = document.createElement("div");
  gsap.set(ufoBody, {
    width: ufoWidth,
    height: ufoHeight * 0.5,
    borderRadius: "50%",
    background: "radial-gradient(ellipse at 30% 30%, #e8e8e8, #a0a0a0 40%, #606060 70%, #404040)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.4), inset 0 -3px 10px rgba(0,0,0,0.3), inset 0 3px 10px rgba(255,255,255,0.3)",
    position: "absolute",
    top: 25,
    left: 0,
  });

  // Build the glass dome
  const ufoDome = document.createElement("div");
  gsap.set(ufoDome, {
    width: ufoWidth * 0.4,
    height: ufoHeight * 0.5,
    borderRadius: "50% 50% 40% 40%",
    background: "radial-gradient(ellipse at 50% 70%, rgba(100, 255, 200, 0.7), rgba(0, 180, 130, 0.4) 60%, rgba(0, 100, 80, 0.3))",
    boxShadow: "0 0 15px rgba(0, 255, 180, 0.5), inset 0 -5px 15px rgba(0, 255, 180, 0.3)",
    position: "absolute",
    top: 5,
    left: (ufoWidth - ufoWidth * 0.4) / 2,
  });

  // Build the lights container
  const lightsContainer = document.createElement("div");
  gsap.set(lightsContainer, {
    width: ufoWidth * 0.8,
    height: 10,
    position: "absolute",
    top: 45,
    left: ufoWidth * 0.1,
    display: "flex",
    justifyContent: "space-around",
  });

  // Create 5 pulsing lights
  const lightColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];
  for (let i = 0; i < 5; i++) {
    const light = document.createElement("div");
    gsap.set(light, {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: lightColors[i],
      boxShadow: `0 0 10px ${lightColors[i]}, 0 0 20px ${lightColors[i]}`,
    });
    lightsContainer.appendChild(light);

    // Animate lights pulsing
    gsap.to(light, {
      opacity: 0.3,
      duration: 0.3 + i * 0.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  // Build the tractor beam (subtle glow beneath)
  const tractorBeam = document.createElement("div");
  gsap.set(tractorBeam, {
    width: ufoWidth * 0.5,
    height: 80,
    position: "absolute",
    top: 50,
    left: (ufoWidth - ufoWidth * 0.5) / 2,
    background: "linear-gradient(to bottom, rgba(0, 255, 180, 0.4), rgba(0, 255, 180, 0) 100%)",
    clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
    opacity: 0.6,
  });

  // Animate tractor beam pulsing
  gsap.to(tractorBeam, {
    opacity: 0.2,
    scaleX: 0.8,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Assemble UFO
  ufoContainer.appendChild(tractorBeam);
  ufoContainer.appendChild(ufoBody);
  ufoContainer.appendChild(ufoDome);
  ufoContainer.appendChild(lightsContainer);

  // Generate flight path
  const { startPos, endPos, waypoints } = generateFlightPath(ufoWidth, ufoHeight);

  // Set initial position
  gsap.set(ufoContainer, {
    x: startPos.x,
    y: startPos.y,
  });

  globalVars.warp.appendChild(ufoContainer);

  // Calculate dynamic flight duration based on count and interval
  // Total dropping time (in seconds) + buffer for entry and exit
  // Add a small buffer to ensure all emotes finish spawning before exit begins
  const emoteSpawnBuffer = 0.5; // Extra time after last emote spawns
  const droppingDuration = ((count * interval) / 1000) + emoteSpawnBuffer;
  const totalFlightDuration = droppingDuration + (ENTRY_EXIT_BUFFER * 2);

  // Calculate time per segment: entry + waypoints + exit
  // Entry and exit get fixed buffer time, waypoints share the dropping duration evenly
  const waypointCount = waypoints.length;
  // We animate through (waypointCount - 1) segments since first waypoint is entry target
  // Use max of 1 to avoid division by zero
  const segmentCount = Math.max(waypointCount - 1, 1);
  const timePerWaypoint = droppingDuration / segmentCount;

  // Create the flight animation timeline
  const flightTimeline = gsap.timeline({
    onComplete: () => {
      // Stop dropping emotes
      if (dropInterval) {
        clearInterval(dropInterval);
      }
      // Remove UFO element after it has exited
      helpers.removeelement(ufoContainer.id);
    },
  });

  // Entry animation: from start position to first waypoint (or mid-screen if no waypoints)
  const firstTarget = waypoints.length > 0 ? waypoints[0] : {
    x: window.innerWidth / 2 - ufoWidth / 2,
    y: window.innerHeight * 0.3,
  };
  flightTimeline.to(ufoContainer, {
    x: firstTarget.x,
    y: firstTarget.y,
    duration: ENTRY_EXIT_BUFFER,
    ease: "sine.out",
  });

  // Animate through all waypoints with consistent timing (no pauses)
  for (let i = 1; i < waypoints.length; i++) {
    flightTimeline.to(ufoContainer, {
      x: waypoints[i].x,
      y: waypoints[i].y,
      duration: timePerWaypoint,
      ease: "sine.inOut",
    });
  }

  // Exit animation: fly off-screen to the end position
  flightTimeline.to(ufoContainer, {
    x: endPos.x,
    y: endPos.y,
    duration: ENTRY_EXIT_BUFFER,
    ease: "sine.in",
  });

  // Add slight rotation during movement (doesn't affect position)
  gsap.to(ufoContainer, {
    rotation: 5,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Delay emote dropping until after entry animation completes
  setTimeout(() => {
    // Start dropping emotes at the specified interval
    dropInterval = setInterval(() => {
      if (emotesDropped >= count) {
        if (dropInterval) {
          clearInterval(dropInterval);
        }
        return;
      }

      // Drop an emote from the UFO's center-bottom position
      const imageIndex = emotesDropped % imgCount;
      dropEmote(images[imageIndex], ufoContainer, ufoWidth);
      emotesDropped++;
    }, interval);
  }, ENTRY_EXIT_BUFFER * 1000); // Wait for entry animation to complete
}

/**
 * Generate a randomized flight path for the UFO
 */
function generateFlightPath(
  ufoWidth: number,
  ufoHeight: number
): { startPos: Waypoint; endPos: Waypoint; waypoints: Waypoint[] } {
  const edges: Edge[] = ["left", "right", "top"];
  const margin = 50;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Pick random start edge
  const startEdge = edges[Math.floor(Math.random() * edges.length)];
  
  // Pick random end edge (different from start)
  const availableEndEdges = edges.filter((e) => e !== startEdge);
  const endEdge = availableEndEdges[Math.floor(Math.random() * availableEndEdges.length)];

  // Calculate start position based on edge
  const startPos = getEdgePosition(startEdge, viewportWidth, viewportHeight, ufoWidth, ufoHeight, margin, true);
  
  // Calculate end position based on edge
  const endPos = getEdgePosition(endEdge, viewportWidth, viewportHeight, ufoWidth, ufoHeight, margin, false);

  // Generate 3-7 random waypoints within the viewport
  const waypointCount = helpers.Randomizer(3, 7);
  const waypoints: Waypoint[] = [];

  for (let i = 0; i < waypointCount; i++) {
    waypoints.push({
      x: helpers.Randomizer(margin, viewportWidth - ufoWidth - margin),
      y: helpers.Randomizer(margin, viewportHeight * 0.55), // Keep UFO in upper 55% mostly
    });
  }

  return { startPos, endPos, waypoints };
}

/**
 * Get a position on the specified edge
 */
function getEdgePosition(
  edge: Edge,
  viewportWidth: number,
  viewportHeight: number,
  ufoWidth: number,
  ufoHeight: number,
  margin: number,
  isStart: boolean
): Waypoint {
  const offset = isStart ? -ufoWidth - 20 : -ufoWidth - 20; // Off-screen offset

  switch (edge) {
    case "left":
      return {
        x: isStart ? -ufoWidth - 20 : -ufoWidth - 20,
        y: helpers.Randomizer(margin, viewportHeight * 0.5),
      };
    case "right":
      return {
        x: isStart ? viewportWidth + 20 : viewportWidth + 20,
        y: helpers.Randomizer(margin, viewportHeight * 0.5),
      };
    case "top":
      return {
        x: helpers.Randomizer(margin, viewportWidth - ufoWidth - margin),
        y: isStart ? -ufoHeight - 20 : -ufoHeight - 20,
      };
  }
}

/**
 * Drop an emote from the UFO that falls to the ground
 * Emote tracks UFO during fade-in with portal effect, then falls once fully visible
 */
function dropEmote(image: string, ufoContainer: HTMLElement, ufoWidth: number): void {
  const emote = document.createElement("div");
  emote.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  // Random horizontal drift for falling
  const drift = helpers.Randomizer(-100, 100);
  
  // Random rotation for falling
  const rotation = helpers.Randomizer(-360, 360);

  // Get emote size from CSS variable (fallback to 50px)
  const root = document.documentElement;
  const cssSize = getComputedStyle(root).getPropertyValue("--emote-size-standard");
  const emoteSize = parseInt(cssSize || "50", 10) || 50;
  const halfEmoteSize = emoteSize / 2;

  // Get initial UFO position - center emote under the tractor beam
  const initialRect = ufoContainer.getBoundingClientRect();
  const initialX = initialRect.left + ufoWidth / 2 - halfEmoteSize;
  const initialY = initialRect.top + 50; // Position at tractor beam origin

  gsap.set(emote, {
    className: "ufo-dropped-emote",
    x: initialX,
    y: initialY,
    backgroundImage: `url(${image})`,
    opacity: 0,
    scale: 0,
    transformOrigin: "top center", // Scale from top center for portal effect
  });

  globalVars.warp.appendChild(emote);

  // Track UFO position during fade-in (X only - Y is animated for portal effect)
  const fadeInDuration = 0.4;
  let trackingActive = true;
  
  // Track the base Y position (without portal animation offset)
  let baseY = initialY;
  
  // Use GSAP ticker to update X position while tracking UFO horizontally
  const trackUFO = () => {
    if (!trackingActive) return;
    const rect = ufoContainer.getBoundingClientRect();
    const newX = rect.left + ufoWidth / 2 - halfEmoteSize;
    baseY = rect.top + 50; // Update base Y for when portal animation completes
    gsap.set(emote, {
      x: newX,
    });
  };
  
  gsap.ticker.add(trackUFO);

  // Portal zoom-in effect: scale from 0 at top center
  // Animate Y separately so it doesn't conflict with X tracking
  const portalDropDistance = emoteSize * 0.8;
  
  gsap.to(emote, {
    opacity: 1,
    scale: 1,
    duration: fadeInDuration,
    ease: "back.out(1.5)",
  });
  
  // Animate Y position for the portal drop effect
  gsap.fromTo(emote, 
    { y: initialY },
    {
      y: initialY + portalDropDistance,
      duration: fadeInDuration,
      ease: "back.out(1.5)",
      onUpdate: () => {
        // Keep Y animation in sync with tracked base position
        if (trackingActive) {
          const progress = gsap.getProperty(emote, "y") as number - initialY;
          gsap.set(emote, { y: baseY + progress });
        }
      },
      onComplete: () => {
        // Stop tracking UFO
        trackingActive = false;
        gsap.ticker.remove(trackUFO);
        
        // Get the actual rendered position from the DOM
        const finalRect = emote.getBoundingClientRect();
        const currentX = finalRect.left;
        const currentY = finalRect.top;
        
        // Animate the emote falling from its current visual position
        const fallDuration = helpers.Randomizer(3, 6);

        // Fall to the ground with drift
        // Use sine.in for a more immediate start to the fall (less gradual ramp-up)
        gsap.to(emote, {
          y: window.innerHeight + 100,
          x: currentX + drift,
          rotation: rotation,
          duration: fallDuration,
          ease: "sine.in",
        });

        // Add slight wobble during fall
        gsap.to(emote, {
          rotationY: helpers.Randomizer(-30, 30),
          rotationX: helpers.Randomizer(-30, 30),
          duration: 0.5,
          repeat: Math.floor(fallDuration * 2),
          yoyo: true,
          ease: "sine.inOut",
        });

        // Cleanup after falling
        setTimeout(() => {
          helpers.removeelement(emote.id);
        }, (fallDuration + 1) * 1000);
      },
    }
  );
}
