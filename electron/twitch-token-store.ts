import { safeStorage } from "electron";
import fs from "node:fs";
import type { TwitchTokens, TwitchTokenStore } from "./twitch-client";

/** Credentials live in the main process, outside settings and OBS URLs. */
export function createTwitchTokenStore(filePath: string): TwitchTokenStore {
  const requireEncryption = () => {
    if (!safeStorage.isEncryptionAvailable() || (process.platform === "linux" && safeStorage.getSelectedStorageBackend() === "basic_text")) {
      throw new Error("Secure credential storage is unavailable. Enable your system keyring and restart the app to use Twitch login.");
    }
  };
  return {
    load() {
      if (!fs.existsSync(filePath)) return null;
      requireEncryption();
      try { return JSON.parse(safeStorage.decryptString(fs.readFileSync(filePath))); }
      catch { throw new Error("The saved Twitch login could not be read. Log in with Twitch again."); }
    },
    save(tokens: TwitchTokens) {
      requireEncryption();
      const temporaryPath = `${filePath}.tmp`;
      fs.writeFileSync(temporaryPath, safeStorage.encryptString(JSON.stringify(tokens)), { mode: 0o600 });
      fs.renameSync(temporaryPath, filePath);
    },
    clear() { fs.rmSync(filePath, { force: true }); },
  };
}
