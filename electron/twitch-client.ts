import WebSocket from "ws";
import { TWITCH_SCOPES, twitchSubscriptions, type TwitchStatus } from "../src/shared/twitch";
import { TwitchEventMapper } from "../src/shared/twitchEvents";
import type { WSData } from "../src/shared/types";

export interface TwitchTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  clientId: string;
}

export interface TwitchTokenStore {
  load(): TwitchTokens | null;
  save(tokens: TwitchTokens): void;
  clear(): void;
}

interface Options {
  clientId: string;
  store: TwitchTokenStore;
  onEvent: (event: WSData) => void;
  onStatus: (status: TwitchStatus) => void;
  fetch?: typeof fetch;
  createSocket?: (url: string) => WebSocket;
}

class TwitchRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const EVENTSUB_URL = "wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30";

export class TwitchClient {
  private status: TwitchStatus;
  private tokens: TwitchTokens | null = null;
  private userId = "";
  private enabled = false;
  private generation = 0;
  private credentialGeneration = 0;
  private sockets = new Set<WebSocket>();
  private activeSocket: WebSocket | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private validationTimer?: ReturnType<typeof setInterval>;
  private refreshPromise: Promise<void> | null = null;
  private reconnectScheduled = false;
  private retryCount = 0;
  private messageIds = new Set<string>();
  private mapper = new TwitchEventMapper();
  private request: typeof fetch;

  constructor(private options: Options) {
    this.request = options.fetch ?? fetch;
    this.status = { configured: !!options.clientId, state: "disconnected", warnings: [] };
  }

  getStatus(): TwitchStatus {
    return { ...this.status, warnings: [...this.status.warnings] };
  }

  private update(patch: Partial<TwitchStatus>): void {
    this.status = { ...this.status, ...patch };
    this.options.onStatus(this.getStatus());
  }

  private later(callback: () => void, ms: number): void {
    const timer = setTimeout(() => { this.timers.delete(timer); callback(); }, ms);
    this.timers.add(timer);
  }

