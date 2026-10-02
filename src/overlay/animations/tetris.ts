import { globalVars } from "../config.ts";
import helpers from "../helpers.js";
import {
  canPlacePiece, clearRows, completedRows, findBestPlacement, isAboveCeiling, pieceTypes,
  type GameGrid, type Position, type TetrominoGrid,
} from "../lib/tetris-game.js";
import { gsap } from "gsap";

export function tetris(
  images: string[],
  pieces: number = 20,
  interval: number = 100
): void {
  if (!images.length || !Number.isFinite(pieces) || pieces <= 0) return;
  // Initialize game grid (20 rows x 10 columns)
  const GRID_HEIGHT = 20;
  const GRID_WIDTH = 10;
  let grid: GameGrid = Array(GRID_HEIGHT)
    .fill(null)
    .map(() => Array(GRID_WIDTH).fill(null));

  // Calculate dynamic cell size based on page dimensions
  // Use a similar approach to the config.ts setCSSVars function
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  
  // Calculate cell size to fit the grid nicely on screen
  // Target: grid should take up roughly 2/3rds of screen height and 1/4 of screen width
  const targetGridHeight = windowHeight / 1.3;
  const targetGridWidth = windowWidth / 4;
  
  // Use the smaller of the two to maintain aspect ratio
  const cellSize = Math.min(
    targetGridHeight / GRID_HEIGHT,
    targetGridWidth / GRID_WIDTH
  );
  
  // Ensure minimum and maximum cell sizes for usability
  const minCellSize = 20;
  const maxCellSize = 60;
  const finalCellSize = Math.max(minCellSize, Math.min(maxCellSize, cellSize));
  
  // Create grid container
  const gridContainer = document.createElement("div");
  gridContainer.id = "tetris-grid-" + globalVars.divnumber++;
  gridContainer.className = "tetris-grid";
  globalVars.warp.appendChild(gridContainer);

  // Style the grid container - align to bottom of screen
  gsap.set(gridContainer, {
    position: "absolute",
    left: "50%",
    bottom: finalCellSize + "px", // Dynamic padding from bottom
    transform: "translateX(-50%)",
    width: GRID_WIDTH * finalCellSize + "px", // Dynamic cell size
    height: GRID_HEIGHT * finalCellSize + "px",
    display: "grid",
    gridTemplateColumns: `repeat(${GRID_WIDTH}, ${finalCellSize}px)`,
    gridTemplateRows: `repeat(${GRID_HEIGHT}, ${finalCellSize}px)`,
    gap: "0px",
  });

  // Create grid cells
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = document.createElement("div");
      cell.className = "tetris-cell";
      cell.id = `tetris-${gridContainer.id}-${y}-${x}`;
      gridContainer.appendChild(cell);

      gsap.set(cell, {
        width: finalCellSize + "px",
        height: finalCellSize + "px",
        backgroundColor: "transparent",
      });
    }
  }

  // Track current animation state
  let currentPiece: TetrominoGrid | null = null;
  let currentPiecePos: Position = { x: 0, y: 0 };
  let piecesPlaced = 0;
  let currentImageIndex = 0;
  let state: "falling" | "clearing" | "finished" = "falling";

  function updateCell(x: number, y: number, image: string | null): void {
    if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
      const cell = document.getElementById(
        `tetris-${gridContainer.id}-${y}-${x}`
      );
      if (cell) {
        if (image) {
          gsap.set(cell, {
            backgroundImage: `url(${image})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          });
        } else {
          gsap.set(cell, { clearProps: "background" });
        }
      }
    }
  }

  function renderGrid(): void {
    // Clear grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        updateCell(x, y, grid[y][x]);
      }
    }

    // Render current piece
    if (currentPiece) {
      const image = images[currentImageIndex];
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (currentPiece[y][x] && currentPiecePos.y + y >= 0) {
            updateCell(currentPiecePos.x + x, currentPiecePos.y + y, image);
          }
        }
      }
    }
  }

  function placePiece(piece: TetrominoGrid, pos: Position): void {
    const image = images[currentImageIndex];
    currentImageIndex = (currentImageIndex + 1) % images.length;

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (piece[y][x] && pos.y + y >= 0) {
          grid[pos.y + y][pos.x + x] = image;
        }
      }
    }
  }

  function animateRowExplosion(rows: number[]): void {
    state = "clearing";

    // Get cells from completed rows for animation
    const cellsToAnimate: HTMLElement[] = [];
    rows.forEach((rowIndex) => {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = document.getElementById(
          `tetris-${gridContainer.id}-${rowIndex}-${x}`
        );
        if (cell) cellsToAnimate.push(cell);
      }
    });

    // Flash effect
    const timeline = gsap.timeline({
      onComplete: () => {
        // Remove completed rows and shift pieces down
        grid = clearRows(grid, rows);
        gsap.set(cellsToAnimate, { scale: 1, opacity: 1, backgroundColor: "transparent" });
        renderGrid();
        state = "falling";
        continueGame();
      },
    });

    // Flash white 3 times
    timeline
      .to(cellsToAnimate, {
        backgroundColor: "white",
        duration: 0.1,
      })
      .to(cellsToAnimate, {
        backgroundColor: "transparent",
        duration: 0.1,
      })
      .to(cellsToAnimate, {
        backgroundColor: "white",
        duration: 0.1,
      })
      .to(cellsToAnimate, {
        backgroundColor: "transparent",
        duration: 0.1,
      })
      .to(cellsToAnimate, {
        backgroundColor: "white",
        duration: 0.1,
      });

    // Explosion effect: scale and fade out
    timeline.to(cellsToAnimate, {
      scale: 1.5,
      opacity: 0,
      duration: 0.2,
      stagger: 0.02,
      ease: "power1.out",
    });
  }

  function finish(gameOver: boolean): void {
    if (state === "finished") return;
    state = "finished";
    currentPiece = null;
    const cleanup = () => helpers.removeelement(gridContainer.id);
    if (!gameOver) {
      gsap.to(gridContainer, { opacity: 0, duration: 1, ease: "power2.out", onComplete: cleanup });
      return;
    }

    const message = document.createElement("div");
    message.className = "tetris-game-over";
    message.textContent = "GAME OVER";
    gridContainer.appendChild(message);
    gsap.set(message, {
      position: "absolute", top: "40%", left: 0, width: "100%",
      textAlign: "center", fontFamily: "monospace", fontWeight: "bold",
      fontSize: finalCellSize * 0.85 + "px", color: "white",
      backgroundColor: "rgba(100, 0, 0, 0.85)", padding: "0.5em 0",
      zIndex: 1,
    });
    gsap.timeline({ onComplete: cleanup })
      .to(gridContainer, { backgroundColor: "rgba(255, 40, 40, 0.35)", duration: 0.15, repeat: 3, yoyo: true })
      .to(gridContainer, { y: finalCellSize, opacity: 0, duration: 0.7, delay: 0.6, ease: "power2.in" });
  }

  function continueGame(): void {
    if (grid[0].some((cell) => cell !== null)) {
      finish(true);
    } else if (piecesPlaced >= pieces) {
      finish(false);
    } else {
      setTimeout(update, interval);
    }
  }

  function update(): void {
    if (state !== "falling") return;
    if (!currentPiece) {
      const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
      const placement = findBestPlacement(grid, type);
      if (!placement) {
        finish(true);
        return;
      }
      currentPiece = placement.piece;
      currentPiecePos = { x: placement.x, y: -currentPiece.length };
    }

    // Try moving piece down
    const nextPos = { ...currentPiecePos, y: currentPiecePos.y + 1 };

    if (canPlacePiece(grid, currentPiece, nextPos)) {
      currentPiecePos = nextPos;
    } else {
      if (isAboveCeiling(currentPiece, currentPiecePos)) {
        finish(true);
        return;
      }
      placePiece(currentPiece, currentPiecePos);
      currentPiece = null;
      piecesPlaced++;
      renderGrid();
      const rows = completedRows(grid);
      if (rows.length) animateRowExplosion(rows);
      else continueGame();
      return;
    }

    renderGrid();

    setTimeout(update, interval);
  }

  // Start animation
  update();
}
