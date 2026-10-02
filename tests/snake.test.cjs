const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Exercise the animation with seeded food placement, a virtual clock, and DOM/GSAP doubles.
// Tween timing is recorded here; visual interpolation is checked in the browser.
function simulate({ seed = 1, count = 20, speed = 75, width = 1920, height = 1080 } = {}) {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const tweens = [];
  const killed = [];
  const logs = [];
  const createElement = () => ({
    style: {}, children: [],
    appendChild(child) { this.children = this.children.filter(item => item !== child); this.children.push(child); },
    remove() { this.removed = true; },
  });
  const warp = createElement();
  function schedule(callback, delay = 0, repeat = false) {
    const id = ++nextId;
    timers.set(id, { callback, at: now + delay, delay, repeat });
    return id;
  }
  function tween(target, vars) {
    for (const element of Array.isArray(target) ? target : [target]) {
      tweens.push({ target: element, vars, at: now, left: parseFloat(element.style.left), top: parseFloat(element.style.top) });
      for (const prop of ['left', 'top']) {
        if (prop in vars) element.style[prop] = `${vars[prop]}px`;
      }
    }
    if (vars.onComplete) schedule(vars.onComplete, ((vars.delay || 0) + (vars.duration || 0)) * 1000);
  }
  const math = Object.create(Math);
  math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const exports = {};
  const source = readFileSync(path.join(__dirname, '../src/overlay/animations/snake.ts'), 'utf8');
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    require(id) {
      if (id === 'gsap') return { gsap: { to: tween, from: tween, set: tween, killTweensOf: target => killed.push(...(Array.isArray(target) ? target : [target])) } };
      if (id.includes('config')) return { globalVars: { warp, divnumber: 0 } };
      if (id.includes('helpers')) return { default: { removeelement: id => warp.children.find(el => el.id === id)?.remove() } };
      throw new Error(`Unexpected import: ${id}`);
    },
    document: { createElement }, window: { innerWidth: width, innerHeight: height }, Math: math,
    console: { log: message => logs.push(message), error() {} },
    setTimeout: schedule, clearTimeout: id => timers.delete(id),
    setInterval: (callback, delay) => schedule(callback, delay, true), clearInterval: id => timers.delete(id),
  });
  exports.snake(['emote.png'], count, speed, 'head.png');
  const container = warp.children[0];
  let steps = 0;
  while (timers.size && !container?.removed && steps++ < 10000) {
    const [id, timer] = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
    now = timer.at;
    if (timer.repeat) timer.at += timer.delay;
    else timers.delete(id);
    timer.callback();
  }
  return { container, tweens, killed, logs, timers, now, steps };
}

test('each meal accelerates subsequent movement without overlapping movement tweens', () => {
  const { container, tweens } = simulate();
  const moves = tweens.filter(t => t.target === container.children[0] && 'left' in t.vars && t.vars.ease === 'none');
  const durations = [...new Set(moves.map(t => t.vars.duration))];
  assert.ok(durations.length >= 4, 'speed must increase across multiple meals');
  for (let i = 1; i < moves.length; i++) {
    assert.ok(moves[i].vars.duration <= moves[i - 1].vars.duration);
    assert.ok(moves[i].at - moves[i - 1].at >= moves[i - 1].vars.duration * 1000 - 0.001);
    assert.ok(moves[i].vars.duration >= 0.035);
  }
});

test('a collision visibly bumps the head, holds the scene, and stops chomping', () => {
  let death;
  for (let seed = 1; seed <= 30 && !death; seed++) {
    const run = simulate({ seed });
    const fade = run.tweens.find(t => t.target === run.container && t.vars.opacity === 0);
    if (fade) death = { ...run, fade };
  }
  assert.ok(death, 'seeded runs should include a collision');
  const head = death.container.children[0];
  assert.ok(death.tweens.some(t => t.target === head && t.at === death.fade.at && ('left' in t.vars || 'x' in t.vars)), 'head must reach the impact');
  assert.ok(death.fade.vars.delay >= 0.9, 'keep collision visible before fading');
  assert.ok(death.fade.vars.delay + death.fade.vars.duration >= 1.2);
  assert.ok(head.children.every(part => death.killed.includes(part)), 'stop looping jaw tweens');
  assert.equal(death.container.removed, true);
  assert.equal(death.timers.size, 0);
});

test('successful runs exit and clean up their timers and jaw animations', () => {
  const { container, timers, killed, tweens } = simulate({ count: 1 });
  assert.equal(container.removed, true);
  assert.equal(timers.size, 0);
  assert.ok(!tweens.some(t => t.target === container && t.vars.opacity === 0));
  assert.ok(container.children[0].children.every(part => killed.includes(part)));
});

test('small viewports and zero-food runs leave no container or active timer', () => {
  for (const options of [{ width: 320, height: 320 }, { count: 0 }]) {
    const { container, timers } = simulate(options);
    assert.ok(!container || container.removed);
    assert.equal(timers.size, 0);
  }
});

test('seeded routes stay in bounds, respect the moving tail, and crash straight ahead', () => {
  let tailPasses = 0;
  let deaths = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const { container, tweens, steps } = simulate({ seed });
    assert.ok(steps < 10000, `seed ${seed} must finish`);
    let body = [{ x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 }];
    let food;
    let direction = { x: 1, y: 0 };
    for (const tween of tweens) {
      if (tween.vars.scale === 0) food = { x: tween.left / 80, y: tween.top / 80 };
      if (tween.target !== container.children[0] || !('left' in tween.vars)) continue;
      const next = { x: tween.vars.left / 80, y: tween.vars.top / 80 };
      if (tween.vars.ease !== 'none') {
        // First impact tween must continue the previous direction, including a clamped wall bump.
        const dx = next.x - body[0].x;
        const dy = next.y - body[0].y;
        assert.ok(Math.abs(dx * direction.y - dy * direction.x) < 0.001, `seed ${seed} turned into its body`);
        assert.ok(dx * direction.x + dy * direction.y >= 0);
        deaths++;
        break;
      }
      assert.ok(next.x >= 0 && next.x < 24 && next.y >= 0 && next.y < 13);
      const move = { x: next.x - body[0].x, y: next.y - body[0].y };
      assert.equal(Math.abs(move.x) + Math.abs(move.y), 1);
      assert.ok(move.x !== -direction.x || move.y !== -direction.y);
      const eating = next.x === food.x && next.y === food.y;
      const tail = body[body.length - 1];
      if (!eating && tail.x === next.x && tail.y === next.y) tailPasses++;
      if (!eating) body.pop();
      assert.ok(!body.some(part => part.x === next.x && part.y === next.y));
      body.unshift(next);
      direction = move;
    }
  }
  assert.ok(deaths > 0);
  assert.ok(tailPasses > 0, 'cover moving into a cell the tail is vacating');
});

test('acceleration stays capped and minimum supported grids terminate', () => {
  let reachedCap = false;
  for (let seed = 1; seed <= 20; seed++) {
    for (const width of [400, 1920]) {
      const { container, tweens, steps, timers } = simulate({ seed, width, speed: 50 });
      assert.ok(steps < 10000);
      assert.equal(timers.size, 0);
      assert.equal(container.removed, true);
      for (const tween of tweens.filter(t => t.target === container.children[0] && t.vars.ease === 'none')) {
        assert.ok(tween.vars.duration >= 0.035);
        reachedCap ||= tween.vars.duration === 0.035;
      }
    }
  }
  assert.ok(reachedCap);
});
