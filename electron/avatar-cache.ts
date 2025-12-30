import type { Express, Request, Response } from "express";

// Avatar cache: stores { url: string, cachedAt: number } keyed by normalized username/id
const avatarCache = new Map<string, { url: string; cachedAt: number }>();
const AVATAR_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Logger callback type - will be set by main.ts
type LogCallback = (type: "info" | "warning" | "error", message: string) => void;
let logCallback: LogCallback = () => {}; // Default no-op

export function setLogCallback(callback: LogCallback): void {
  logCallback = callback;
}

function log(type: "info" | "warning" | "error", message: string): void {
  logCallback(type, message);
  // Also log to console for debugging
  if (type === "error") {
    console.error(`[AvatarCache] ${message}`);
  } else {
    console.log(`[AvatarCache] ${message}`);
  }
}

function isAvatarCacheValid(cachedAt: number): boolean {
  return Date.now() - cachedAt < AVATAR_CACHE_TTL_MS;
}

async function fetchTwitchAvatar(user: string, useId: boolean): Promise<string> {
  let url = `https://decapi.me/twitch/avatar/${encodeURIComponent(user)}`;
  if (useId) {
    url += "?id=true";
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch avatar: ${response.status}`);
  }
  return response.text();
}

export function setupAvatarCacheEndpoint(expressApp: Express): void {
  expressApp.get(
    "/api/twitch-avatar/:user",
    async (req: Request, res: Response) => {
      try {
        const user = req.params.user;
        const useId = req.query.id === "true";

        // Normalize cache key (lowercase username + id flag)
        const cacheKey = `${user.toLowerCase()}:${useId}`;

        // Check cache first
        const cached = avatarCache.get(cacheKey);
        if (cached && isAvatarCacheValid(cached.cachedAt)) {
          log("info", `Avatar cache hit for ${user}`);
          res.json({ avatar: cached.url, cached: true });
          return;
        }

        // Cache miss or expired - fetch from decapi.me
        log("info", `Avatar cache miss for ${user}, fetching from decapi.me`);
        const avatarUrl = await fetchTwitchAvatar(user, useId);

        // Store in cache
        avatarCache.set(cacheKey, {
          url: avatarUrl,
          cachedAt: Date.now(),
        });

        log("info", `Avatar cached for ${user}`);
        res.json({ avatar: avatarUrl, cached: false });
      } catch (error) {
        log("error", `Failed to fetch avatar: ${(error as Error).message}`);
        res.status(500).json({
          error: "Failed to fetch avatar",
          message: (error as Error).message,
        });
      }
    }
  );
}

export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: avatarCache.size,
    entries: Array.from(avatarCache.keys()),
  };
}

