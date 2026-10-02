import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function solitaire(
  images: string[],
  count: number = 52,
  speed: number = 50
): void {
  const container = document.createElement("div");
  container.id = "solitaire-container-" + globalVars.divnumber++;
  container.style.position = "absolute";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  container.style.overflow = "hidden";
  // Own stacking context so the -1 trails paint above the page background
  // (a negative z-index inside the root stacking context would fall behind body's
  // background in preview mode) while still sitting behind the leader cards.
  container.style.zIndex = "0";
  globalVars.warp.appendChild(container);

  const cardWidth = helpers.scaleRelativeToViewport(100);
  const cardHeight = cardWidth; // Assuming square emotes or similar aspect ratio
  const gravity = helpers.scaleRelativeToHeight(0.1435);
  const bounceFactor = 0.8;

  let activeCards = 0;

  // Helper to create a card
  const createCard = (index: number) => {
    // Read viewport at spawn time so cards spawned later match the current window size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let imgUrl = "https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0";
    if (images.length > 0) {
        imgUrl = images[index % images.length];
    }
    
    const card = document.createElement("div");
    card.style.width = `${cardWidth}px`;
    card.style.height = `${cardHeight}px`;
    card.style.position = "absolute";
    card.style.backgroundImage = `url(${imgUrl})`;
    card.style.backgroundSize = "contain";
    card.style.backgroundRepeat = "no-repeat";
    card.style.backgroundPosition = "center";
    
    // Start position (random x, top y? Or center?)
    // Classic solitaire starts from a deck position, but here we might want them to rain or explode.
    // Let's start them from random positions at the top or center.
    // Actually, let's have them cascade from the top left or random x at top.
    let x = Math.random() * Math.max(screenWidth - cardWidth, 0);
    let y = -cardHeight;
    
    // Velocity
    let vx = (Math.random() - 0.5) * helpers.scaleRelativeToWidth(10) + helpers.scaleRelativeToWidth(2); // Random horizontal speed
    if (Math.random() < 0.5) vx = -vx; // Random direction
    // Ensure some movement
    if (Math.abs(vx) < helpers.scaleRelativeToWidth(2)) vx = helpers.scaleRelativeToWidth(5);

    let vy = 0;

    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    container.appendChild(card);

    activeCards++;

    // Animation Loop for this card
    const update = () => {
        if (!document.body.contains(container)) return; // Safety check

        // Apply physics
        vy += gravity;
        x += vx;
        y += vy;

        // Bounce off bottom
        if (y + cardHeight > screenHeight) {
            y = screenHeight - cardHeight;
            vy = -vy * bounceFactor;
            
            // Add some friction to x when bouncing
            // vx *= 0.95; 
        }

        // Update position
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;

        // Create Trail
        // We don't want to create a trail EVERY frame, maybe every few frames or based on distance?
        // For "overlapping trail" look, every frame or every other frame is good.
        // Let's try every frame but fade them out.
        
            const trail = card.cloneNode(true) as HTMLElement;
            trail.style.opacity = "0.5";
            trail.style.zIndex = "-1"; // Behind the leader
            container.appendChild(trail);
            
            // Fade out trail
            gsap.to(trail, {
                opacity: 0,
                duration: 1, // Fade out speed
                onComplete: () => {
                    if (trail.parentNode) trail.parentNode.removeChild(trail);
                }
            });
            
        // Check if off screen (only check x bounds? or if it stops bouncing?)
        // If it goes off screen left or right
        if (x > screenWidth || x < -cardWidth) {
            card.remove();
            activeCards--;
            if (activeCards <= 0) {
                // Cleanup container if empty
                setTimeout(() => {
                    if (container.childNodes.length === 0) {
                        helpers.removeelement(container.id);
                    }
                }, 2000); // Wait for trails to fade
            }
            return; // Stop loop
        }

        requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  // Spawn cards with delay
  for (let i = 0; i < count; i++) {
      setTimeout(() => {
          createCard(i);
      }, i * speed);
  }
}
