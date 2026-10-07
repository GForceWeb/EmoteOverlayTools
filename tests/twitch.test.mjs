import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { after, before, test } from "node:test";
import { createServer } from "vite";

let server;
let TwitchClient;
let TwitchEventMapper;
let twitchSubscriptions;
let TWITCH_SCOPES;
let normalizeChatEventData;
let defaultConfig;
let deepMergeSettings;

before(async () => {
  server = await createServer({
    configFile: false, cacheDir: "node_modules/.cache/twitch-tests",
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  ({ TwitchClient } = await server.ssrLoadModule("/electron/twitch-client.ts"));
  ({ TwitchEventMapper } = await server.ssrLoadModule("/src/shared/twitchEvents.ts"));
  ({ TWITCH_SCOPES, twitchSubscriptions } = await server.ssrLoadModule("/src/shared/twitch.ts"));
  ({ normalizeChatEventData } = await server.ssrLoadModule("/src/shared/streamerbotChat.ts"));
  ({ defaultConfig, deepMergeSettings } = await server.ssrLoadModule("/src/shared/defaultConfig.ts"));
});
after(async () => server?.close());

const flush = async () => { for (let i = 0; i < 80; i++) await Promise.resolve(); };
const tokenData = { access_token: "access-one", refresh_token: "refresh-one", expires_in: 14400 };
const savedTokens = () => ({ accessToken: "old-access", refreshToken: "old-refresh", expiresAt: Date.now() + 1000000, clientId: "test-client" });
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });

class FakeSocket extends EventEmitter {
  closed = false;
  close() { if (!this.closed) { this.closed = true; this.emit("close"); } }
  terminate() { this.close(); }
  message(type, payload, id = type) {
    this.emit("message", Buffer.from(JSON.stringify({ metadata: { message_type: type, message_id: id }, payload })));
  }
  welcome(id = "session-1") { this.message("session_welcome", { session: { id, keepalive_timeout_seconds: 30 } }); }
  notify(type, event, id) { this.message("notification", { subscription: { type }, event }, id); }
}

function fixture(t, options = {}) {
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  const requests = [];
  const sockets = [];
  const events = [];
  const statuses = [];
  const writes = [];
  let stored = options.tokens ?? null;
  const client = new TwitchClient({
    clientId: options.clientId ?? "test-client",
    store: {
      load: () => stored,
      save: tokens => { writes.push(tokens); stored = tokens; },
      clear: () => { stored = null; },
    },
    onEvent: event => events.push(event), onStatus: status => statuses.push(status),
    createSocket: url => { const socket = new FakeSocket(); socket.url = url; sockets.push(socket); return socket; },
    fetch: async (url, init = {}) => {
      requests.push({ url, init });
      const override = await options.respond?.(url, init);
      if (override) return override;
      if (url.endsWith("/device")) return response({ device_code: "private-device-code", user_code: "VISIBLE", verification_uri: "https://www.twitch.tv/activate?device-code=VISIBLE", expires_in: 1800, interval: 5 });
      if (url.endsWith("/token")) return response(tokenData);
      if (url.endsWith("/validate")) return response({ client_id: "test-client", user_id: "123", login: "broadcaster", scopes: TWITCH_SCOPES });
      if (url.includes("/users?")) return response({ data: [{ profile_image_url: "https://example.com/avatar.png" }] });
      return response({ data: [] }, 202);
    },
  });
  t.after(() => client.stop());
  return { client, requests, sockets, events, statuses, writes, stored: () => stored };
}

test("old settings retain Streamer.Bot mode and animation preferences", () => {
  const settings = deepMergeSettings({ twitchUsername: "existing", maxEmotes: 75 }, defaultConfig);
  assert.equal(settings.connectionMode, "streamerbot");
  assert.equal(settings.maxEmotes, 75);
});

test("subscriptions use the logged-in broadcaster and current event versions", () => {
  const subscriptions = twitchSubscriptions("123");
  assert.deepEqual(subscriptions.find(s => s.type === "channel.chat.message").condition, { broadcaster_user_id: "123", user_id: "123" });
  assert.deepEqual(subscriptions.find(s => s.type === "channel.raid").condition, { to_broadcaster_user_id: "123" });
  assert.equal(subscriptions.find(s => s.type === "channel.hype_train.progress").version, "2");
  assert.ok(subscriptions.some(s => s.type === "channel.bits.use"));
});

const chat = (overrides = {}) => ({
  broadcaster_user_id: "123", chatter_user_id: "42", chatter_user_login: "viewer", chatter_user_name: "Viewer",
  badges: [{ set_id: "subscriber" }],
  message: { text: "!er rain Kappa", fragments: [{ type: "text", text: "!er rain " }, { type: "emote", text: "Kappa", emote: { id: "25" } }] },
  ...overrides,
});

