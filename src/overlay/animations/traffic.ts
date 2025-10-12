import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

interface TrafficEmote {
  id: string;
  direction: "horizontal" | "vertical";
  position: number; // x for vertical, y for horizontal
  startTime: number;
  speed: number;
  isHorizontal: boolean;
  startPos: number; // starting x/y coordinate along travel axis
  endPos: number; // ending x/y coordinate along travel axis
}

// Track all active traffic emotes
const activeTrafficEmotes: Map<string, TrafficEmote> = new Map();

// Track the last side and direction used to encourage variety
let lastUsedSide: number = -1;
let lastUsedDirection: "horizontal" | "vertical" | null = null;

// Get emote size from CSS variable
function getEmoteSize(): number {
  const root = document.documentElement;
  const size = getComputedStyle(root).getPropertyValue("--emote-size-standard");
  return parseInt(size) || 75;
}

export function traffic(
  images: string[],
  count: number = 20,
  interval: number = 200
): void {
  let imgcount = images.length;

  for (let j = 0; j < count; j++) {
    // split the count amongst the images
    let imagenum = j % imgcount;
    setTimeout(async () => {
      await createEmoteTraffic(images[imagenum]);
    }, j * interval);
  }
}

interface TrafficConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  direction: "horizontal" | "vertical";
  position: number;
  speed: number;
  side: number; // 0-3 representing which side this emote comes from
}

async function createEmoteTraffic(image: string): Promise<void> {
  const emoteSize = getEmoteSize();
  const attemptsPerRound = 100;
  const maxRounds = 6;
  const delayBetweenRounds = 200; // milliseconds
  let config: TrafficConfig | null = null;
  
  // Try multiple rounds with increasingly relaxed constraints
  for (let round = 0; round < maxRounds && !config; round++) {
    // If not the first round, wait for traffic to clear
    if (round > 0) {
      await helpers.delay(delayBetweenRounds + round * 100);
    }
    
    // Define priority based on round:
    // Rounds 0-2: Only try perpendicular to last direction (most interesting!)
    // Rounds 3-4: Allow same direction but different side
    // Round 5: Allow everything including same side
    let excludeSides: number[] = [];
    let requirePerpendicular = false;
    
    if (lastUsedDirection !== null) {
      if (round < 3) {
        // Priority 1: Only perpendicular paths (creates the best close calls)
        requirePerpendicular = true;
        excludeSides = []; // Don't exclude sides, just filter by direction
      } else if (round < 5) {
        // Priority 2: Same or perpendicular, but not the same side
        requirePerpendicular = false;
        excludeSides = lastUsedSide !== -1 ? [lastUsedSide] : [];
      } else {
        // Priority 3: Allow everything in final round
        requirePerpendicular = false;
        excludeSides = [];
      }
    }
    
    for (let attempt = 0; attempt < attemptsPerRound; attempt++) {
      const testConfig = getTrafficConfig(emoteSize, excludeSides, requirePerpendicular ? lastUsedDirection : null);
      if (!willCollide(testConfig, emoteSize)) {
        config = testConfig;
        if (round > 0 || requirePerpendicular) {
          console.log(`Found ${requirePerpendicular ? 'perpendicular' : 'any'} path on round ${round + 1}, attempt ${attempt + 1}`);
        }
        break;
      }
    }
  }
  
  // If we couldn't find a non-colliding path after all rounds, skip this emote
  if (!config) {
    console.log(`No non-colliding path found after ${maxRounds} rounds of ${attemptsPerRound} attempts each`);
    return;
  }
  
  // Remember this side and direction for next time
  lastUsedSide = config.side;
  lastUsedDirection = config.direction;

  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;

  gsap.set(Div, {
    className: "traffic-element",
    x: config.startX,
    y: config.startY,
    z: helpers.Randomizer(-100, 100),
    rotation: helpers.Randomizer(-5, 5),
    backgroundImage: "url(" + image + ")",
  });

  globalVars.warp.appendChild(Div);

  // Register this emote
  const emoteData: TrafficEmote = {
    id: Div.id,
    direction: config.direction,
    position: config.position,
    startTime: Date.now(),
    speed: config.speed,
    isHorizontal: config.direction === "horizontal",
    startPos: config.direction === "horizontal" ? config.startX : config.startY,
    endPos: config.direction === "horizontal" ? config.endX : config.endY,
  };
  activeTrafficEmotes.set(Div.id, emoteData);

  // Run animation
  traffic_animation(Div, config, emoteSize);
}

