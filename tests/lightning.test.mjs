import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

function loadModule(path, globals = {}, overrides = {}, cache = new Map()) {
  const filename = resolve(path);
  if (filename in overrides) return overrides[filename];
  if (cache.has(filename)) return cache.get(filename);
  const exports = {};
  cache.set(filename, exports);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const require = name => {
    if (!name.startsWith('.')) return createRequire(import.meta.url)(name);
    const dependency = resolve(dirname(filename), name.replace(/\.js$/, '.ts'));
    return loadModule(dependency.endsWith('.ts') ? dependency : dependency + '.ts', globals, overrides, cache);
  };
  vm.runInNewContext(source, { exports, require, console, ...globals }, { filename });
  return exports;
}

function seededRandom(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function harness() {
  const queue = new Map(), strokes = [], elements = [];
  let frameId = 0;
  const context = new Proxy({}, { get: (_, key) => key === 'createRadialGradient'
    ? () => ({ addColorStop() {} })
    : key === 'stroke' ? () => strokes.push(true) : () => {}, set: () => true });
  const host = { isConnected: true, getBoundingClientRect: () => ({ width: 1280, height: 720 }), appendChild: element => elements.push(element) };
  const renderer = loadModule('src/overlay/lib/lightning/renderer.ts', {
    window: { devicePixelRatio: 1 },
    Image: class { complete = true; naturalWidth = 32; naturalHeight = 32; },
    document: { createElement: () => ({ style: {}, setAttribute() {}, getBoundingClientRect: () => ({ width: 1280, height: 720 }), getContext: () => context, remove() { this.removed = true; } }) },
    requestAnimationFrame: callback => { queue.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => queue.delete(id),
  });
  const model = loadModule('src/overlay/lib/lightning/model.ts');
  return { ...renderer, ...model, host, elements, strokes, queue, tick(now) {
    const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(callback => callback(now));
  } };
}

test('count scales to bounded strikes and pace rejects invalid extremes', () => {
  const { lightningTiming } = harness();
  for (const [count, strikes] of [[0, 0], [-1, 0], [1, 1], [25, 1], [26, 2], [100, 4], [200, 8], [250, 10], [100000, 10], [NaN, 8], [Infinity, 8]]) {
    assert.equal(lightningTiming(count).strikes, strikes);
  }
  assert.equal(lightningTiming(200).duration, 10000);
  assert.equal(lightningTiming(200, -10).gap, 600);
  assert.equal(lightningTiming(200, Infinity).gap, 700);
  assert.equal(lightningTiming(200, 100000).gap, 1400);
});

test('lightning renders every strike and releases its canvas and RAF', () => {
  const run = harness();
  const plan = run.createLightningPlan();
  run.playLightning(run.host, ['emote-a', 'emote-b'], 200, 50);
  run.tick(0);
  assert.equal(plan.strikes.length, 8);
  for (const { at } of plan.strikes) {
    const before = run.strokes.length;
    run.tick(at + 140);
    assert.ok(run.strokes.length > before, 'each scheduled strike draws its bolt and impact');
  }
  run.tick(plan.timing.duration);
  assert.equal(run.elements.length, 1);
  assert.equal(run.elements[0].removed, true);
  assert.equal(run.queue.size, 0);
});

test('empty emotes, zero count, cancellation, and detached hosts leave no work running', () => {
  const run = harness();
  run.playLightning(run.host, [], 200);
  run.playLightning(run.host, ['emote'], 0);
  assert.equal(run.elements.length, 0);
  const cancel = run.playLightning(run.host, ['emote']);
  cancel(); cancel();
  assert.equal(run.queue.size, 0);
  assert.equal(run.elements[0].removed, true);
  run.playLightning(run.host, ['emote']);
  run.host.isConnected = false;
  run.tick(0);
  assert.equal(run.queue.size, 0);
  assert.equal(run.elements[1].removed, true);
});

test('the zero-height OBS host still renders at the positioned canvas size', () => {
  const run = harness();
  run.host.getBoundingClientRect = () => ({ width: 1280, height: 0 });
  const cancel = run.playLightning(run.host, ['emote']);
  run.tick(0);
  assert.equal(run.elements[0].width, 1280);
  assert.equal(run.elements[0].height, 720);
  cancel();
});

test('the cloud crosses completely offscreen in either direction and strikes stay beneath it', () => {
  const { createLightningPlan, lightningCloudLeft } = harness();
  for (const direction of ['left-to-right', 'right-to-left']) {
    for (const count of [25, 200, 10000]) {
      const plan = Array.from({ length: 16 }, (_, seed) => createLightningPlan(count, 50, seededRandom(seed))).find(plan => plan.direction === direction);
      assert.ok(plan, 'random direction selects either side');
      const { timing, strikes } = plan;
      const first = lightningCloudLeft(0, timing.duration, direction);
      const last = lightningCloudLeft(timing.duration, timing.duration, direction);
      assert.equal(first, direction === 'left-to-right' ? -640 : 1280);
      assert.equal(last, direction === 'left-to-right' ? 1280 : -640);
      let previous = first;
      for (let time = 0; time <= timing.duration; time += 20) {
        const left = lightningCloudLeft(time, timing.duration, direction);
        assert.ok(direction === 'left-to-right' ? left >= previous : left <= previous);
        previous = left;
      }
      for (const strike of strikes) {
        const left = lightningCloudLeft(strike.at, timing.duration, direction);
        assert.ok(strike.cloudX > left + 60 && strike.cloudX < left + 580, 'strike originates under the cloud body');
        assert.equal(strike.points[0].y, 133, 'no vertical entrance or departure');
        assert.ok(strike.at + 650 < timing.duration, 'impacts finish before cloud departs');
      }
    }
  }
});

test('forks remain rare, split from the trunk, stay in bounds, and never cross back', () => {
  const { createLightningPlan } = harness();
  let forked = 0, total = 0;
  for (let seed = 0; seed < 160; seed++) {
    for (const strike of createLightningPlan(200, 50, seededRandom(seed)).strikes) {
      total++;
      const fork = strike.branches.find(branch => branch.ground);
      if (!fork) continue;
      forked++;
      const junction = fork.points[0];
      const index = strike.points.findIndex(point => point.x === junction.x && point.y === junction.y);
      assert.ok(index === 2 || index === 3);
      const side = Math.sign(fork.points[1].x - strike.points[index + 1].x);
      for (let i = 1; i < fork.points.length; i++) {
        const point = fork.points[i], main = strike.points[index + i];
        assert.equal(point.y, main.y);
        assert.ok((point.x - main.x) * side > 24);
      }
      assert.equal(fork.points.at(-1).y, 714);
      assert.ok(Math.abs(fork.points.at(-1).x - strike.x) > 100, 'ground impacts remain visibly separated');
      for (const branch of strike.branches) for (const point of branch.points) {
        assert.ok(point.x >= 32 && point.x <= 1248);
        assert.ok(point.y >= junction.y && point.y <= 714);
      }
      const twig = strike.branches.find(branch => !branch.ground);
      if (twig) for (const point of twig.points.slice(1)) {
        const index = fork.points.findIndex(p => p.y >= point.y);
        const a = fork.points[index - 1], b = fork.points[index];
        const parentX = a.x + (b.x - a.x) * (point.y - a.y) / (b.y - a.y);
        assert.ok((point.x - parentX) * side > 0, 'fine offshoot must not loop across its parent');
        assert.ok(point.y < 714, 'fine offshoot ends in the air');
      }
    }
  }
  assert.ok(forked / total > .1 && forked / total < .2, `fork frequency was ${forked}/${total}`);
});

function applicationHarness() {
  const { defaultConfig, deepMergeSettings } = loadModule('src/shared/defaultConfig.ts');
  // Simulate saved settings predating lightning, with every older animation disabled.
  const animations = Object.fromEntries(Object.keys(defaultConfig.animations)
    .filter(name => name !== 'lightning')
    .map(name => [name, { enabled: false, enabledManual: false, enabledKappagen: false }]));
  const settings = deepMergeSettings({
    animations, enableAllFeatures: false, enableAllAnimations: false,
  }, defaultConfig);
  const calls = [];
  const emote = { name: 'Kappa', imageUrl: 'https://example.test/emote.png' };
  const handlers = loadModule('src/overlay/handlers.ts', {}, {
    [resolve('src/overlay/config.ts')]: { globalVars: {} },
    [resolve('src/overlay/settings.ts')]: { default: { settings } },
    [resolve('src/overlay/animations.ts')]: { default: { lightning: (...args) => calls.push(args) } },
    [resolve('src/overlay/lib/logger.ts')]: { default: { info() {}, warning() {}, error() {} } },
  }).default;
  return { settings, calls, emote, async chat(message, subscriber = true) {
    handlers.chatMessageHandler({ event: { source: 'Twitch', type: 'ChatMessage' }, data: {
      message: { username: 'viewer', userId: '123', message, subscriber, emotes: [emote] },
    } });
    await new Promise(resolve => setImmediate(resolve));
  } };
}

test('existing app settings gain lightning with manual and Kappagen defaults enabled', async () => {
  const app = applicationHarness();
  assert.equal(app.settings.animations.lightning.enabledManual, true);
  assert.equal(app.settings.animations.lightning.enabledKappagen, true);
  await app.chat('!er lightning Kappa');
  assert.equal(app.calls.length, 1);
  assert.deepEqual(Array.from(app.calls[0][0]), [app.emote.imageUrl]);
  assert.deepEqual(app.calls[0].slice(1), [200, 50]);
  app.calls.length = 0;
  await app.chat('!k Kappa');
  assert.equal(app.calls.length, 1, 'the new animation participates in the default Kappagen pool');
});

test('lightning respects command parameters, the global count cap, and enablement settings', async () => {
  const app = applicationHarness();
  await app.chat('!er lightning Kappa 100 75');
  assert.deepEqual(app.calls[0].slice(1), [100, 75]);
  app.settings.maxEmotes = 125;
  await app.chat('!er lightning Kappa 500 50');
  assert.deepEqual(app.calls[1].slice(1), [125, 50]);
  app.calls.length = 0;
  app.settings.animations.lightning.enabledManual = false;
  await app.chat('!er lightning Kappa');
  assert.equal(app.calls.length, 0);
  app.settings.animations.lightning.enabledKappagen = false;
  await app.chat('!k Kappa');
  assert.equal(app.calls.length, 0);
  app.settings.animations.lightning.enabledManual = true;
  app.settings.subOnly = true;
  await app.chat('!er lightning Kappa', false);
  assert.equal(app.calls.length, 0);
});

test('the built-in animation preview dispatches lightning with the configured emotes and pace', async () => {
  const app = applicationHarness();
  const messages = [];
  const { previewAnimation } = loadModule('src/admin/utils/preview-helpers.ts', {
    document: { getElementById: () => ({ contentWindow: { postMessage: message => messages.push(message) } }) },
    console: { log() {} },
  });
  previewAnimation('lightning', app.settings.animations.lightning, app.settings);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, 'PREVIEW_ANIMATION');
  assert.equal(messages[0].animation, 'lightning');
  assert.equal(messages[0].wsdata.data.message.message, '!er lightning 200 50');
  assert.ok(messages[0].wsdata.data.message.emotes.length > 0);
});