  private async json(url: string, init?: RequestInit): Promise<any> {
    const response = await this.request(url, { ...init, signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok) throw new TwitchRequestError(response.status, data.message || data.error || `Twitch request failed (${response.status})`);
    return data;
  }

  private oauth(endpoint: string, params: Record<string, string>) {
    return this.json(`https://id.twitch.tv/oauth2/${endpoint}`, {
      method: "POST", body: new URLSearchParams({ client_id: this.options.clientId, ...params }),
    });
  }

  private saveTokens(data: any, generation: number): void {
    if (generation !== this.generation) return;
    if (!data.access_token || !data.refresh_token || !data.expires_in) throw new Error("Twitch returned an incomplete login response.");
    const tokens: TwitchTokens = {
      accessToken: data.access_token, refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000, clientId: this.options.clientId,
    };
    // Public-client refresh tokens rotate on every refresh. Persist before using.
    this.options.store.save(tokens);
    this.tokens = tokens;
  }

  private async refresh(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;
    const credentialGeneration = this.credentialGeneration;
    const refreshToken = this.tokens?.refreshToken;
    if (!refreshToken) throw new Error("Log in with Twitch to connect your channel.");
    const promise = this.oauth("token", { grant_type: "refresh_token", refresh_token: refreshToken })
      .then(data => {
        // A mode switch can happen during refresh. Keep rotated credentials,
        // but never restore credentials after disconnect or another login.
        if (credentialGeneration === this.credentialGeneration) this.saveTokens(data, this.generation);
      });
    this.refreshPromise = promise;
    try { await promise; } finally { if (this.refreshPromise === promise) this.refreshPromise = null; }
  }

  private async validate(generation: number): Promise<void> {
    if (!this.tokens) throw new Error("Log in with Twitch to connect your channel.");
    if (this.tokens.expiresAt < Date.now() + 60000) await this.refresh();
    if (generation !== this.generation) return;
    const getValidation = () => this.json("https://id.twitch.tv/oauth2/validate", {
      headers: { Authorization: `OAuth ${this.tokens!.accessToken}` },
    });
    let data;
    try { data = await getValidation(); } catch (error) {
      if (!(error instanceof TwitchRequestError) || error.status !== 401) throw error;
      await this.refresh();
      if (generation !== this.generation) return;
      data = await getValidation();
    }
    if (generation !== this.generation) return;
    if (data.client_id !== this.options.clientId || !data.user_id) throw new Error("This Twitch login belongs to another application. Log in again.");
    if (!data.scopes?.includes("user:read:chat")) throw new Error("Chat access was not granted. Log in with Twitch again.");
    this.userId = data.user_id;
    this.update({ username: data.login });
  }

  private async helix(endpoint: string, init?: RequestInit): Promise<any> {
    const generation = this.generation;
    if (!this.tokens) throw new Error("Log in with Twitch to connect your channel.");
    if (this.tokens.expiresAt < Date.now() + 60000) await this.refresh();
    const send = () => this.json(`https://api.twitch.tv/helix/${endpoint}`, {
      ...init, headers: { ...init?.headers, "Client-Id": this.options.clientId, Authorization: `Bearer ${this.tokens!.accessToken}`, "Content-Type": "application/json" },
    });
    if (generation !== this.generation) throw new Error("Twitch connection changed.");
    try { return await send(); } catch (error) {
      if (!(error instanceof TwitchRequestError) || error.status !== 401) throw error;
      await this.refresh();
      if (generation !== this.generation) throw new Error("Twitch connection changed.");
      return send();
    }
  }

  async getAvatar(user: string, useId: boolean): Promise<string> {
    const result = await this.helix(`users?${useId ? "id" : "login"}=${encodeURIComponent(user)}`);
    if (!result.data?.[0]?.profile_image_url) throw new Error("Twitch user was not found.");
    return result.data[0].profile_image_url;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    if (this.enabled === enabled) return;
    this.stop();
    this.enabled = enabled;
    if (!enabled || !this.options.clientId) return;
    const generation = this.generation;
    try {
      this.tokens = this.options.store.load();
      if (this.tokens?.clientId !== this.options.clientId) this.tokens = null;
      if (!this.tokens) return;
      await this.connect(generation);
    } catch (error) { this.connectionFailure(error, generation); }
  }

  async startLogin(): Promise<TwitchStatus> {
    if (!this.enabled) throw new Error("Choose direct Twitch mode first.");
    if (!this.options.clientId) throw new Error("Set TWITCH_CLIENT_ID in .env and rebuild the app to enable Twitch login.");
    this.stop();
    this.credentialGeneration++;
    this.refreshPromise = null;
    this.enabled = true;
    const generation = this.generation;
    this.update({ state: "connecting", error: undefined, username: undefined, warnings: [] });
    try {
      const data = await this.oauth("device", { scopes: TWITCH_SCOPES.join(" ") });
      if (generation !== this.generation) return this.getStatus();
      const uri = new URL(data.verification_uri);
      if (uri.protocol !== "https:" || uri.hostname !== "www.twitch.tv") throw new Error("Twitch returned an invalid login URL.");
      this.update({ userCode: data.user_code, verificationUri: uri.toString() });
      this.pollLogin(data.device_code, Date.now() + data.expires_in * 1000, Math.max(data.interval ?? 5, 1) * 1000, generation);
      return this.getStatus();
    } catch (error) { this.fail(error, generation); throw error; }
  }

  private pollLogin(code: string, deadline: number, interval: number, generation: number): void {
    this.later(() => {
      if (generation !== this.generation) return;
      if (Date.now() >= deadline) { this.fail(new Error("Twitch login expired. Try logging in again."), generation); return; }
      void this.oauth("token", { grant_type: "urn:ietf:params:oauth:grant-type:device_code", device_code: code, scopes: TWITCH_SCOPES.join(" ") })
        .then(async data => {
          if (generation !== this.generation) return;
          this.saveTokens(data, generation);
          this.update({ userCode: undefined, verificationUri: undefined });
          await this.connect(generation);
        }).catch(error => {
          if (generation !== this.generation) return;
          if (error.message === "authorization_pending") this.pollLogin(code, deadline, interval, generation);
          else if (error.message === "slow_down" || error.status === 429) this.pollLogin(code, deadline, interval + 5000, generation);
          else this.fail(new Error(error.message === "access_denied" ? "Twitch login was declined. Try again when ready." : error.message), generation);
        });
    }, interval);
  }

  private async connect(generation: number): Promise<void> {
    this.update({ state: "connecting", error: undefined, warnings: [] });
    await this.validate(generation);
    if (generation !== this.generation || !this.enabled) return;
    if (!this.validationTimer) {
      this.validationTimer = setInterval(() => {
        void this.validate(generation).catch(error => this.connectionFailure(error, generation));
      }, 60 * 60 * 1000);
    }
    this.openSocket(EVENTSUB_URL, generation);
  }

  private openSocket(url: string, generation: number, previous?: WebSocket): void {
    const socket = this.options.createSocket?.(url) ?? new WebSocket(url, { handshakeTimeout: 15000 });
    this.sockets.add(socket);
    let watchdog: ReturnType<typeof setTimeout>;
    let welcomed = false;
    let keepalive = 30000;
    const armWatchdog = () => {
      clearTimeout(watchdog);
      watchdog = setTimeout(() => socket.terminate(), keepalive + 5000);
    };
    armWatchdog();
    socket.on("error", () => { /* close handles reconnect; never log token-bearing requests */ });
    socket.on("close", () => {
      clearTimeout(watchdog);
      const tracked = this.sockets.delete(socket);
      if (!tracked || generation !== this.generation || !this.enabled) return;
      if (this.activeSocket === socket) this.activeSocket = null;
      if (!this.activeSocket || !welcomed) this.scheduleReconnect(generation);
    });
    socket.on("message", raw => {
      if (generation !== this.generation || !this.sockets.has(socket)) return;
      try {
        const message = JSON.parse(raw.toString());
        armWatchdog();
        const kind = message.metadata?.message_type;
        if (kind === "session_welcome") {
          welcomed = true;
          keepalive = (message.payload.session.keepalive_timeout_seconds ?? 30) * 1000;
          armWatchdog();
          this.activeSocket = socket;
          if (previous) {
            // Twitch transfers subscriptions on server-requested reconnects.
            previous.close();
            this.retryCount = 0;
            this.update({ state: "connected", error: undefined });
          } else {
            void this.subscribe(message.payload.session.id, generation, socket).catch(error => this.connectionFailure(error, generation));
          }
        } else if (kind === "session_reconnect") {
          const reconnectUrl = new URL(message.payload.session.reconnect_url);
          if (reconnectUrl.protocol !== "wss:" || reconnectUrl.hostname !== "eventsub.wss.twitch.tv") throw new Error("Invalid Twitch reconnect URL.");
          this.openSocket(reconnectUrl.toString(), generation, socket);
        } else if (kind === "notification") {
          const id = message.metadata.message_id;
          if (this.messageIds.has(id)) return;
          this.messageIds.add(id);
          if (this.messageIds.size > 2000) this.messageIds.delete(this.messageIds.values().next().value);
          for (const event of this.mapper.map(message.payload.subscription.type, message.payload.event)) this.options.onEvent(event);
        } else if (kind === "revocation") {
          const subscription = message.payload.subscription;
          if (subscription.status === "authorization_revoked" || subscription.status === "user_removed") {
            this.fail(new Error("Twitch access was revoked. Log in again."), generation);
          } else if (subscription.type === "channel.chat.message") {
            this.fail(new Error(`Twitch stopped sending chat events: ${subscription.status}. Log in again.`), generation);
          } else {
            this.update({ warnings: [...this.status.warnings, `${subscription.type}: ${subscription.status}`] });
          }
        }
      } catch (error) { this.fail(error, generation); }
    });
  }

  private async subscribe(sessionId: string, generation: number, socket: WebSocket): Promise<void> {
    const subscriptions = twitchSubscriptions(this.userId);
    // Chat must succeed before reporting Connected. Other topics may require Affiliate status.
    for (const subscription of subscriptions) {
      if (generation !== this.generation || this.activeSocket !== socket) return;
      try {
        await this.helix("eventsub/subscriptions", {
          method: "POST", body: JSON.stringify({ ...subscription, transport: { method: "websocket", session_id: sessionId } }),
        });
        if (generation !== this.generation || this.activeSocket !== socket) return;
        if (subscription.type === "channel.chat.message") {
          this.retryCount = 0;
          this.update({ state: "connected", error: undefined });
        }
      } catch (error) {
        if (generation !== this.generation || this.activeSocket !== socket) return;
        if (subscription.type === "channel.chat.message" || !(error instanceof TwitchRequestError) || ![400, 403, 409].includes(error.status)) throw error;
        this.update({ warnings: [...this.status.warnings, `${subscription.type}: ${error.message}`] });
      }
    }
  }

  private scheduleReconnect(generation: number): void {
    if (this.reconnectScheduled) return;
    this.reconnectScheduled = true;
    this.update({ state: "connecting" });
    this.later(() => {
      this.reconnectScheduled = false;
      if (generation !== this.generation || !this.enabled) return;
      this.activeSocket = null;
      const previousSockets = [...this.sockets];
      this.sockets.clear();
      for (const socket of previousSockets) socket.terminate();
      void this.connect(generation).catch(error => {
        if (generation !== this.generation) return;
        this.connectionFailure(error, generation);
      });
    }, Math.min(1000 * 2 ** this.retryCount++, 30000));
  }

  private connectionFailure(error: unknown, generation: number): void {
    if (generation !== this.generation) return;
    if ((error instanceof TwitchRequestError && (error.status >= 500 || error.status === 429)) ||
        (error instanceof Error && ["TypeError", "TimeoutError", "AbortError"].includes(error.name))) {
      this.scheduleReconnect(generation);
    } else this.fail(error, generation);
  }

  private fail(error: unknown, generation: number): void {
    if (generation !== this.generation) return;
    const message = error instanceof Error ? error.message : "Twitch connection failed.";
    this.stop();
    this.update({ state: "error", error: message });
  }

  stop(): void {
    this.generation++;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    clearInterval(this.validationTimer);
    this.validationTimer = undefined;
    this.reconnectScheduled = false;
    this.activeSocket = null;
    for (const socket of this.sockets) socket.terminate();
    this.sockets.clear();
    this.mapper.reset();
    this.messageIds.clear();
    this.update({ state: "disconnected", error: undefined, userCode: undefined, verificationUri: undefined, warnings: [] });
  }

  async disconnect(): Promise<void> {
    const accessToken = this.tokens?.accessToken;
    this.stop();
    this.credentialGeneration++;
    this.refreshPromise = null;
    this.tokens = null;
    this.options.store.clear();
    this.update({ username: undefined });
    if (accessToken) await this.oauth("revoke", { token: accessToken }).catch(() => {});
  }
}