function getTrafficConfig(
  emoteSize: number, 
  excludeSides: number[] = [], 
  requirePerpendicularTo: "horizontal" | "vertical" | null = null
): TrafficConfig {
  // Randomly select direction: 0 = top-down, 1 = left-right, 2 = bottom-up, 3 = right-left
  // Start with all sides
  let availableSides = [0, 1, 2, 3];
  
  // If we need perpendicular, filter to only perpendicular sides
  if (requirePerpendicularTo !== null) {
    if (requirePerpendicularTo === "horizontal") {
      // If last was horizontal, only allow vertical (sides 0 and 2)
      availableSides = availableSides.filter(side => side === 0 || side === 2);
    } else {
      // If last was vertical, only allow horizontal (sides 1 and 3)
      availableSides = availableSides.filter(side => side === 1 || side === 3);
    }
  }
  
  // Then exclude specified sides
  availableSides = availableSides.filter(side => !excludeSides.includes(side));
  
  // Pick a random side from available options
  const direction = availableSides[Math.floor(Math.random() * availableSides.length)];
  const baseSpeed = helpers.Randomizer(300, 1000);
  
  switch (direction) {
    case 0: // Top to bottom (vertical)
      // In landscape mode, restrict vertical emotes to center 60% of screen width
      let minX0 = emoteSize;
      let maxX0 = innerWidth - emoteSize;
      if (innerWidth > innerHeight) {
        const horizontalMargin = innerWidth * 0.2;
        minX0 = Math.max(minX0, horizontalMargin);
        maxX0 = Math.min(maxX0, innerWidth - horizontalMargin);
      }
      const xPos0 = helpers.Randomizer(minX0, maxX0);
      return {
        startX: xPos0,
        startY: -emoteSize,
        endX: xPos0,
        endY: innerHeight + emoteSize,
        direction: "vertical",
        position: xPos0,
        speed: baseSpeed,
        side: 0,
      };
    
    case 1: // Left to right (horizontal)
      const yPos1 = helpers.Randomizer(emoteSize, innerHeight - emoteSize);
      return {
        startX: -emoteSize,
        startY: yPos1,
        endX: innerWidth + emoteSize,
        endY: yPos1,
        direction: "horizontal",
        position: yPos1,
        speed: baseSpeed,
        side: 1,
      };
    
    case 2: // Bottom to top (vertical)
      // In landscape mode, restrict vertical emotes to center 60% of screen width
      let minX2 = emoteSize;
      let maxX2 = innerWidth - emoteSize;
      if (innerWidth > innerHeight) {
        const horizontalMargin = innerWidth * 0.2;
        minX2 = Math.max(minX2, horizontalMargin);
        maxX2 = Math.min(maxX2, innerWidth - horizontalMargin);
      }
      const xPos2 = helpers.Randomizer(minX2, maxX2);
      return {
        startX: xPos2,
        startY: innerHeight + emoteSize,
        endX: xPos2,
        endY: -emoteSize,
        direction: "vertical",
        position: xPos2,
        speed: baseSpeed,
        side: 2,
      };
    
    case 3: // Right to left (horizontal)
    default:
      const yPos3 = helpers.Randomizer(emoteSize, innerHeight - emoteSize);
      return {
        startX: innerWidth + emoteSize,
        startY: yPos3,
        endX: -emoteSize,
        endY: yPos3,
        direction: "horizontal",
        position: yPos3,
        speed: baseSpeed,
        side: 3,
      };
  }
}

