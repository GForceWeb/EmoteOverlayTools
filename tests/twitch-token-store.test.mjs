import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createServer } from "vite";

let server;
let createTwitchTokenStore;
let directory;
let encryptionAvailable = true;
const key = randomBytes(32);
const iv = randomBytes(16);
const tokens = { clientId: "test-client", accessToken: "private-access", refreshToken: "private-refresh", expiresAt: 12345678 };

// Exercise real file persistence, replacing only the operating-system keyring.
globalThis.__twitchStoreEncryption = {
  isEncryptionAvailable: () => encryptionAvailable,
  getSelectedStorageBackend: () => "test_keyring",
  encryptString(value) {
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  },
  decryptString(value) {
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([decipher.update(value), decipher.final()]).toString("utf8");
  },
};

before(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), "eot-twitch-store-"));
  server = await createServer({
    configFile: false, cacheDir: "node_modules/.cache/twitch-store-tests",
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    ssr: { noExternal: ["electron"] },
    plugins: [{
      name: "twitch-store-keyring",
      enforce: "pre",
      resolveId(source) { if (source === "electron") return "\0test-keyring"; },
      load(id) { if (id === "\0test-keyring") return "export const safeStorage = globalThis.__twitchStoreEncryption;"; },
    }],
  });
  ({ createTwitchTokenStore } = await server.ssrLoadModule("/electron/twitch-token-store.ts"));
});
beforeEach(() => { encryptionAvailable = true; });
after(async () => {
  await server?.close();
  fs.rmSync(directory, { recursive: true, force: true });
  delete globalThis.__twitchStoreEncryption;
});

test("credential files are encrypted, can be rotated, and are deleted on disconnect", () => {
  const file = path.join(directory, "credentials.bin");
  const store = createTwitchTokenStore(file);
  assert.equal(store.load(), null);
  store.save(tokens);
  assert.doesNotMatch(fs.readFileSync(file).toString(), /private-access|private-refresh/);
  assert.deepEqual(store.load(), tokens);
  store.save({ ...tokens, refreshToken: "rotated-refresh" });
  assert.equal(store.load().refreshToken, "rotated-refresh");
  assert.equal(fs.existsSync(`${file}.tmp`), false);
  store.clear();
  assert.equal(fs.existsSync(file), false);
});

test("an unavailable keyring never writes plaintext credentials", () => {
  const file = path.join(directory, "unavailable.bin");
  encryptionAvailable = false;
  assert.throws(() => createTwitchTokenStore(file).save(tokens), /Secure credential storage is unavailable/);
  assert.equal(fs.existsSync(file), false);
});

test("damaged credentials give a login recovery message", () => {
  const file = path.join(directory, "damaged.bin");
  fs.writeFileSync(file, "damaged");
  assert.throws(() => createTwitchTokenStore(file).load(), /Log in with Twitch again/);
});
