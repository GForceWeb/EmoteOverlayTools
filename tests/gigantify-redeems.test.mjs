import assert from "node:assert/strict";
import { after, before, beforeEach, mock, test } from "node:test";
import path from "node:path";
import { createServer } from "vite";

const emoteUrl = "https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/3.0";
const state = {
  calls: [],
  logs: [],
  globalVars: { ws: null },
  settings: {
    features: { gigantifyredeem: { enabled: true } },
    animations: {},
    enableAllFeatures: false,
    streamerBotWebsocketUrl: "ws://localhost:8080/",
  },
};
globalThis.__gigantifyTest = state;

// Keep the real event router and handlers; replace browser rendering and I/O.
const mocks = {
  animations: "({gigantify: images => state.calls.push(images)})",
  settings: "({settings: state.settings})",
  config: "({globalVars: state.globalVars})",
  "lib/logger": "Object.fromEntries(['info', 'warning', 'error'].map(level => [level, message => state.logs.push({level, message})]))",
};
let server;
let websocket;
let previewFeature;

before(async () => {
  mock.method(console, "log", () => {});
  server = await createServer({
    configFile: false,
    cacheDir: "node_modules/.cache/gigantify-tests",
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [{
      name: "gigantify-test-dependencies",
      enforce: "pre",
      resolveId(source, importer) {
        if (!importer || !source.startsWith(".")) return;
        const resolved = path.resolve(path.dirname(importer), source).replaceAll("\\", "/").replace(/\.ts$/, "");
        for (const name of Object.keys(mocks)) {
          if (resolved === `${process.cwd().replaceAll("\\", "/")}/src/overlay/${name}`) {
            return `\0gigantify-test:${name}`;
          }
        }
      },
      load(id) {
        if (!id.startsWith("\0gigantify-test:")) return;
        const name = id.slice("\0gigantify-test:".length);
        return `const state = globalThis.__gigantifyTest; const value = ${mocks[name]}; export default value; ${name === "config" ? "export const globalVars = state.globalVars;" : ""}`;
      },
    }],
  });
  websocket = (await server.ssrLoadModule("/src/overlay/websocket.ts")).default;
  ({ previewFeature } = await server.ssrLoadModule("/src/admin/utils/preview-helpers.ts"));
});

beforeEach(() => {
  state.calls.length = 0;
  state.logs.length = 0;
  state.settings.features.gigantifyredeem.enabled = true;
  state.settings.enableAllFeatures = false;
});

after(async () => {
  await server?.close();
  mock.restoreAll();
  delete globalThis.__gigantifyTest;
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.WebSocket;
});

function redeem(type, data, source = "Twitch") {
  websocket.handleMessage(JSON.stringify({ event: { source, type }, data }));
}

test("subscribes to current and legacy redemption events", () => {
  const requests = [];
  globalThis.window = { WebSocket: true };
  globalThis.WebSocket = class {
    static OPEN = 1;
    static CONNECTING = 0;
    send(message) { requests.push(JSON.parse(message)); }
  };
  websocket.connectws();
  state.globalVars.ws.onopen();
  const events = requests.find(request => request.request === "Subscribe").events.Twitch;
  assert.ok(events.includes("AutomaticRewardRedemption"));
  assert.ok(events.includes("PowerUpRedemption"));
});

test("routes current Streamer.bot power-ups to gigantify", () => {
  // https://docs.streamer.bot/api/websocket/events/twitch/power-up-redemption
  redeem("PowerUpRedemption", { type: "gigantify_an_emote", emote: { imageUrl: emoteUrl, text: "Kappa" } });
  assert.deepEqual(state.calls, [[emoteUrl]]);
});

test("accepts legacy snake_case redemptions", () => {
  redeem("AutomaticRewardRedemption", { reward_type: "gigantify_an_emote", gigantified_emote: { imageUrl: emoteUrl } });
  assert.deepEqual(state.calls, [[emoteUrl]]);
});

test("accepts legacy camelCase and nested reward payloads", () => {
  for (const data of [
    { rewardType: "gigantify_an_emote", gigantifiedEmoteUrl: emoteUrl },
    { rewardType: "gigantify_an_emote", gigantifiedEmote: { imageUrl: emoteUrl } },
    { reward: { type: "gigantify_an_emote" }, emote: { url: emoteUrl } },
  ]) redeem("AutomaticRewardRedemption", data);
  assert.deepEqual(state.calls, [[emoteUrl], [emoteUrl], [emoteUrl]]);
});

test("ignores other power-ups and incomplete redemption payloads", () => {
  for (const data of [undefined, null, {}, { type: "celebration", emote: { imageUrl: emoteUrl } }, { type: "gigantify_an_emote" }, { type: "gigantify_an_emote", emote: { imageUrl: 25 } }]) {
    redeem("PowerUpRedemption", data);
  }
  assert.deepEqual(state.calls, []);
  assert.ok(state.logs.some(log => log.level === "warning" && log.message.includes("missing emote URL")));
});

test("respects the feature toggle and allows admin previews", () => {
  state.settings.features.gigantifyredeem.enabled = false;
  const data = { type: "gigantify_an_emote", emote: { imageUrl: emoteUrl } };
  redeem("PowerUpRedemption", data);
  assert.deepEqual(state.calls, []);
  redeem("PowerUpRedemption", data, "Admin");
  state.settings.enableAllFeatures = true;
  redeem("PowerUpRedemption", data);
  assert.deepEqual(state.calls, [[emoteUrl], [emoteUrl]]);
});

test("admin preview exercises the current power-up payload", () => {
  let preview;
  globalThis.document = { getElementById: () => ({ contentWindow: { postMessage: message => { preview = message; } } }) };
  previewFeature("gigantifyredeem", {}, { ...state.settings, previewEmotes: [{ name: "Kappa", imageUrl: emoteUrl }] });
  assert.equal(preview.wsdata.event.type, "PowerUpRedemption");
  assert.equal(preview.wsdata.data.type, "gigantify_an_emote");
  websocket.handleMessage(JSON.stringify(preview.wsdata));
  assert.deepEqual(state.calls, [[emoteUrl]]);
});
