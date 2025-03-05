import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';
import { tetrominos } from '../lib/emotetetris.js';
import { gsap } from "gsap";

interface Position {
    x: number;
    y: number;
}

type TetrominoGrid = (0 | 1)[][];
type GameGrid = (string | null)[][];

export function emoteTetris(images: string[], pieces: number = 20, interval: number = 100): void {
    // Initialize game grid (20 rows x 10 columns)
    const GRID_HEIGHT = 20;
    const GRID_WIDTH = 10;
    let grid: GameGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.id = 'tetris-grid-' + globalVars.divnumber++;
    gridContainer.className = 'tetris-grid';
    globalConst.warp.appendChild(gridContainer);
    
    // Style the grid container - align to bottom of screen
    gsap.set(gridContainer, {
        position: 'absolute',
        left: '50%',
        bottom: '32px', // Add some padding from bottom
        transform: 'translateX(-50%)',
        width: GRID_WIDTH * 32 + 'px',  // 32px per cell
        height: GRID_HEIGHT * 32 + 'px',
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_WIDTH}, 32px)`,
        gridTemplateRows: `repeat(${GRID_HEIGHT}, 32px)`,
        gap: '0px'
    });

    // Create grid cells
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'tetris-cell';
            cell.id = `tetris-${gridContainer.id}-${y}-${x}`;
            gridContainer.appendChild(cell);
            
            gsap.set(cell, {
                width: '32px',
                height: '32px',
                backgroundColor: 'transparent'
            });
        }
    }
    
    // Get all possible piece types (L, P, Z, S, T, I, Q)
    const pieceTypes = Object.keys(tetrominos).filter(key => key.endsWith('1')).map(key => key[0]);
    
    // Track current animation state
    let currentPiece: TetrominoGrid | null = null;
    let currentPiecePos: Position = { x: 0, y: 0 };
    let piecesPlaced = 0;
    let currentImageIndex = 0;
    
    function getRandomPiece(): TetrominoGrid {
        const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const rotation = Math.floor(Math.random() * 4) + 1;
        return tetrominos[`${type}${rotation}`] as TetrominoGrid;
    }
    
    function getPieceWidth(piece: TetrominoGrid): number {
        let width = 0;
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                if (piece[y][x]) width = Math.max(width, x + 1);
            }
        }
        return width;
    }
    
    function updateCell(x: number, y: number, image: string | null): void {
        if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
            const cell = document.getElementById(`tetris-${gridContainer.id}-${y}-${x}`);
            if (cell) {
                if (image) {
                    gsap.set(cell, {
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    });
                } else {
                    gsap.set(cell, { clearProps: 'background' });
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
    
    function canPlacePiece(piece: TetrominoGrid, pos: Position): boolean {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (piece[y][x]) {
                    const newX = pos.x + x;
                    const newY = pos.y + y;
                    
                    if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
                        return false;
                    }
                    
                    if (newY >= 0 && grid[newY][newX] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
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
        
        // Check for completed rows
        checkForCompletedRows();
    }
    
    function checkForCompletedRows(): void {
        const completedRows: number[] = [];
        
        // Find completed rows
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[y].every(cell => cell !== null)) {
                completedRows.push(y);
            }
        }
        
        if (completedRows.length > 0) {
            // Animate row explosion
            animateRowExplosion(completedRows);
        }
    }
    
    function animateRowExplosion(rows: number[]): void {
        // Pause the main game loop temporarily
        const originalPiece = currentPiece;
        const originalPos = {...currentPiecePos};
        currentPiece = null;
        
        // Get cells from completed rows for animation
        const cellsToAnimate: HTMLElement[] = [];
        rows.forEach(rowIndex => {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const cell = document.getElementById(`tetris-${gridContainer.id}-${rowIndex}-${x}`);
                if (cell) cellsToAnimate.push(cell);
            }
        });
        
        // Flash effect
        const timeline = gsap.timeline({
            onComplete: () => {
                // Remove completed rows and shift pieces down
                removeCompletedRows(rows);
                // Resume the game
                currentPiece = originalPiece;
                currentPiecePos = originalPos;
                renderGrid();
            }
        });
        
        // Flash white 3 times
        timeline.to(cellsToAnimate, {
            backgroundColor: "white",
            duration: 0.1
        })
        .to(cellsToAnimate, {
            backgroundColor: "transparent",
            duration: 0.1
        })
        .to(cellsToAnimate, {
            backgroundColor: "white",
            duration: 0.1
        })
        .to(cellsToAnimate, {
            backgroundColor: "transparent",
            duration: 0.1
        })
        .to(cellsToAnimate, {
            backgroundColor: "white",
            duration: 0.1
        });
        
        // Explosion effect: scale and fade out
        timeline.to(cellsToAnimate, {
            scale: 1.5,
            opacity: 0,
            duration: 0.2,
            stagger: 0.02,
            ease: "power1.out"
        });
    }
    
    function removeCompletedRows(rows: number[]): void {
        // Sort rows in descending order to handle multiple rows properly
        rows.sort((a, b) => b - a);
        
        rows.forEach(rowIndex => {
            // Remove the completed row
            grid.splice(rowIndex, 1);
            // Add a new empty row at the top
            grid.unshift(Array(GRID_WIDTH).fill(null));
        });
    }
    
    function spawnNewPiece(): void {
        currentPiece = getRandomPiece();
        const pieceWidth = getPieceWidth(currentPiece);
        currentPiecePos = {
            x: Math.floor(Math.random() * (GRID_WIDTH - pieceWidth + 1)),
            y: -4
        };
        piecesPlaced++;
    }
    
    function update(): void {
        if (!currentPiece) {
            spawnNewPiece();
        }
        
        // Try moving piece down
        const nextPos = { ...currentPiecePos, y: currentPiecePos.y + 1 };
        
        if (currentPiece && canPlacePiece(currentPiece, nextPos)) {
            currentPiecePos = nextPos;
        } else if (currentPiece) {
            // Place piece and spawn new one
            placePiece(currentPiece, currentPiecePos);
            currentPiece = null;
        }
        
        renderGrid();
        
        // Continue animation if pieces remain
        if (piecesPlaced < pieces) {
            setTimeout(update, interval);
        } else {
            // Fade out and clean up after animation is done
            gsap.to(gridContainer, {
                opacity: 0,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    helpers.removeelement(gridContainer.id);
                }
            });
        }
    }
    
    // Start animation
    update();
}