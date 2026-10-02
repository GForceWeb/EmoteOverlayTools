import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Load the real TypeScript modules with a deterministic clock and DOM/GSAP boundary.
function loadModule(path, globals = {}, overrides = {}) {
  const filename = resolve(path);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  const require = (name) => {
    if (name in overrides) return overrides[name];
    if (name.startsWith('.')) {
      return loadModule(resolve(dirname(filename), name.replace(/\.js$/, '.ts')), globals, overrides);
    }
    return createRequire(import.meta.url)(name);
  };
  vm.runInNewContext(source, { exports, require, console, ...globals }, { filename });
  return exports;
}

function animationHarness({ random = () => 0, overrides = {} } = {}) {
  const elements = [];
  const timers = [];
  const timelines = [];
  const fades = [];
  const document = {
    createElement: () => {
      const element = {
        style: {}, children: [], dataset: {},
        appendChild(child) { this.children.push(child); },
        remove() { this.removed = true; },
      };
      elements.push(element);
      return element;
    },
    getElementById: (id) => elements.find((element) => element.id === id),
  };
  const apply = (target, properties) => {
    for (const element of Array.isArray(target) ? target : [target]) {
      Object.assign(element.style, properties);
      if (properties.clearProps === 'background') delete element.style.backgroundImage;
    }
  };
  const gsap = {
    set: apply,
    to(target, properties) { fades.push({ target, properties }); },
    timeline(options) {
      const timeline = { options, steps: [], to(target, properties) {
        this.steps.push({ target, properties }); return this;
      } };
      timelines.push(timeline);
      return timeline;
    },
  };
  const { tetris } = loadModule('src/overlay/animations/tetris.ts', {
    document, window: { innerWidth: 1920, innerHeight: 1080 },
    Math: Object.assign(Object.create(Math), { random }),
    setTimeout: (callback) => { timers.push(callback); return timers.length; },
    clearTimeout: () => {},
  }, {
    '../config.ts': { globalVars: { divnumber: 0, warp: document.createElement('div') } },
    '../helpers.js': { default: { removeelement: (id) => document.getElementById(id).remove() } },
    gsap: { gsap }, ...overrides,
  });
  return { tetris, elements, timers, timelines, fades,
    tick() { assert.ok(timers.length, 'expected a scheduled update'); timers.shift()(); },
    drain() {
      let count = 0;
      while (timers.length && count++ < 10000) timers.shift()();
      assert.ok(count < 10000, 'animation should stop');
    },
  };
}

test('the final requested piece lands before normal cleanup', () => {
  const game = animationHarness();
  game.tetris(['emote'], 1, 1);
  assert.equal(game.fades.length, 0, 'must not fade on the last spawn');
  game.drain();
  assert.equal(game.fades.length, 1);
  assert.equal(game.elements.filter((cell) => cell.style.backgroundImage).length, 4);
  game.fades[0].properties.onComplete();
  assert.ok(game.fades[0].target.removed);
});

test('empty input and zero pieces do not start an animation', () => {
  const game = animationHarness();
  game.tetris([], 20, 1);
  game.tetris(['emote'], 0, 1);
  assert.equal(game.elements.length, 1);
  assert.equal(game.timers.length, 0);
});

const rules = loadModule('src/overlay/lib/tetris-game.ts');
const { tetrominos } = loadModule('src/overlay/lib/emotetetris.ts');
const emptyGrid = () => Array.from({ length: 20 }, () => Array(10).fill(null));
const lock = (grid, { piece, x, y }) => {
  piece.forEach((row, dy) => row.forEach((cell, dx) => {
    if (cell) grid[y + dy][x + dx] = 'emote';
  }));
};

test('chooses the rotation and column that clear a four-row well', () => {
  const grid = emptyGrid();
  for (let y = 16; y < 20; y++) grid[y].fill('emote');
  for (let y = 16; y < 20; y++) grid[y][9] = null;
  const before = JSON.stringify(grid);
  const placement = rules.findBestPlacement(grid, 'I');
  assert.equal(JSON.stringify(grid), before, 'planning must not mutate the live board');
  lock(grid, placement);
  assert.equal(rules.completedRows(grid).length, 4);
});

test('clears multiple rows together without deleting surviving rows', () => {
  const grid = emptyGrid();
  grid[16][0] = 'upper';
  grid[18][0] = 'lower';
  grid[17].fill('full');
  grid[19].fill('full');
  const cleared = rules.clearRows(grid, [17, 19]);
  assert.equal(cleared.length, 20);
  assert.equal(cleared[18][0], 'upper');
  assert.equal(cleared[19][0], 'lower');
  assert.ok(cleared[0].every((cell) => cell === null));
  assert.ok(cleared[1].every((cell) => cell === null));
});

test('rejects drops blocked at the ceiling even when there is empty space below', () => {
  const grid = emptyGrid();
  grid[0].fill('emote');
  for (const type of rules.pieceTypes) assert.equal(rules.findBestPlacement(grid, type), null);
});

