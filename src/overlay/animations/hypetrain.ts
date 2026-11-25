import { globalVars } from "../config.ts";
import helpers from "../helpers";
import { gsap } from "gsap";
import logger from "../lib/logger.ts";
import { createCarriage, createLocomotive, createPassenger, createUsernameCycler, setCarriageProgress, part, CarriageView } from "../lib/hypetrain-view.ts";
import type { HypeTrainEventData } from "../../shared/types.ts";

export interface TrainPassengerDetails {
  id?: string;
  name?: string;
  level?: number;
  avatarUrl?: string;
}

interface Carriage extends CarriageView {
  passengers: Map<string, HTMLElement>;
}

interface Train {
  element: HTMLElement;
  consist: HTMLElement;
  carriages: Map<number, Carriage>;
  contributionTotals: Map<string, number>;
  level: number;
  finishing: boolean;
  timers: Set<ReturnType<typeof setTimeout>>;
  expiry?: ReturnType<typeof setTimeout>;
  frame?: number;
  previousTime?: number;
  x: number;
  usernameCycler?: ResizeObserver;
}

let active: Train | undefined;

function currentTrain(): Train | undefined {
  return active?.element.isConnected && !active.finishing ? active : undefined;
}

function validLevel(level: number | undefined, fallback: number): number {
  return Number.isInteger(level) && level! > 0 && level! <= 1000 ? level! : fallback;
}

function schedule(train: Train, callback: () => void, ms: number): ReturnType<typeof setTimeout> {
  const timer = setTimeout(() => {
    train.timers.delete(timer);
    if (train.element.isConnected) callback();
  }, ms);
  train.timers.add(timer);
  return timer;
}

function removeTrain(train: Train): void {
  train.timers.forEach(clearTimeout);
  train.timers.clear();
  if (train.frame !== undefined) cancelAnimationFrame(train.frame);
  train.usernameCycler?.disconnect();
  gsap.killTweensOf(train.element);
  train.element.remove();
  if (active === train) active = undefined;
}

function refreshExpiry(train: Train): void {
  if (train.expiry !== undefined) {
    clearTimeout(train.expiry);
    train.timers.delete(train.expiry);
  }
  train.expiry = schedule(train, () => removeTrain(train), 365000);
}

function ensureLevel(train: Train, level: number, animateEntry = false): Carriage {
  for (let number = 1; number <= level; number++) {
    if (train.carriages.has(number)) continue;
    const carriage = { ...createCarriage(number, animateEntry), passengers: new Map<string, HTMLElement>() };
    train.consist.appendChild(carriage.element);
    train.carriages.set(number, carriage);
  }
  for (const [number, carriage] of train.carriages) {
    if (number < train.level) setCarriageProgress(carriage, 100);
  }
  return train.carriages.get(level)!;
}

// The front of the engine is the anchor. Adding a carriage extends the tail
// without moving the engine or shrinking the faces in an already busy carriage.
function moveTrain(train: Train, now: number): void {
  if (!train.element.isConnected) { removeTrain(train); return; }
  const scale = Math.max(.72, Math.min(1.4, window.innerHeight / 1080));
  train.consist.style.setProperty("--train-scale", String(scale));
  const elapsed = train.previousTime === undefined ? 0 : Math.min(64, now - train.previousTime);
  train.previousTime = now;
  train.x += elapsed * .13 * scale;
  const width = train.consist.scrollWidth * scale;
  if (!train.finishing && train.x > window.innerWidth + width + 80) train.x = -40;
  train.element.style.transform = `translate3d(${train.x}px, 0, 0)`;
  train.frame = requestAnimationFrame(time => moveTrain(train, time));
}

/** Capture the carriage now, before avatar I/O. Names appear immediately. */
export function hypetrainprogression(username: string, byId = false, details: TrainPassengerDetails = {}): void {
  const train = currentTrain();
  if (!train || !username) return;
  const level = validLevel(details.level, train.level);
  const carriage = ensureLevel(train, level);
  const name = details.name || username;
  const id = details.id || (byId ? username : "");
  const aliases = [id ? `id:${id}` : "", !byId ? `name:${username.toLowerCase()}` : "", `name:${name.toLowerCase()}`].filter(Boolean);
  if (aliases.some(key => carriage.passengers.has(key))) return;

  // The count uses actual people, not the extra aliases used for deduplication.
  const count = carriage.deck.getElementsByClassName("hype-passenger").length;
  const passenger = createPassenger(name, count);
  aliases.forEach(key => carriage.passengers.set(key, passenger.element));
  carriage.deck.appendChild(passenger.element);
  train.usernameCycler?.observe(passenger.nameViewport);
  carriage.count.textContent = `${count + 1} ${count === 0 ? "PASSENGER" : "PASSENGERS"}`;
  passenger.element.dataset.userId = details.id || (byId ? username : "");
  if (details.avatarUrl) { passenger.image.src = details.avatarUrl; return; }
  helpers.getTwitchAvatar(username, byId).then(url => {
    if (passenger.element.isConnected && !train.finishing) passenger.image.src = url;
  }).catch(error => console.warn("Hype Train avatar unavailable:", error));
}