test("chat fragments preserve emote positions and subscriber status for existing handlers", () => {
  const mapper = new TwitchEventMapper();
  const mapped = mapper.map("channel.chat.message", chat());
  assert.deepEqual(mapped.map(m => m.event.type), ["FirstWord", "ChatMessage"]);
  const normalized = normalizeChatEventData(mapped[1].data);
  assert.equal(normalized.message, "!er rain Kappa");
  assert.equal(normalized.subscriber, true);
  assert.equal(normalized.emotes[0].begin, 9);
  assert.equal(normalized.emotes[0].end, 13);
  assert.match(normalized.emotes[0].imageUrl, /\/25\/default\/dark\/3.0$/);
  assert.equal(mapper.map("channel.chat.message", chat()).length, 1);
  mapper.map("stream.online", {});
  assert.equal(mapper.map("channel.chat.message", chat()).length, 2);
});

test("founders and broadcasters pass subscriber gates; ordinary viewers do not", () => {
  for (const set_id of ["founder", "broadcaster", "subscriber", "moderator"]) {
    const result = new TwitchEventMapper().map("channel.chat.message", chat({ badges: [{ set_id }] }));
    assert.equal(normalizeChatEventData(result[1].data).subscriber, set_id !== "moderator");
  }
});

test("shared-chat messages from another broadcaster are ignored", () => {
  assert.deepEqual(new TwitchEventMapper().map("channel.chat.message", chat({ source_broadcaster_user_id: "other" })), []);
});

test("Bits and automatic reward Gigantify events supply usable emote URLs", () => {
  const mapper = new TwitchEventMapper();
  const powerUp = mapper.map("channel.bits.use", { user_login: "viewer", power_up: { type: "gigantify_an_emote", emote: { id: "25" } } });
  assert.deepEqual(powerUp.map(m => m.event.type), ["Cheer", "PowerUpRedemption"]);
  assert.match(powerUp[1].data.emote.imageUrl, /\/25\/default/);
  const redeem = mapper.map("channel.channel_points_automatic_reward_redemption.add", { reward: { type: "gigantify_an_emote", emote: { id: "25" } } });
  assert.equal(redeem[0].data.reward_type, "gigantify_an_emote");
});

test("raids, subscriptions, resubs and gifts match overlay event types", () => {
  const mapper = new TwitchEventMapper();
  for (const [type, mappedType] of [["channel.raid", "Raid"], ["channel.subscribe", "Sub"], ["channel.subscription.message", "Resub"], ["channel.subscription.gift", "GiftBomb"]]) {
    assert.equal(mapper.map(type, { user_login: "viewer" })[0].event.type, mappedType);
  }
  assert.deepEqual(mapper.map("channel.subscribe", { is_gift: true }), []);
  assert.deepEqual(mapper.map("channel.subscription.gift", { is_anonymous: true }), []);
});

test("Hype Train progress arriving before begin starts once, handles level jumps and contributors", () => {
  const mapper = new TwitchEventMapper();
  const event = { id: "train", level: 3, top_contributions: [{ user_id: "42", user_login: "viewer", total: 100, type: "bits" }] };
  const progress = mapper.map("channel.hype_train.progress", event);
  assert.deepEqual(progress.map(m => m.event.type), ["HypeTrainStart", "HypeTrainLevelUp", "HypeTrainLevelUp", "HypeTrainUpdate"]);
  assert.equal(progress[3].data.last_contribution.user_id, "viewer");
  assert.deepEqual(mapper.map("channel.hype_train.begin", event), []);
  assert.equal(mapper.map("channel.bits.use", { user_login: "another-viewer" })[1].event.type, "HypeTrainUpdate");
  assert.equal(mapper.map("channel.hype_train.end", { id: "train" })[0].event.type, "HypeTrainEnd");
  assert.deepEqual(mapper.map("channel.hype_train.end", { id: "train" }), []);
});

test("login needs a configured Client ID and direct mode", async t => {
  const { client } = fixture(t, { clientId: "" });
  await assert.rejects(client.startLogin(), /Choose direct Twitch mode/);
  await client.setEnabled(true);
  await assert.rejects(client.startLogin(), /TWITCH_CLIENT_ID/);
});