test('pauses for row explosions, restores cell styles, and finishes after the last clear', () => {
  const game = animationHarness({ random: () => 0.999 }); // Squares fill two rows in five drops.
  game.tetris(['emote'], 5, 1);
  game.drain();
  assert.equal(game.timelines.length, 1);
  assert.equal(game.fades.length, 0);
  const clear = game.timelines[0];
  const cells = clear.steps[0].target;
  assert.equal(cells.length, 20);
  for (const cell of cells) Object.assign(cell.style, { opacity: 0, scale: 1.5 });
  clear.options.onComplete();
  assert.ok(cells.every((cell) => cell.style.opacity === 1 && cell.style.scale === 1));
  assert.equal(game.elements.filter((cell) => cell.style.backgroundImage).length, 0);
  assert.equal(game.timers.length, 0);
  assert.equal(game.fades.length, 1);
});

test('resumes with a new piece after a clear without restoring the locked piece', () => {
  const game = animationHarness({ random: () => 0.999 });
  game.tetris(['first', 'second'], 6, 1);
  game.drain();
  game.timelines[0].options.onComplete();
  assert.equal(game.timers.length, 1);
  game.drain();
  assert.equal(game.timelines.length, 1);
  assert.equal(game.fades.length, 1);
  const occupied = game.elements.filter((cell) => cell.style.backgroundImage);
  assert.equal(occupied.length, 4);
  assert.ok(occupied.every((cell) => cell.style.backgroundImage === 'url(second)'));
});

for (const [name, piece] of [['at', tetrominos.I1], ['above', tetrominos.L2]]) {
  test(`stops and animates game over when a piece locks ${name} the ceiling`, () => {
    let spawns = 0;
    const game = animationHarness({ overrides: {
      '../lib/tetris-game.js': { ...rules, findBestPlacement() {
        spawns++;
        return { piece, x: 0, y: 0 }; // Force a losing column to exercise animation top-out.
      } },
    } });
    game.tetris(['emote'], 50, 1);
    game.drain();
    assert.equal(spawns, name === 'at' ? 5 : 7);
    assert.equal(game.fades.length, 0);
    assert.equal(game.timelines.length, 1);
    assert.equal(game.elements.filter((element) => element.textContent === 'GAME OVER').length, 1);
    game.timelines[0].options.onComplete();
    assert.ok(game.elements.find((element) => element.className === 'tetris-grid').removed);
    assert.equal(game.timers.length, 0);
  });
}

test('no legal placement triggers game over immediately', () => {
  const game = animationHarness({ overrides: {
    '../lib/tetris-game.js': { ...rules, findBestPlacement: () => null },
  } });
  game.tetris(['emote'], 50, 1);
  assert.equal(game.timers.length, 0);
  assert.equal(game.timelines.length, 1);
  assert.ok(game.elements.some((element) => element.textContent === 'GAME OVER'));
});

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function simulate(seed, smart, turns = 50) {
  const types = seededRandom(seed);
  const random = seededRandom(seed + 1000);
  let grid = emptyGrid();
  let lines = 0;
  let placed = 0;
  for (; placed < turns; placed++) {
    const type = rules.pieceTypes[Math.floor(types() * rules.pieceTypes.length)];
    let placement;
    if (smart) placement = rules.findBestPlacement(grid, type);
    else {
      const piece = tetrominos[`${type}${Math.floor(random() * 4) + 1}`];
      const width = Math.max(...piece.map((row) => row.lastIndexOf(1) + 1));
      const x = Math.floor(random() * (11 - width));
      let y = -4;
      while (rules.canPlacePiece(grid, piece, { x, y: y + 1 })) y++;
      placement = rules.isAboveCeiling(piece, { x, y }) ? null : { piece, x, y };
    }
    if (!placement) break;
    // Validate the whole visible fall, not just its landing position.
    for (let y = -4; y <= placement.y; y++) {
      assert.ok(rules.canPlacePiece(grid, placement.piece, { x: placement.x, y }));
    }
    lock(grid, placement);
    const rows = rules.completedRows(grid);
    lines += rows.length;
    grid = rules.clearRows(grid, rows);
    if (grid[0].some(Boolean)) { placed++; break; }
  }
  return { lines, placed };
}

test('seeded games clear substantially more rows than random placement', (context) => {
  const smart = [];
  const random = [];
  for (let seed = 1; seed <= 20; seed++) {
    smart.push(simulate(seed, true));
    random.push(simulate(seed, false));
  }
  const sum = (runs, key) => runs.reduce((total, run) => total + run[key], 0);
  const smartLines = sum(smart, 'lines');
  const randomLines = sum(random, 'lines');
  context.diagnostic(`20 games / 50-piece limit: planned ${smartLines} rows, random ${randomLines}; ` +
    `pieces landed: planned ${sum(smart, 'placed')}, random ${sum(random, 'placed')}`);
  assert.ok(smartLines >= 200);
  assert.ok(smartLines > randomLines + 150);
  assert.ok(sum(smart, 'placed') > sum(random, 'placed'));
});
