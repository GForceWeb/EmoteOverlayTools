import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";
import { gsap } from "gsap";

export function snake(
  images: string[],
  count: number = 20,
  speed: number = 75,
  headUrl?: string
): void {
  // Configuration
  const gridSize = 80; // Size of each grid cell
  const maxFood = Math.min(count, 20); // Limit max food
  const moveInterval = Math.max(50, speed); // Minimum speed limit

  // Game State
  let snakeBody: { x: number; y: number }[] = [];
  let bodyElements: HTMLElement[] = [];
  let food: { x: number; y: number; element: HTMLElement; imageIndex: number } | null = null;
  let direction = { x: 1, y: 0 }; // Moving right initially
  let nextDirection = { x: 1, y: 0 };
  let foodEatenCount = 0;
  let gameLoopId: any;
  let isGameRunning = true;
  let currentImageIndex = 0;
  let isDoomed = false;

  // Setup Container
  const container = document.createElement("div");
  container.id = "snake-container-" + globalVars.divnumber++;
  container.style.position = "absolute";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  globalVars.warp.appendChild(container);

  // Grid Dimensions
  const cols = Math.floor(window.innerWidth / gridSize);
  const rows = Math.floor(window.innerHeight / gridSize);

  console.log(`Snake Init: Window ${window.innerWidth}x${window.innerHeight}, Grid ${cols}x${rows}`);

  if (cols < 5 || rows < 5) {
      console.error("Snake: Window too small for game");
      return;
  }

  // Initialize Snake
  const startX = Math.max(2, Math.min(Math.floor(cols / 2), cols - 3));
  const startY = Math.max(2, Math.min(Math.floor(rows / 2), rows - 3));
  
  // Create Head Elements (Split for chomping)
  const headSize = gridSize;
  // Use provided headUrl (user avatar) or fall back to default
  const snakeHeadUrl = headUrl || "https://static-cdn.jtvnw.net/jtv_user_pictures/8e051a26-051f-4abe-bcfa-e13a5d13fad0-profile_image-70x70.png";
  
  const headDiv = document.createElement("div");
  headDiv.style.width = `${headSize}px`;
  headDiv.style.height = `${headSize}px`;
  headDiv.style.position = "absolute";
  headDiv.style.zIndex = "1000";
  headDiv.style.left = `${startX * gridSize}px`;
  headDiv.style.top = `${startY * gridSize}px`;

  const headTop = document.createElement("div");
  headTop.style.width = "100%";
  headTop.style.height = "50%";
  headTop.style.overflow = "hidden";
  headTop.style.position = "absolute";
  headTop.style.top = "0";
  headTop.style.top = "0";
  headTop.style.transformOrigin = "bottom left";
  
  const headTopImg = document.createElement("div");
  headTopImg.style.width = "100%";
  headTopImg.style.height = "200%"; // Double height to show full image
  headTopImg.style.backgroundImage = `url(${snakeHeadUrl})`;
  headTopImg.style.backgroundSize = "cover";
  headTopImg.style.backgroundPosition = "top";
  headTop.appendChild(headTopImg);

  const headBottom = document.createElement("div");
  headBottom.style.width = "100%";
  headBottom.style.height = "50%";
  headBottom.style.overflow = "hidden";
  headBottom.style.position = "absolute";
  headBottom.style.bottom = "0";
  headBottom.style.bottom = "0";
  headBottom.style.transformOrigin = "top left";

  const headBottomImg = document.createElement("div");
  headBottomImg.style.width = "100%";
  headBottomImg.style.height = "200%";
  headBottomImg.style.backgroundImage = `url(${snakeHeadUrl})`;
  headBottomImg.style.backgroundSize = "cover";
  headBottomImg.style.backgroundPosition = "bottom";
  headBottomImg.style.position = "absolute";
  headBottomImg.style.bottom = "0";
  headBottom.appendChild(headBottomImg);

  headDiv.appendChild(headTop);
  headDiv.appendChild(headBottom);
  headDiv.appendChild(headTop);
  headDiv.appendChild(headBottom);
  container.appendChild(headDiv);

  snakeBody.push({ x: startX, y: startY });

  // Initialize Body Segments (Start with 3)
  // Assuming moving right initially (direction {1, 0}), body extends left
  for (let i = 1; i <= 3; i++) {
      const segX = startX - i;
      const segY = startY;
      snakeBody.push({ x: segX, y: segY });

      const bodyPart = document.createElement("div");
      bodyPart.style.width = `${gridSize}px`;
      bodyPart.style.height = `${gridSize}px`;
      bodyPart.style.position = "absolute";
      bodyPart.style.left = `${segX * gridSize}px`;
      bodyPart.style.top = `${segY * gridSize}px`;
      bodyPart.style.borderRadius = "50%";
      bodyPart.style.opacity = "0.8";
      
      // Use a default image or color for initial body
      // Let's use the head image but smaller or just a circle
      const bgImage = images.length > 0 ? images[0] : snakeHeadUrl;
      bodyPart.style.backgroundImage = `url(${bgImage})`;
      bodyPart.style.backgroundSize = "contain";
      bodyPart.style.backgroundRepeat = "no-repeat";
      bodyPart.style.backgroundPosition = "center";

      container.appendChild(bodyPart);
      bodyElements.push(bodyPart);
  }

  // Chomp Animation
  gsap.to(headTop, {
      rotation: -30,
      duration: 0.15,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
  });
  gsap.to(headBottom, {
      rotation: 30,
      duration: 0.15,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
  });


  function spawnFood() {
    if (foodEatenCount >= maxFood) {
      finishGame();
      return;
    }

    let validPosition = false;
    let x = 0, y = 0;
    while (!validPosition) {
      x = Math.floor(Math.random() * (cols - 2)) + 1; // Avoid edges slightly
      y = Math.floor(Math.random() * (rows - 2)) + 1;
      
      validPosition = !snakeBody.some(segment => segment.x === x && segment.y === y);
    }

    const foodEl = document.createElement("div");
    foodEl.style.width = `${gridSize}px`;
    foodEl.style.height = `${gridSize}px`;
    foodEl.style.position = "absolute";
    foodEl.style.left = `${x * gridSize}px`;
    foodEl.style.top = `${y * gridSize}px`;
    
    // Cycle through images for food
    let imgIdx = 0;
    if (images.length > 0) {
        imgIdx = currentImageIndex % images.length;
    }
    
    // Fallback if no images provided (use head url or generic)
    const bgImage = images.length > 0 ? images[imgIdx] : "https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0";
    
    foodEl.style.backgroundImage = `url(${bgImage})`;
    foodEl.style.backgroundSize = "contain";
    foodEl.style.backgroundRepeat = "no-repeat";
    foodEl.style.backgroundPosition = "center";
    
    container.appendChild(foodEl);
    
    // Spawn animation
    gsap.from(foodEl, { scale: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });

    food = { x, y, element: foodEl, imageIndex: imgIdx };
    currentImageIndex++;
  }

  function updateDirection() {
    if (!food) return;

    const head = snakeBody[0];
    
    // Define all possible moves
    let possibleMoves = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
    ];

    // Filter out reverse moves (cannot turn 180 degrees)
    possibleMoves = possibleMoves.filter(m => !(m.x === -direction.x && m.y === -direction.y));

    if (isDoomed) {
        // DOOMED MODE: Try to crash into self
        // 1. Look for immediate collision
        const crashMove = possibleMoves.find(move => {
            const targetX = head.x + move.x;
            const targetY = head.y + move.y;
            // Check if this move hits a body segment
            return snakeBody.some(seg => seg.x === targetX && seg.y === targetY);
        });

        if (crashMove) {
            nextDirection = crashMove;
            return;
        }

        // 2. If no immediate crash, steer towards the middle of the body
        if (snakeBody.length > 2) {
             const targetBodyPart = snakeBody[Math.floor(snakeBody.length / 2)];
             possibleMoves.sort((a, b) => {
                const distA = Math.abs((head.x + a.x) - targetBodyPart.x) + Math.abs((head.y + a.y) - targetBodyPart.y);
                const distB = Math.abs((head.x + b.x) - targetBodyPart.x) + Math.abs((head.y + b.y) - targetBodyPart.y);
                return distA - distB; // Move CLOSER to body
            });
             nextDirection = possibleMoves[0];
             return;
        }
    }

    // NORMAL MODE: Move towards food
    const dx = food.x - head.x;
    const dy = food.y - head.y;

    // Filter out moves that cause immediate collision
    const safeMoves = possibleMoves.filter(move => {
        const targetX = head.x + move.x;
        const targetY = head.y + move.y;
        // Check if this move hits a body segment
        // Note: We don't check the very last tail segment because it will move away (unless we eat, but we can't predict that perfectly here easily, safer to just avoid it)
        // Actually, if we eat, tail stays. If we don't, tail moves.
        // To be safe, avoid all current body segments.
        return !snakeBody.some(seg => seg.x === targetX && seg.y === targetY);
    });

    if (safeMoves.length === 0) {
        // No safe moves! We are trapped.
        // Just keep going in current direction if possible (already filtered out reverse)
        // or pick any move and accept fate.
        // Let's try to pick the one that keeps us alive longest? 
        // For now, just pick the first available move from original list (which excludes reverse)
        if (possibleMoves.length > 0) {
             nextDirection = possibleMoves[0];
        }
        return;
    }

    // Sort safe moves by distance to food
    safeMoves.sort((a, b) => {
        const distA = Math.abs((head.x + a.x) - food!.x) + Math.abs((head.y + a.y) - food!.y);
        const distB = Math.abs((head.x + b.x) - food!.x) + Math.abs((head.y + b.y) - food!.y);
        return distA - distB;
    });

    // Add some randomness/noise to make it "natural"
    if (Math.random() < 0.2 && safeMoves.length > 1) {
         // Occasionally pick the second best move
         nextDirection = safeMoves[1];
    } else {
         nextDirection = safeMoves[0];
    }
  }

  function move() {
    if (!isGameRunning) return;

    direction = nextDirection;
    const head = snakeBody[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    console.log(`Snake Move: Head(${head.x},${head.y}) -> New(${newHead.x},${newHead.y}) Dir(${direction.x},${direction.y}) BodyLen:${snakeBody.length}`);

    // Check Death Conditions
    // 1. Wall Collision (Wrap or Die? Let's Die for now or just stop)
    if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
        // Hit wall - for this animation, maybe just wrap or bounce? 
        // Let's just end game for safety
        endGame("Wall Collision");
        return;
    }

    // 2. Self Collision
    // Start checking from index 1 (neck) to avoid head colliding with itself? 
    // Actually head is at 0. We check if any OTHER segment is at newHead.
    // But we haven't unshifted newHead yet. So we check all existing segments.
    // BUT, the tail will move away if we don't eat.
    // So if newHead == tail, it's safe (unless we eat).
    // For simplicity, strict check:
    if (snakeBody.some((segment, index) => {
        // Ignore tail if we are not eating? No, we don't know if we eat yet.
        // Let's just check all.
        return segment.x === newHead.x && segment.y === newHead.y;
    })) {
         // "Accidental" death
         endGame("Self Collision");
         return;
    }



    // Move Body
    // Create new head element (or move tail to head)
    // Actually, we just move the visual elements. 
    // The head element is special (chomping), so we move it.
    // The body segments follow.
    
    // Logic: Add new head position. If food eaten, keep tail. Else remove tail.
    snakeBody.unshift({ x: newHead.x, y: newHead.y }); // Add new head coord

    // Update Head Visual Position
    gsap.to(headDiv, {
        left: newHead.x * gridSize,
        top: newHead.y * gridSize,
        duration: moveInterval / 1000,
        ease: "none"
    });

    // Rotate Head based on direction
    let rotation = 0;
    if (direction.x === 1) rotation = 0;
    if (direction.x === -1) rotation = 180;
    if (direction.y === 1) rotation = 90;
    if (direction.y === -1) rotation = -90;
    gsap.to(headDiv, { rotation: rotation, duration: 0.1 });


    // Check Food
    if (food && newHead.x === food.x && newHead.y === food.y) {
        // Eat Food
        foodEatenCount++;
        
        // Use food element as new body part (Neck)
        const newSegment = food.element;
        newSegment.style.borderRadius = "50%";
        newSegment.style.opacity = "0.8";
        
        // Add to body visuals at the front (neck)
        bodyElements.unshift(newSegment);
        
        food = null;
        
        // Chance to become doomed
        if (foodEatenCount > 3 && Math.random() < 0.10) {
             isDoomed = true;
             console.log("Snake is DOOMED!");
        }

        spawnFood();
    } else {
        // Remove Tail
        snakeBody.pop();
        // We don't remove visual element here because we move them all.
        // Wait, if we didn't eat, the number of segments stays the same.
        // snakeBody length decreased by 1 (pop).
        // bodyElements length is constant.
        // So bodyElements[i] maps to snakeBody[i+1].
    }

    // Animate Body Segments
    // Each body element moves to the position of the snakeBody segment it corresponds to.
    // bodyElements[0] is the first segment after head. It corresponds to snakeBody[1].
    bodyElements.forEach((el, i) => {
        const targetPos = snakeBody[i + 1];
        if (targetPos) {
            gsap.to(el, {
                left: targetPos.x * gridSize,
                top: targetPos.y * gridSize,
                duration: moveInterval / 1000,
                ease: "none"
            });
        }
    });
    
    updateDirection();
  }

  function endGame(reason: string = "Unknown") {
    console.log("Snake Game Ended: " + reason);
    isGameRunning = false;
    clearInterval(gameLoopId);
    
    // Death animation
    gsap.to(container, { opacity: 0, duration: 1, onComplete: () => {
        helpers.removeelement(container.id);
    }});
  }

  function finishGame() {
      isGameRunning = false;
      clearInterval(gameLoopId);
      
      // Move offscreen
      // Pick a direction away from center or just continue current direction
      const destX = direction.x * window.innerWidth;
      const destY = direction.y * window.innerHeight;
      
      // Animate all parts offscreen
      bodyElements.forEach((el, i) => {
          gsap.to(el, {
              x: `+=${destX}`,
              y: `+=${destY}`,
              duration: 2,
              delay: i * 0.05,
              ease: "power2.in"
          });
      });
      
      // Animate Head
      gsap.to(headDiv, {
          x: `+=${destX}`,
          y: `+=${destY}`,
          duration: 2,
          ease: "power2.in"
      });
      
      setTimeout(() => {
          helpers.removeelement(container.id);
      }, 3000);
  }

  // Start Game
  spawnFood();
  updateDirection();
  gameLoopId = setInterval(move, moveInterval);
}