test("device login polls, persists tokens, validates, subscribes and keeps credentials out of status", async t => {
  const f = fixture(t);
  await f.client.setEnabled(true);
  const status = await f.client.startLogin();
  assert.equal(status.userCode, "VISIBLE");
  assert.doesNotMatch(JSON.stringify(status), /private-device-code/);
  assert.equal(f.sockets.length, 0);
  t.mock.timers.tick(5000);
  await flush();
  assert.equal(f.writes.length, 1);
  assert.equal(f.client.getStatus().username, "broadcaster");
  f.sockets[0].welcome();
  await flush();
  assert.equal(f.client.getStatus().state, "connected");
  const subscribed = f.requests.filter(r => r.url.includes("eventsub/subscriptions"));
  assert.equal(subscribed.length, twitchSubscriptions("123").length);
  assert.equal(JSON.parse(subscribed[0].init.body).transport.session_id, "session-1");
  assert.equal(f.requests.some(r => String(r.init.body).includes("client_secret")), false);
  assert.doesNotMatch(JSON.stringify(f.statuses), /access-one|refresh-one|private-device-code/);
});

test("pending and slow-down login responses respect the poll interval", async t => {
  let polls = 0;
  const f = fixture(t, { respond: (url) => url.endsWith("/token") && ++polls < 3 ? response({ message: polls === 1 ? "authorization_pending" : "slow_down" }, 400) : undefined });
  await f.client.setEnabled(true);
  await f.client.startLogin();
  t.mock.timers.tick(5000); await flush();
  assert.equal(polls, 1);
  t.mock.timers.tick(5000); await flush();
  assert.equal(polls, 2);
  t.mock.timers.tick(9999); await flush();
  assert.equal(polls, 2);
  t.mock.timers.tick(1); await flush();
  assert.equal(polls, 3);
  assert.equal(f.writes.length, 1);
});

test("cancelling pending login stops polling and clears the login code", async t => {
  const f = fixture(t);
  await f.client.setEnabled(true);
  await f.client.startLogin();
  await f.client.disconnect();
  t.mock.timers.tick(60000); await flush();
  assert.equal(f.requests.filter(r => r.url.endsWith("/token")).length, 0);
  assert.equal(f.client.getStatus().userCode, undefined);
  assert.equal(f.stored(), null);
});

test("a late login response cannot restore credentials after disconnect", async t => {
  let finish;
  const f = fixture(t, { respond: url => url.endsWith("/token") ? new Promise(resolve => { finish = resolve; }) : undefined });
  await f.client.setEnabled(true);
  await f.client.startLogin();
  t.mock.timers.tick(5000); await flush();
  await f.client.disconnect();
  finish(response(tokenData)); await flush();
  assert.equal(f.writes.length, 0);
  assert.equal(f.sockets.length, 0);
});

test("optional event permission failures leave chat connected with visible warnings", async t => {
  const f = fixture(t, { tokens: savedTokens(), respond: (url, init) => {
    if (url.includes("eventsub/subscriptions") && JSON.parse(init.body).type === "channel.subscribe") return response({ message: "Channel is not an affiliate" }, 403);
  } });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  assert.equal(f.client.getStatus().state, "connected");
  assert.equal(f.client.getStatus().warnings.length, 1);
});

test("chat permission failures close EventSub and never report connected", async t => {
  const f = fixture(t, { tokens: savedTokens(), respond: url => url.includes("eventsub/subscriptions") ? response({ message: "Missing chat permission" }, 403) : undefined });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  assert.equal(f.client.getStatus().state, "error");
  assert.equal(f.sockets[0].closed, true);
  assert.equal(f.statuses.some(s => s.state === "connected"), false);
});

test("duplicate notification IDs are delivered only once", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  f.sockets[0].notify("channel.chat.message", chat(), "message-1");
  f.sockets[0].notify("channel.chat.message", chat(), "message-1");
  assert.deepEqual(f.events.map(e => e.event.type), ["FirstWord", "ChatMessage"]);
});

test("Twitch reconnect transfers subscriptions after welcome and avoids resubscribing", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  const first = f.sockets[0]; first.welcome(); await flush();
  const count = f.requests.length;
  first.message("session_reconnect", { session: { reconnect_url: "wss://eventsub.wss.twitch.tv/reconnect" } });
  assert.equal(first.closed, false);
  f.sockets[1].welcome("transferred"); await flush();
  assert.equal(first.closed, true);
  assert.equal(f.requests.length, count);
  t.mock.timers.tick(1000); await flush();
  assert.equal(f.sockets.length, 2);
});

test("unexpected close reconnects and resubscribes while retaining first-message state", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  f.sockets[0].notify("channel.chat.message", chat(), "one");
  f.sockets[0].close();
  t.mock.timers.tick(1000); await flush();
  f.sockets[1].welcome("new-session"); await flush();
  f.sockets[1].notify("channel.chat.message", chat(), "two");
  assert.deepEqual(f.events.map(e => e.event.type), ["FirstWord", "ChatMessage", "ChatMessage"]);
  assert.equal(f.requests.filter(r => r.url.includes("eventsub/subscriptions")).length, twitchSubscriptions("123").length * 2);
});

