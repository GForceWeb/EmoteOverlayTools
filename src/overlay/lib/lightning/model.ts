export type StormDirection = "left-to-right" | "right-to-left";
export const CLOUD_WIDTH = 640;
export const STRIKE_LEAD_MS = 2200;
const STORM_EXIT_MS = 2200;
const FORK_CHANCE = 0.15;
export function lightningTiming(count = 200, interval = 50) {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 200;
  const strikes = safeCount === 0 ? 0 : Math.min(10, Math.max(1, Math.ceil(safeCount / 25)));
  const gap = Math.min(1400, Math.max(600, (Number.isFinite(interval) ? interval : 50) * 14));
  return { strikes, gap, duration: strikes ? STRIKE_LEAD_MS + strikes * gap + STORM_EXIT_MS : 0 };
}
export type Point = {
  x: number;
  y: number;
};
type Strike = {
  at: number;
  points: Point[];
  branches: {
    points: Point[];
    startsAt: number;
    ground: boolean;
  }[];
  x: number;
  cloudX: number;
};
export function lightningCloudLeft(elapsed: number, duration: number, direction: StormDirection): number {
  const progress = Math.max(0, Math.min(1, elapsed / duration));
  return direction === "left-to-right"
    ? -CLOUD_WIDTH + (1280 + CLOUD_WIDTH) * progress
    : 1280 - (1280 + CLOUD_WIDTH) * progress;
}
/** Geometry is fixed at strike time so fading bolts do not slide with the cloud. */
export function createLightningPlan(count = 200, interval = 50, random: () => number = Math.random) {
  const timing = lightningTiming(count, interval);
  const direction: StormDirection = random() < .5 ? "left-to-right" : "right-to-left";
  const strikes: Strike[] = Array.from({ length: timing.strikes }, (_, i) => {
    const at = STRIKE_LEAD_MS + i * timing.gap;
    const cloudCenter = lightningCloudLeft(at, timing.duration, direction) + CLOUD_WIDTH / 2;
    const cloudX = Math.max(64, Math.min(1216, cloudCenter + (random() - .5) * 105));
    const x = Math.max(90, Math.min(1190, cloudX + (random() - .5) * 310));
    const start = { x: cloudX, y: 133 };
    const points = [start];
    for (let j = 1; j < 7; j++) {
      const progress = j / 7;
      const zigzag = (j % 2 ? -1 : 1) * (30 + random() * 65);
      points.push({
        x: Math.max(42, Math.min(1238, cloudX + (x - cloudX) * progress + zigzag)),
        y: start.y + progress * (714 - start.y),
      });
    }
    points.push({ x, y: 714 });
    const branches: Strike["branches"] = [];
    if (random() < FORK_CHANCE) {
      const junctionIndex = random() < .5 ? 2 : 3;
      const remaining = points.slice(junctionIndex);
      const clearanceLeft = Math.min(...remaining.map(p => p.x)) - 32;
      const clearanceRight = 1248 - Math.max(...remaining.map(p => p.x));
      const side = clearanceRight > clearanceLeft ? 1 : -1;
      const spread = Math.min(260, Math.max(clearanceLeft, clearanceRight) * .86);
      const junction = remaining[0];
      // Share the trunk's Y coordinates. A positive separation at each vertex
      // guarantees the two piecewise-linear legs never cross or rejoin.
      const fork = remaining.map((point, j) => {
        const progress = (point.y - junction.y) / (714 - junction.y);
        const separation = j ? 25 + Math.pow(progress, .72) * (spread - 25) : 0;
        return { x: point.x + side * separation, y: point.y };
      });
      const startsAt = pathLength(points.slice(0, junctionIndex + 1)) / pathLength(points);
      branches.push({ points: fork, startsAt, ground: true });
      // A short, finer offshoot gives the fork an uneven silhouette.
      const twigStart = fork[2];
      const twigEndY = Math.min(666, twigStart.y + 150);
      const parent = fork.slice(2).filter(point => point.y < twigEndY);
      const endSegment = fork.findIndex((point, j) => j && point.y >= twigEndY);
      const a = fork[endSegment - 1], b = fork[endSegment];
      const endProgress = (twigEndY - a.y) / (b.y - a.y);
      parent.push({ x: a.x + (b.x - a.x) * endProgress, y: twigEndY });
      const room = side > 0 ? 1248 - Math.max(...parent.map(p => p.x)) : Math.min(...parent.map(p => p.x)) - 32;
      if (room > 65 && twigStart.y < 580) {
        const reach = Math.min(room * .8, 110);
        branches.push({ points: parent.map(point => ({
            x: point.x + side * reach * (point.y - twigStart.y) / (twigEndY - twigStart.y),
            y: point.y,
          })), startsAt: Math.min(.9, startsAt + .24), ground: false });
      }
    }
    return { at, points, branches, x, cloudX };
  });
  return { timing, direction, strikes };
}
function pathLength(points: Point[]): number {
  return points.slice(1).reduce((total, point, i) => total + Math.hypot(point.x - points[i].x, point.y - points[i].y), 0);
}
