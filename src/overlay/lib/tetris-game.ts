import { tetrominos } from "./emotetetris.js";

export type TetrominoGrid = number[][];
export type GameGrid = (string | null)[][];
export interface Position { x: number; y: number; }
export interface Placement extends Position { piece: TetrominoGrid; }

export const pieceTypes = ["L", "P", "Z", "S", "T", "I", "Q"] as const;
export type PieceType = typeof pieceTypes[number];

export function canPlacePiece(grid: GameGrid, piece: TetrominoGrid, pos: Position): boolean {
  return piece.every((row, y) => row.every((cell, x) => {
    if (!cell) return true;
    const column = pos.x + x;
    const rowIndex = pos.y + y;
    return column >= 0 && column < grid[0].length && rowIndex < grid.length &&
      (rowIndex < 0 || grid[rowIndex][column] === null);
  }));
}

export function isAboveCeiling(piece: TetrominoGrid, pos: Position): boolean {
  return piece.some((row, y) => pos.y + y < 0 && row.some(Boolean));
}

export function completedRows(grid: GameGrid): number[] {
  return grid.flatMap((row, y) => row.every((cell) => cell !== null) ? [y] : []);
}

export function clearRows(grid: GameGrid, rows: number[]): GameGrid {
  const remaining = grid.filter((_, y) => !rows.includes(y));
  return [
    ...Array.from({ length: grid.length - remaining.length }, () => Array(grid[0].length).fill(null)),
    ...remaining,
  ];
}

// Favor completed lines and a low, even stack, with a strong penalty for buried holes.
function scoreGrid(grid: GameGrid, lines: number): number {
  const heights = Array(grid[0].length).fill(0);
  let holes = 0;
  for (let x = 0; x < heights.length; x++) {
    for (let y = 0; y < grid.length; y++) {
      if (grid[y][x] !== null) {
        if (!heights[x]) heights[x] = grid.length - y;
      } else if (heights[x]) {
        holes++;
      }
    }
  }
  const aggregateHeight = heights.reduce((sum, height) => sum + height, 0);
  const bumpiness = heights.slice(1).reduce((sum, height, x) => sum + Math.abs(height - heights[x]), 0);
  return lines * 0.76 - aggregateHeight * 0.51 - holes * 0.36 - bumpiness * 0.18;
}

/** Evaluate every distinct rotation and straight drop. Never plan through existing blocks. */
export function findBestPlacement(grid: GameGrid, type: PieceType): Placement | null {
  let best: Placement | null = null;
  let bestScore = -Infinity;
  const seen = new Set<string>();
  for (let rotation = 1; rotation <= 4; rotation++) {
    const piece: TetrominoGrid = tetrominos[`${type}${rotation}`];
    const key = JSON.stringify(piece);
    if (seen.has(key)) continue;
    seen.add(key);
    const width = Math.max(...piece.map((row) => row.lastIndexOf(1) + 1));
    for (let x = 0; x <= grid[0].length - width; x++) {
      let y = -piece.length;
      while (canPlacePiece(grid, piece, { x, y: y + 1 })) y++;
      if (isAboveCeiling(piece, { x, y })) continue;
      const candidate = grid.map((row) => [...row]);
      piece.forEach((row, dy) => row.forEach((cell, dx) => {
        if (cell) candidate[y + dy][x + dx] = "occupied";
      }));
      const rows = completedRows(candidate);
      const cleared = clearRows(candidate, rows);
      // A placement that reaches the ceiling ends the animation after line clears.
      const score = scoreGrid(cleared, rows.length) - (cleared[0].some(Boolean) ? 1000 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = { piece, x, y };
      }
    }
  }
  return best;
}