test("keepalive watchdog reconnects an unresponsive socket", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  t.mock.timers.tick(35000); await flush();
  assert.equal(f.sockets[0].closed, true);
  t.mock.timers.tick(1000); await flush();
  assert.equal(f.sockets.length, 2);
});

test("expired credentials rotate once before validation and use the new access token", async t => {
  const f = fixture(t, { tokens: { ...savedTokens(), expiresAt: 0 } });
  await f.client.setEnabled(true);
  assert.equal(f.writes[0].refreshToken, "refresh-one");
  assert.equal(f.requests.find(r => r.url.endsWith("/validate")).init.headers.Authorization, "OAuth access-one");
});

test("mode changes during a refresh preserve the rotated token without reconnecting", async t => {
  let finish;
  const f = fixture(t, { tokens: { ...savedTokens(), expiresAt: 0 }, respond: url => url.endsWith("/token") ? new Promise(resolve => { finish = resolve; }) : undefined });
  const connecting = f.client.setEnabled(true); await flush();
  await f.client.setEnabled(false);
  finish(response(tokenData)); await connecting;
  assert.equal(f.stored().refreshToken, "refresh-one");
  assert.equal(f.sockets.length, 0);
  assert.equal(f.client.getStatus().state, "disconnected");
});

test("disconnect during refresh does not restore rotated credentials", async t => {
  let finish;
  const f = fixture(t, { tokens: { ...savedTokens(), expiresAt: 0 }, respond: url => url.endsWith("/token") ? new Promise(resolve => { finish = resolve; }) : undefined });
  const connecting = f.client.setEnabled(true); await flush();
  await f.client.disconnect();
  finish(response(tokenData)); await connecting;
  assert.equal(f.stored(), null);
  assert.equal(f.sockets.length, 0);
});

test("switching to Streamer.Bot closes EventSub and ignores late notifications", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  await f.client.setEnabled(false);
  f.sockets[0].notify("channel.chat.message", chat(), "late");
  t.mock.timers.tick(60000); await flush();
  assert.equal(f.events.length, 0);
  assert.equal(f.sockets.length, 1);
  assert.ok(f.stored());
});

test("authorization revocation stops EventSub and asks the user to log in again", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  f.sockets[0].message("revocation", { subscription: { type: "channel.chat.message", status: "authorization_revoked" } });
  assert.equal(f.client.getStatus().state, "error");
  assert.match(f.client.getStatus().error, /revoked/);
  assert.equal(f.sockets[0].closed, true);
});

test("chat revocation for another reason cannot leave a misleading Connected status", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  f.sockets[0].welcome(); await flush();
  f.sockets[0].message("revocation", { subscription: { type: "channel.chat.message", status: "version_removed" } });
  assert.equal(f.client.getStatus().state, "error");
  assert.match(f.client.getStatus().error, /stopped sending chat/);
});

test("temporary Twitch API errors retry the connection with a fresh session", async t => {
  let attempts = 0;
  const f = fixture(t, { tokens: savedTokens(), respond: url => {
    if (url.endsWith("/validate") && ++attempts === 1) return response({ message: "Service unavailable" }, 503);
  } });
  await f.client.setEnabled(true);
  assert.equal(f.client.getStatus().state, "connecting");
  t.mock.timers.tick(1000); await flush();
  assert.equal(attempts, 2);
  assert.equal(f.sockets.length, 1);
  f.sockets[0].welcome(); await flush();
  assert.equal(f.client.getStatus().state, "connected");
});

test("validation rejects tokens from a different Twitch application", async t => {
  const f = fixture(t, { tokens: savedTokens(), respond: url => url.endsWith("/validate") ? response({ client_id: "other-client", user_id: "123", scopes: TWITCH_SCOPES }) : undefined });
  await f.client.setEnabled(true);
  assert.equal(f.client.getStatus().state, "error");
  assert.equal(f.sockets.length, 0);
});

test("401 responses refresh and retry validation with the rotated access token", async t => {
  let validations = 0;
  const f = fixture(t, { tokens: savedTokens(), respond: url => url.endsWith("/validate") && ++validations === 1 ? response({ message: "Invalid OAuth token" }, 401) : undefined });
  await f.client.setEnabled(true);
  assert.equal(validations, 2);
  assert.equal(f.requests.filter(r => r.url.endsWith("/token")).length, 1);
  assert.equal(f.stored().accessToken, "access-one");
});

test("direct avatar lookup uses Helix with credentials only in main-process request headers", async t => {
  const f = fixture(t, { tokens: savedTokens() });
  await f.client.setEnabled(true);
  assert.equal(await f.client.getAvatar("viewer", false), "https://example.com/avatar.png");
  const request = f.requests.find(r => r.url.includes("/users?"));
  assert.equal(request.url, "https://api.twitch.tv/helix/users?login=viewer");
  assert.doesNotMatch(request.url, /old-access/);
});