function willCollide(config: TrafficConfig, emoteSize: number): boolean {
  const now = Date.now();
  const isNewHorizontal = config.direction === "horizontal";
  const newStartPos = isNewHorizontal ? config.startX : config.startY;
  const newEndPos = isNewHorizontal ? config.endX : config.endY;
  const newTravelDirection = newEndPos > newStartPos ? 1 : -1;
  
  // Check against all active emotes
  for (const [id, emote] of activeTrafficEmotes.entries()) {
    const existingTravelDirection = emote.endPos > emote.startPos ? 1 : -1;
    
    // Case 1: Perpendicular collision (horizontal vs vertical)
    if (emote.direction !== config.direction) {
      const intersectionX = isNewHorizontal ? emote.position : config.position;
      const intersectionY = isNewHorizontal ? config.position : emote.position;
      
      // Calculate when the new emote will reach the intersection
      const newEmoteDistanceToIntersection = isNewHorizontal
        ? Math.abs(intersectionX - config.startX)
        : Math.abs(intersectionY - config.startY);
      const newEmoteTimeToIntersection = (newEmoteDistanceToIntersection / config.speed) * 1000;
      
      // Calculate current position of existing emote
      const existingEmoteCurrentPos = emote.startPos + ((now - emote.startTime) / 1000) * emote.speed * existingTravelDirection;
      const existingEmoteDistanceToIntersection = isNewHorizontal
        ? Math.abs(intersectionY - existingEmoteCurrentPos)
        : Math.abs(intersectionX - existingEmoteCurrentPos);
      const existingEmoteTimeToIntersection = (existingEmoteDistanceToIntersection / emote.speed) * 1000;
      
      // Check if they'll be at the intersection at approximately the same time
      const timeDifference = Math.abs(newEmoteTimeToIntersection - existingEmoteTimeToIntersection);
      const collisionTimeWindow = (emoteSize * 2 / Math.min(config.speed, emote.speed)) * 1000;
      
      if (timeDifference < collisionTimeWindow) {
        return true; // Perpendicular collision detected
      }
    }
    // Case 2 & 3: Same direction collision (same line, same or opposite direction)
    else {
      // Check if they're on the same line (within emote size tolerance)
      const positionDifference = Math.abs(config.position - emote.position);
      if (positionDifference < emoteSize * 1.5) {
        // Calculate current position of existing emote
        const timeSinceStart = (now - emote.startTime) / 1000;
        const existingEmoteCurrentPos = emote.startPos + timeSinceStart * emote.speed * existingTravelDirection;
        
        // Case 2: Head-on collision (opposite directions on same line)
        if (newTravelDirection !== existingTravelDirection) {
          // Calculate when/where they would meet
          const relativeSpeed = config.speed + emote.speed; // Combined closing speed
          const distanceBetween = Math.abs(newStartPos - existingEmoteCurrentPos);
          const timeToCollision = (distanceBetween / relativeSpeed) * 1000;
          
          // Calculate positions at potential collision time
          const newPosAtCollision = newStartPos + (timeToCollision / 1000) * config.speed * newTravelDirection;
          const existingPosAtCollision = existingEmoteCurrentPos + (timeToCollision / 1000) * emote.speed * existingTravelDirection;
          
          // Check if collision happens within both emotes' travel paths
          const newMin = Math.min(newStartPos, newEndPos);
          const newMax = Math.max(newStartPos, newEndPos);
          const existingMin = Math.min(existingEmoteCurrentPos, emote.endPos);
          const existingMax = Math.max(existingEmoteCurrentPos, emote.endPos);
          
          const collisionInNewPath = newPosAtCollision >= newMin && newPosAtCollision <= newMax;
          const collisionInExistingPath = existingPosAtCollision >= existingMin && existingPosAtCollision <= existingMax;
          
          if (collisionInNewPath && collisionInExistingPath) {
            const distanceAtCollision = Math.abs(newPosAtCollision - existingPosAtCollision);
            if (distanceAtCollision < emoteSize * 2) {
              return true; // Head-on collision detected
            }
          }
        }
        // Case 3: Rear-end collision (same direction, but new emote is faster or will catch up)
        else {
          // Only check if we're behind and faster, or ahead and slower
          const isBehind = newTravelDirection > 0 
            ? newStartPos < existingEmoteCurrentPos 
            : newStartPos > existingEmoteCurrentPos;
          
          if (isBehind && config.speed > emote.speed) {
            // Calculate if we'll catch up before the end
            const relativeSpeed = config.speed - emote.speed;
            const distanceBetween = Math.abs(newStartPos - existingEmoteCurrentPos);
            const timeToCatchUp = (distanceBetween / relativeSpeed) * 1000;
            
            // Calculate positions at catch-up time
            const newPosAtCatchUp = newStartPos + (timeToCatchUp / 1000) * config.speed * newTravelDirection;
            const existingPosAtCatchUp = existingEmoteCurrentPos + (timeToCatchUp / 1000) * emote.speed * existingTravelDirection;
            
            // Check if catch-up happens within travel paths
            const newMin = Math.min(newStartPos, newEndPos);
            const newMax = Math.max(newStartPos, newEndPos);
            const existingMin = Math.min(existingEmoteCurrentPos, emote.endPos);
            const existingMax = Math.max(existingEmoteCurrentPos, emote.endPos);
            
            const catchUpInNewPath = newPosAtCatchUp >= newMin && newPosAtCatchUp <= newMax;
            const catchUpInExistingPath = existingPosAtCatchUp >= existingMin && existingPosAtCatchUp <= existingMax;
            
            if (catchUpInNewPath && catchUpInExistingPath) {
              const distanceAtCatchUp = Math.abs(newPosAtCatchUp - existingPosAtCatchUp);
              if (distanceAtCatchUp < emoteSize * 2) {
                return true; // Rear-end collision detected
              }
            }
          }
        }
      }
    }
  }
  
  return false; // No collision
}

function traffic_animation(element: HTMLElement, config: TrafficConfig, emoteSize: number): void {
  // Calculate distance
  const distanceX = Math.abs(config.endX - config.startX);
  const distanceY = Math.abs(config.endY - config.startY);
  const distance = Math.max(distanceX, distanceY);
  
  // Calculate duration based on speed
  const duration = distance / config.speed;

  // Main movement animation - straight line only
  gsap.to(element, {
    x: config.endX,
    y: config.endY,
    duration: duration,
    ease: "none",
  });

  // Very subtle wobble for more natural movement
  gsap.to(element, {
    rotation: "+=5",
    duration: helpers.Randomizer(1.5, 2.5),
    repeat: Math.ceil(duration / 2),
    yoyo: true,
    ease: "sine.inOut",
  });

  // Fade in at start
  gsap.fromTo(
    element,
    { opacity: 0 },
    { opacity: 1, duration: 0.3, ease: "power2.out" }
  );

  // Fade out at end
  gsap.to(element, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in",
    delay: duration - 0.5,
  });
  
  // Remove from tracking after animation completes
  setTimeout(() => {
    activeTrafficEmotes.delete(element.id);
    helpers.removeelement(element.id);
  }, duration * 1000 + 100);
}

