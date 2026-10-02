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
  let moveInterval = Math.max(50, speed);
  const minMoveInterval = 35;
  const speedMultiplier = 0.97;
  const mistakeChance = 0.08;

  // Game State
  let snakeBody: { x: number; y: number }[] = [];
  let bodyElements: HTMLElement[] = [];
  let food: { x: number; y: number; element: HTMLElement; imageIndex: number } | null = null;
  let direction = { x: 1, y: 0 }; // Moving right initially
  let nextDirection = { x: 1, y: 0 };
  let foodEatenCount = 0;
  let gameLoopId: ReturnType<typeof setTimeout>;
  let isGameRunning = true;
  let currentImageIndex = 0;
  // A pending mistake skips a later necessary turn, after a few normal moves.
  let movesUntilMistake: number | null = null;

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
      helpers.removeelement(container.id);
      return;
  }

  // Initialize Snake
  const startX = Math.max(3, Math.min(Math.floor(cols / 2), cols - 2));
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

    const freeCells: { x: number; y: number }[] = [];
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        if (!snakeBody.some(segment => segment.x === x && segment.y === y)) {
          freeCells.push({ x, y });
        }
      }
    }
    if (freeCells.length === 0) {
      finishGame();
      return;
    }
    const { x, y } = freeCells[Math.floor(Math.random() * freeCells.length)];

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

  function collisionAt(position: { x: number; y: number }): "wall" | "body" | null {
    if (position.x < 0 || position.x >= cols || position.y < 0 || position.y >= rows) {
      return "wall";
    }
    const eating = food && position.x === food.x && position.y === food.y;
    // The last tail cell is free on the next move unless this move grows the snake.
    const occupied = eating ? snakeBody : snakeBody.slice(0, -1);
    return occupied.some(segment => segment.x === position.x && segment.y === position.y)
      ? "body" : null;
  }

  function updateDirection() {
    if (!food) return;
    const head = snakeBody[0];
    // Prefer continuing straight when two routes are equally close to food.
    const possibleMoves = [
      direction,
      { x: -direction.y, y: direction.x },
      { x: direction.y, y: -direction.x },
    ];
    const safeMoves = possibleMoves.filter(move =>
      !collisionAt({ x: head.x + move.x, y: head.y + move.y })
    );

    nextDirection = direction;
    if (safeMoves.length === 0) return;

    if (movesUntilMistake !== null) {
      const forward = { x: head.x + direction.x, y: head.y + direction.y };
      const collision = collisionAt(forward);
      const clipsTail = snakeBody.slice(4, -1).some(segment =>
        segment.x === forward.x && segment.y === forward.y
      );
      // Keep pursuing food until a missed turn would clip the rear body or a wall.
      // Never deliberately turn into the neck or steer toward the body.
      if (movesUntilMistake === 0 && (collision === "wall" || (collision === "body" && clipsTail))) {
        return;
      }
      movesUntilMistake = Math.max(0, movesUntilMistake - 1);
    }

    safeMoves.sort((a, b) => {
      const distA = Math.abs(head.x + a.x - food!.x) + Math.abs(head.y + a.y - food!.y);
      const distB = Math.abs(head.x + b.x - food!.x) + Math.abs(head.y + b.y - food!.y);
      return distA - distB;
    });
    nextDirection = Math.random() < 0.2 && safeMoves.length > 1 ? safeMoves[1] : safeMoves[0];
  }

  function move() {
    if (!isGameRunning) return;

    direction = nextDirection;
    const head = snakeBody[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    const collision = collisionAt(newHead);
    if (collision) {
      endGame(collision);
      return;
    }

    // Use the same duration for the whole move, even when this meal speeds up the next one.
    const stepInterval = moveInterval;
    snakeBody.unshift(newHead);

    // Update Head Visual Position
    gsap.to(headDiv, {
        left: newHead.x * gridSize,
        top: newHead.y * gridSize,
        duration: stepInterval / 1000,
        ease: "none"
    });

    // Rotate Head based on direction
    let rotation = 0;
    if (direction.x === 1) rotation = 0;
    if (direction.x === -1) rotation = 180;
    if (direction.y === 1) rotation = 90;
    if (direction.y === -1) rotation = -90;
    gsap.to(headDiv, { rotation, duration: Math.min(0.1, stepInterval / 1000), overwrite: "auto" });


    // Check Food
    if (food && newHead.x === food.x && newHead.y === food.y) {
        // Eat Food
        foodEatenCount++;
        moveInterval = Math.max(minMoveInterval, moveInterval * speedMultiplier);
        
        // Use food element as new body part (Neck)
        const newSegment = food.element;
        gsap.killTweensOf(newSegment);
        gsap.set(newSegment, { scale: 1 });
        newSegment.style.borderRadius = "50%";
        newSegment.style.opacity = "0.8";
        
        // Add to body visuals at the front (neck)
        bodyElements.unshift(newSegment);
        
        food = null;
        
        if (movesUntilMistake === null && foodEatenCount > 3 && Math.random() < mistakeChance) {
             movesUntilMistake = 3;
        }
    } else {
        snakeBody.pop();
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
                duration: stepInterval / 1000,
                ease: "none"
            });
        }
    });
    
    // Complete this move before choosing the next one or starting the exit animation.
    gameLoopId = setTimeout(() => {
      if (!food) spawnFood();
      if (!isGameRunning) return;
      updateDirection();
      move();
    }, stepInterval);
  }

  function stopGame() {
    isGameRunning = false;
    clearTimeout(gameLoopId);
    gsap.killTweensOf([headTop, headBottom]);
    gsap.to([headTop, headBottom], { rotation: 0, duration: 0.08 });
  }

  function cleanup() {
    gsap.killTweensOf([container, headTop, headBottom, ...Array.from(container.children)]);
    helpers.removeelement(container.id);
  }

  function endGame(reason: "wall" | "body") {
    console.log("Snake Game Ended: " + reason);
    stopGame();
    gsap.killTweensOf([headDiv, ...bodyElements]);

    const head = snakeBody[0];
    // Advance into the impact, keeping the avatar visible at screen edges.
    const impactX = Math.max(0, Math.min(window.innerWidth - gridSize,
      (head.x + direction.x * 0.32) * gridSize));
    const impactY = Math.max(0, Math.min(window.innerHeight - gridSize,
      (head.y + direction.y * 0.32) * gridSize));
    headDiv.style.borderRadius = "50%";
    headDiv.style.boxShadow = "0 0 0 4px #ff7868, 0 0 28px #ff5848";
    gsap.to(headDiv, {
      left: impactX, top: impactY,
      scaleX: 0.8, scaleY: 1.12,
      duration: 0.1, ease: "power2.out",
      onComplete: () => {
        gsap.to(headDiv, {
          left: impactX - direction.x * gridSize * 0.08,
          top: impactY - direction.y * gridSize * 0.08,
          scaleX: 1, scaleY: 1, duration: 0.18, ease: "power2.out",
        });
      },
    });

    const impact = document.createElement("div");
    Object.assign(impact.style, {
      position: "absolute",
      left: `${Math.max(12, Math.min(window.innerWidth - 12, (head.x + 0.5 + direction.x * 0.5) * gridSize))}px`,
      top: `${Math.max(12, Math.min(window.innerHeight - 12, (head.y + 0.5 + direction.y * 0.5) * gridSize))}px`,
      width: "36px", height: "36px", marginLeft: "-18px", marginTop: "-18px",
      border: "4px solid #ffe6a3", borderRadius: "50%", boxSizing: "border-box",
      boxShadow: "0 0 20px #ff7868", zIndex: "1001",
    });
    container.appendChild(impact);
    gsap.to(impact, { scale: 2.4, opacity: 0, duration: 0.6, ease: "power2.out" });
    if (food) gsap.to(food.element, { opacity: 0.3, duration: 0.2 });

    // Hold the frozen snake and marked collision site before fading together.
    gsap.to(container, { opacity: 0, delay: 1, duration: 0.4, onComplete: cleanup });
  }

  function finishGame() {
      stopGame();
      
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
      
      setTimeout(cleanup, (2 + Math.max(0, bodyElements.length - 1) * 0.05) * 1000);
  }

  // Start Game
  spawnFood();
  if (isGameRunning) {
    updateDirection();
    gameLoopId = setTimeout(move, moveInterval);
  }
}