export function hypetrainstart(level = 1): void {
  if (active) removeTrain(active);
  const element = part("div", "train-wrapper hype-express");
  element.setAttribute("aria-label", "Hype Express");
  const consist = part("div", "hype-consist", element);
  consist.appendChild(createLocomotive());
  const train: Train = {
    element, consist, carriages: new Map(), contributionTotals: new Map(), level: validLevel(level, 1),
    finishing: false, timers: new Set(), x: -40, usernameCycler: createUsernameCycler(),
  };
  active = train;
  globalVars.warp.appendChild(element);
  setCarriageProgress(ensureLevel(train, train.level), 0);
  logger.info(`Hype Train animation started at level ${train.level}`);
  refreshExpiry(train);
  gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration: .6 });
  train.frame = requestAnimationFrame(time => moveTrain(train, time));

  // Include the contributions that triggered the train, using their actual names.
  const cutoff = Date.now() - 120000;
  for (const passenger of globalVars.hypetrainCache) {
    if (passenger.timestamp >= cutoff) {
      hypetrainprogression(passenger.username, false, { id: passenger.id, name: passenger.name, level: 1 });
    }
  }
  globalVars.hypetrainCache.length = 0;
}

/** Explicit levels make duplicate/replayed level-up messages idempotent. */
export function hypetrainlevelup(level?: number): void {
  const train = currentTrain();
  if (!train) {
    logger.warning("Hype Train level update ignored: no active train; send HypeTrainStart first");
    return;
  }
  const previousLevel = train.level;
  train.level = Math.max(train.level, validLevel(level, level === undefined ? train.level + 1 : train.level));
  const carriage = ensureLevel(train, train.level, true);
  if (train.level > previousLevel) setCarriageProgress(carriage, 0);
  refreshExpiry(train);
}

/** WebSocket snapshots contain cumulative leaders, not a list of new contributors. */
export function hypetrainupdate(data: HypeTrainEventData = {}): void {
  const train = currentTrain();
  if (!train) return;
  const level = validLevel(data.level, train.level);
  // A late snapshot must not reset a completed carriage or put its crew in a newer one.
  if (level < train.level) return;
  const carriage = ensureLevel(train, level);
  if (Number.isFinite(data.progress) && Number.isFinite(data.goal) && data.goal! > 0) {
    setCarriageProgress(carriage, data.progress! / data.goal! * 100);
  }
  const board = (contribution: NonNullable<HypeTrainEventData["last_contribution"]>) => {
    const username = contribution.user_login || contribution.user_id || contribution.user_name;
    if (!username) return;
    hypetrainprogression(username, !contribution.user_login && !!contribution.user_id, {
      id: contribution.user_id, name: contribution.user_name || contribution.user_login, level,
    });
  };
  if (data.last_contribution) board(data.last_contribution);
  if (!Array.isArray(data.top_contributions)) return;
  for (const contribution of data.top_contributions) {
    if (!contribution) continue;
    const identity = contribution.user_id || contribution.user_login?.toLowerCase() || contribution.user_name?.toLowerCase();
    if (!identity) continue;
    const key = `${identity}:${contribution.type || "unknown"}`;
    const previous = train.contributionTotals.get(key);
    const total = Number.isFinite(contribution.total) && contribution.total! >= 0 ? contribution.total! : 0;
    if (previous === undefined || total > previous) board(contribution);
    train.contributionTotals.set(key, Math.max(previous ?? 0, total));
  }
}

export function hypetrainfinish(): void {
  const train = currentTrain();
  if (!train) return;
  train.finishing = true;
  train.timers.forEach(clearTimeout);
  train.timers.clear();
  // Keep rolling during the fade rather than stopping all the wheels abruptly.
  gsap.to(train.element, { opacity: 0, duration: 4.5 });
  schedule(train, () => removeTrain(train), 5000);
}

/** Short preview with enough crew to demonstrate the two decks and all poses. */
export function hypetrainpreview(username: string): void {
  hypetrainstart();
  const train = currentTrain()!;
  const board = (level: number) => {
    hypetrainprogression(username, false, { level });
    ["PixelPilot", "LunaLoops", "CaptainKappa", "EmoteScout", "CozyComet"].forEach((name, index) => {
      const hue = [14, 160, 38, 260, 195][index];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="hsl(${hue},55%,35%)"/><circle cx="28" cy="34" r="5" fill="#fff0c9"/><circle cx="52" cy="34" r="5" fill="#fff0c9"/><path d="M25 52q15 15 30 0" fill="none" stroke="#fff0c9" stroke-width="5" stroke-linecap="round"/></svg>`;
      hypetrainprogression(name, false, { level, avatarUrl: `data:image/svg+xml,${encodeURIComponent(svg)}` });
    });
  };
  board(1);
  schedule(train, () => { hypetrainlevelup(2); board(2); }, 7000);
  schedule(train, () => { hypetrainlevelup(3); board(3); }, 14000);
  schedule(train, hypetrainfinish, 45000);
}
