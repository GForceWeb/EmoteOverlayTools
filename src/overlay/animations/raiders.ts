import { gsap } from "gsap";
import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";

export interface IncomingRaidAnimationOptions {
  avatarUrl: string;
  displayName: string;
  raiderCount: number;
  originalRaiderCount?: number;
  /** Number of alternating charges across the screen (1–5). */
  chargePasses?: number;
}

interface Palette {
  skin: string;
  shirt: string;
  pants: string;
  shoe: string;
  hair: string;
}

interface PersonMotion {
  el: HTMLDivElement;
  /** Offset from leader when facing right (followers are typically negative X). */
  relX: number;
  relY: number;
  speedFactor: number;
  depthDelay: number;
  isLeader: boolean;
  bobAmp: number;
  bobHalfPeriod: number;
}

const PALETTES: Palette[] = [
  { skin: "#f2c29b", shirt: "#e4572e", pants: "#2f3e46", shoe: "#1b1b1b", hair: "#3d2314" },
  { skin: "#d4a574", shirt: "#2a9d8f", pants: "#264653", shoe: "#1b1b1b", hair: "#1a1a1a" },
  { skin: "#8d5524", shirt: "#f4a261", pants: "#1d3557", shoe: "#111111", hair: "#0d0d0d" },
  { skin: "#c68642", shirt: "#457b9d", pants: "#22223b", shoe: "#111111", hair: "#4a306d" },
  { skin: "#ffe0bd", shirt: "#e63946", pants: "#1d3557", shoe: "#222222", hair: "#6b3a2a" },
  { skin: "#b08d57", shirt: "#ffb703", pants: "#343a40", shoe: "#111111", hair: "#2b2d42" },
  { skin: "#f1c27d", shirt: "#06d6a0", pants: "#073b4c", shoe: "#111111", hair: "#5c4033" },
  { skin: "#e0ac69", shirt: "#118ab2", pants: "#212529", shoe: "#111111", hair: "#241c15" },
  { skin: "#f5cba7", shirt: "#9b5de5", pants: "#2d3142", shoe: "#1a1a1a", hair: "#7a4e2d" },
  { skin: "#a1662f", shirt: "#00bbf9", pants: "#1b1b1e", shoe: "#0a0a0a", hair: "#1c1210" },
];

function clampRaiderCount(value: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function clampChargePasses(value: number | undefined): number {
  if (!Number.isFinite(value) || (value as number) < 1) {
    return 1;
  }

  return Math.min(5, Math.floor(value as number));
}

interface PennantTheme {
  id: string;
  flag: string;
  stripe: string;
  pole: string;
  tip: string;
  pattern: "bar" | "chevron" | "split" | "dots" | "cross";
}

const PENNANT_THEMES: PennantTheme[] = [
  {
    id: "crimson-gold",
    flag: "linear-gradient(135deg, #e63946 0%, #c1121f 55%, #9b2226 100%)",
    stripe: "linear-gradient(90deg, #ffd166, #fff3bf)",
    pole: "linear-gradient(180deg, #c9a227 0%, #8a6a1a 40%, #5c4a18 100%)",
    tip: "#ffd166",
    pattern: "bar",
  },
  {
    id: "twitch-violet",
    flag: "linear-gradient(135deg, #bf94ff 0%, #9146ff 50%, #5c16c5 100%)",
    stripe: "linear-gradient(90deg, #ffffff, #efe6ff)",
    pole: "linear-gradient(180deg, #d4d4d8 0%, #71717a 45%, #3f3f46 100%)",
    tip: "#f0e6ff",
    pattern: "chevron",
  },
  {
    id: "emerald",
    flag: "linear-gradient(135deg, #2ec4b6 0%, #00897b 50%, #00695c 100%)",
    stripe: "linear-gradient(90deg, #ffd166, #ffe8a3)",
    pole: "linear-gradient(180deg, #b08968 0%, #7f5539 50%, #5c4033 100%)",
    tip: "#ffd166",
    pattern: "split",
  },
  {
    id: "ocean",
    flag: "linear-gradient(135deg, #4cc9f0 0%, #4361ee 55%, #3a0ca3 100%)",
    stripe: "linear-gradient(90deg, #f8f9fa, #caf0f8)",
    pole: "linear-gradient(180deg, #adb5bd 0%, #6c757d 45%, #343a40 100%)",
    tip: "#90e0ef",
    pattern: "dots",
  },
  {
    id: "sunset",
    flag: "linear-gradient(135deg, #ff9f1c 0%, #ff6b35 45%, #d62828 100%)",
    stripe: "linear-gradient(90deg, #fff1d6, #ffd166)",
    pole: "linear-gradient(180deg, #e9c46a 0%, #b08968 50%, #6d4c41 100%)",
    tip: "#ffe8a3",
    pattern: "cross",
  },
  {
    id: "midnight",
    flag: "linear-gradient(135deg, #4a4e69 0%, #22223b 55%, #0d1b2a 100%)",
    stripe: "linear-gradient(90deg, #f72585, #b5179e)",
    pole: "linear-gradient(180deg, #c9a227 0%, #8a6a1a 40%, #5c4a18 100%)",
    tip: "#f72585",
    pattern: "chevron",
  },
  {
    id: "lime-rush",
    flag: "linear-gradient(135deg, #b5e48c 0%, #52b69a 50%, #1a759f 100%)",
    stripe: "linear-gradient(90deg, #184e77, #1e6091)",
    pole: "linear-gradient(180deg, #dee2e6 0%, #868e96 50%, #495057 100%)",
    tip: "#d9ed92",
    pattern: "bar",
  },
  {
    id: "rose-gold",
    flag: "linear-gradient(135deg, #ff85a1 0%, #ff477e 50%, #ff0a54 100%)",
    stripe: "linear-gradient(90deg, #fff0f3, #ffc2d1)",
    pole: "linear-gradient(180deg, #e6c07b 0%, #c9a227 45%, #8a6a1a 100%)",
    tip: "#ffccd5",
    pattern: "split",
  },
];

function pickPennantTheme(): PennantTheme {
  return PENNANT_THEMES[Math.floor(Math.random() * PENNANT_THEMES.length)];
}

function createPennant(theme: PennantTheme): HTMLDivElement {
  const pennant = document.createElement("div");
  pennant.className = `raid-pennant raid-pennant--${theme.pattern}`;
  pennant.dataset.theme = theme.id;
  pennant.style.setProperty("--pennant-flag", theme.flag);
  pennant.style.setProperty("--pennant-stripe", theme.stripe);
  pennant.style.setProperty("--pennant-pole", theme.pole);
  pennant.style.setProperty("--pennant-tip", theme.tip);

  const pole = document.createElement("div");
  pole.className = "raid-pennant-pole";
  pennant.appendChild(pole);

  const flag = document.createElement("div");
  flag.className = "raid-pennant-flag";

  // Three cloth panels with staggered motion sell a flowing wind wave
  for (let i = 0; i < 3; i++) {
    const seg = document.createElement("div");
    seg.className = `raid-pennant-seg raid-pennant-seg-${i}`;
    seg.style.animationDelay = `${(-i * 0.07).toFixed(2)}s`;
    flag.appendChild(seg);
  }

  const stripe = document.createElement("div");
  stripe.className = "raid-pennant-stripe";
  flag.appendChild(stripe);

  if (theme.pattern === "dots" || theme.pattern === "cross") {
    const accent = document.createElement("div");
    accent.className = "raid-pennant-accent";
    flag.appendChild(accent);
  }

  pennant.appendChild(flag);
  return pennant;
}

function createFace(): HTMLDivElement {
  const face = document.createElement("div");
  face.className = "raid-face";

  const eyeL = document.createElement("span");
  eyeL.className = "raid-eye raid-eye-left";
  const eyeR = document.createElement("span");
  eyeR.className = "raid-eye raid-eye-right";
  const mouth = document.createElement("span");
  mouth.className = "raid-mouth";

  face.append(eyeL, eyeR, mouth);
  return face;
}

function createAvatarHead(avatarUrl: string): HTMLDivElement {
  const head = document.createElement("div");
  head.className = "raid-head raid-head-leader";

  const img = document.createElement("div");
  img.className = "raid-avatar-face";
  img.style.backgroundImage = `url("${avatarUrl}")`;
  head.appendChild(img);

  const ring = document.createElement("div");
  ring.className = "raid-avatar-ring";
  head.appendChild(ring);

  const crest = document.createElement("div");
  crest.className = "raid-avatar-crest";
  head.appendChild(crest);

  return head;
}

function createFollowerHead(palette: Palette): HTMLDivElement {
  const head = document.createElement("div");
  head.className = "raid-head";
  head.style.setProperty("--raid-skin", palette.skin);
  head.style.setProperty("--raid-hair", palette.hair);

  const hair = document.createElement("div");
  hair.className = "raid-hair";
  head.appendChild(hair);
  head.appendChild(createFace());

  return head;
}

function createRunner(
  index: number,
  size: number,
  runCycleSec: number,
  avatarUrl?: string
): HTMLDivElement {
  const leader = index === 0;
  const palette = PALETTES[index % PALETTES.length];
  const person = document.createElement("div");
  person.className = leader ? "raid-person raid-person-leader" : "raid-person";
  person.style.width = `${size}px`;
  person.style.height = `${size * 1.55}px`;
  person.style.setProperty("--raid-size", `${size}px`);
  person.style.setProperty("--raid-run", `${runCycleSec.toFixed(3)}s`);
  person.style.setProperty("--raid-skin", palette.skin);
  person.style.setProperty("--raid-shirt", leader ? "#3a86ff" : palette.shirt);
  person.style.setProperty("--raid-pants", leader ? "#1d3557" : palette.pants);
  person.style.setProperty("--raid-shoe", leader ? "#0d1b2a" : palette.shoe);
  person.style.setProperty("--raid-hair", palette.hair);
  person.style.setProperty(
    "--raid-phase",
    `${(-(index % 9) * (runCycleSec / 9)).toFixed(3)}s`
  );

  const orient = document.createElement("div");
  orient.className = "raid-orient";

  const bob = document.createElement("div");
  bob.className = "raid-bob";

  const runner = document.createElement("div");
  runner.className = "raid-runner";

  const shadow = document.createElement("div");
  shadow.className = "raid-ground-shadow";
  runner.appendChild(shadow);

  const armBack = document.createElement("div");
  armBack.className = "raid-limb raid-arm raid-arm-back";
  const legBack = document.createElement("div");
  legBack.className = "raid-limb raid-leg raid-leg-back";
  const torso = document.createElement("div");
  torso.className = "raid-torso";
  const armFront = document.createElement("div");
  armFront.className = "raid-limb raid-arm raid-arm-front";
  const legFront = document.createElement("div");
  legFront.className = "raid-limb raid-leg raid-leg-front";

  const shoeBack = document.createElement("div");
  shoeBack.className = "raid-shoe";
  legBack.appendChild(shoeBack);
  const shoeFront = document.createElement("div");
  shoeFront.className = "raid-shoe";
  legFront.appendChild(shoeFront);

  const head =
    leader && avatarUrl
      ? createAvatarHead(avatarUrl)
      : createFollowerHead(palette);

  runner.append(armBack, legBack, torso, armFront, legFront, head);

  if (leader) {
    const sash = document.createElement("div");
    sash.className = "raid-leader-sash";
    torso.appendChild(sash);

    const belt = document.createElement("div");
    belt.className = "raid-leader-belt";
    torso.appendChild(belt);

    // Raid pennant — theme picked per run so flags don't all look identical
    runner.appendChild(createPennant(pickPennantTheme()));

    const aura = document.createElement("div");
    aura.className = "raid-leader-aura";
    runner.appendChild(aura);
  }

  for (let d = 0; d < (leader ? 4 : 2); d++) {
    const dust = document.createElement("div");
    dust.className = leader ? "raid-foot-dust raid-foot-dust-leader" : "raid-foot-dust";
    dust.style.animationDelay = `${(-(d * 0.16 + Math.random() * 0.1)).toFixed(2)}s`;
    runner.appendChild(dust);
  }

  bob.appendChild(runner);
  orient.appendChild(bob);
  person.appendChild(orient);
  return person;
}

function createNameBanner(displayName: string, viewerLabel: string): HTMLDivElement {
  const banner = document.createElement("div");
  banner.className = "raid-name-banner";

  const title = document.createElement("div");
  title.className = "raid-name-title";
  title.textContent = displayName;

  const subtitle = document.createElement("div");
  subtitle.className = "raid-name-subtitle";
  subtitle.textContent = viewerLabel;

  banner.append(title, subtitle);
  return banner;
}

function createSpeedStreaks(wrapper: HTMLDivElement, count: number): void {
  const streakCount = Math.min(18, Math.max(6, Math.ceil(count / 8)));

  for (let i = 0; i < streakCount; i++) {
    const streak = document.createElement("div");
    streak.className = "raid-speed-streak";
    streak.style.top = `${28 + Math.random() * 48}%`;
    streak.style.width = `${helpers.scaleRelativeToWidth(80 + Math.random() * 160)}px`;
    streak.style.animationDelay = `${Math.random() * 0.8}s`;
    streak.style.opacity = `${0.15 + Math.random() * 0.35}`;
    wrapper.appendChild(streak);
  }
}

/**
 * Incoming raid: avatar-led cartoon pack charges across the overlay.
 * Repeats `chargePasses` times, alternating left→right and right→left.
 */
export function incomingRaid(options: IncomingRaidAnimationOptions): void {
  const raiderCount = clampRaiderCount(options.raiderCount);
  const chargePasses = clampChargePasses(options.chargePasses);
  const originalCount = options.originalRaiderCount ?? raiderCount;
  const wrapper = document.createElement("div");
  const wrapperId = `raid-army-${Date.now()}-${Math.round(Math.random() * 10000)}`;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const density = Math.min(1, 48 / Math.max(raiderCount, 1));
  const personWidth = helpers.scaleRelativeToViewport(
    Math.max(28, Math.min(64, 52 * (0.55 + density * 0.45)))
  );
  const personHeight = personWidth * 1.55;
  const followerCount = Math.max(0, raiderCount - 1);

  const columns = Math.max(1, Math.ceil(Math.sqrt(followerCount || 1) * 1.45));
  const rows = Math.max(1, Math.ceil((followerCount || 1) / columns));
  const colGap = personWidth * 0.78;
  const rowGap = personHeight * 0.42;
  const bandCenterY = viewportHeight * 0.56;
  const formationDepth = columns * colGap + personWidth * 2.2;
  const formationSpread = rows * rowGap + personHeight;
  const leftOffscreen = -formationDepth - personWidth * 4;
  const rightOffscreen = viewportWidth + formationDepth + personWidth * 4;
  const chargeDuration = Math.min(9.5, Math.max(5.8, 5.8 + raiderCount / 90));
  const passGap = 0.28;
  const motions: PersonMotion[] = [];
  const leaderSize = personWidth * 1.78;

  // Keep the info card clear of the tallest heads in the wedge
  const packTopY = bandCenterY - formationSpread * 0.5;
  const bannerClearance = helpers.scaleRelativeToViewport(88);
  const bannerY = Math.max(
    helpers.scaleRelativeToViewport(12),
    packTopY - bannerClearance
  );
  const bannerLeaderOffsetX = leaderSize * 0.12;

  wrapper.id = wrapperId;
  wrapper.className = "raid-army-wrapper raid-facing-right";
  wrapper.setAttribute(
    "aria-label",
    `${options.displayName} is raiding with ${originalCount} raiders`
  );
  wrapper.style.width = `${viewportWidth}px`;
  wrapper.style.height = `${viewportHeight}px`;

  createSpeedStreaks(wrapper, raiderCount);

  const banner = createNameBanner(
    options.displayName,
    `${originalCount.toLocaleString()} raider${originalCount === 1 ? "" : "s"}`
  );
  wrapper.appendChild(banner);

  const leaderRun = 0.28;
  const leader = createRunner(0, leaderSize, leaderRun, options.avatarUrl);
  const leaderHeight = leaderSize * 1.55;
  // Nudge up so the taller leader sits nearer the pack's vertical middle
  const leaderBaseX = leftOffscreen + formationDepth - personWidth * 0.4;
  const leaderBaseY =
    bandCenterY - leaderHeight * 0.5 - (leaderHeight - personHeight) * 0.4;

  gsap.set(leader, {
    x: leaderBaseX,
    y: leaderBaseY,
    force3D: true,
  });
  leader.style.zIndex = "10000";
  wrapper.appendChild(leader);
  motions.push({
    el: leader,
    relX: 0,
    relY: 0,
    speedFactor: 1.04,
    depthDelay: 0,
    isLeader: true,
    bobAmp: leaderSize * 1.55 * 0.04,
    bobHalfPeriod: leaderRun / 2,
  });

  for (let index = 1; index < raiderCount; index++) {
    const followerIndex = index - 1;
    const col = Math.floor(followerIndex / rows);
    const row = followerIndex % rows;
    const rowsInCol = Math.min(rows, followerCount - col * rows);
    const rowCentered = row - (rowsInCol - 1) / 2;
    const flare = 1 + col * 0.08;
    const depthScale = Math.max(0.62, 1 - col * 0.045 - Math.random() * 0.04);
    const size = personWidth * depthScale;
    const runCycle = 0.26 + Math.random() * 0.1;
    const person = createRunner(index, size, runCycle);

    // Pennant trails ~0.4–1.0 leader-widths behind — keep pack clear of body + flag
    const flagClearance = leaderSize * 1.05;
    const minBehind = flagClearance + size * 0.35 + col * colGap;
    const jitterX = -Math.random() * personWidth * 0.55; // only backward
    const jitterY = (Math.random() - 0.5) * personHeight * 0.28;

    let x = leaderBaseX - minBehind + jitterX;
    let y =
      bandCenterY -
      formationSpread * 0.5 +
      rowCentered * rowGap * flare +
      personHeight * 0.5 +
      jitterY;

    // Hard clamp behind the flag tip (pennant extends left of the leader box)
    const maxFollowerX = leaderBaseX - leaderSize * 1.05;
    x = Math.min(x, maxFollowerX);

    // Anyone level with the leader/flag band needs even more space
    const followerHeight = size * 1.55;
    const flagBandTop = leaderBaseY - leaderHeight * 0.08;
    const flagBandBottom = leaderBaseY + leaderHeight * 0.95;
    const overlapsLeaderBand =
      y < flagBandBottom && y + followerHeight > flagBandTop;
    if (overlapsLeaderBand) {
      x = Math.min(x, leaderBaseX - leaderSize * 1.25);
    }

    gsap.set(person, {
      x,
      y,
      scale: 0.96 + Math.random() * 0.08,
      force3D: true,
    });
    person.style.zIndex = `${Math.round(1000 + y)}`;
    wrapper.appendChild(person);

    motions.push({
      el: person,
      relX: x - leaderBaseX,
      relY: y - leaderBaseY,
      speedFactor: 0.92 + Math.random() * 0.16,
      depthDelay: Math.min(0.85, col * 0.045 + Math.random() * 0.08),
      isLeader: false,
      bobAmp: personHeight * 0.055,
      bobHalfPeriod: 0.14 + Math.random() * 0.05,
    });
  }

  globalVars.warp.appendChild(wrapper);

  const timeline = gsap.timeline({
    onComplete: () => wrapper.remove(),
  });

  gsap.set(banner, {
    x: leaderBaseX + bannerLeaderOffsetX,
    y: bannerY,
    opacity: 0,
    force3D: true,
  });

  timeline.to(
    banner,
    {
      opacity: 1,
      duration: 0.45,
      ease: "power2.out",
    },
    0.12
  );

  const totalChargeTime =
    chargePasses * chargeDuration + Math.max(0, chargePasses - 1) * passGap;

  // Continuous stride bob across every pass
  motions.forEach((motion) => {
    const bob = motion.el.querySelector(".raid-bob");
    if (!bob) {
      return;
    }

    gsap.to(bob, {
      y: -motion.bobAmp,
      duration: motion.bobHalfPeriod,
      yoyo: true,
      repeat: Math.ceil(totalChargeTime / Math.max(0.08, motion.bobHalfPeriod)),
      ease: "sine.inOut",
    });
  });

  for (let pass = 0; pass < chargePasses; pass++) {
    const goingRight = pass % 2 === 0;
    const facing = goingRight ? 1 : -1;
    const leaderStartX = goingRight ? leaderBaseX : rightOffscreen - (leaderBaseX - leftOffscreen);
    // Mirror the first-pass tip so the leader still leads when reversing
    const leaderEndX = goingRight
      ? rightOffscreen - personWidth
      : leftOffscreen + personWidth;
    const passStart = pass * (chargeDuration + passGap);

    timeline.add(() => {
      wrapper.classList.toggle("raid-facing-right", goingRight);
      wrapper.classList.toggle("raid-facing-left", !goingRight);
    }, passStart);

    motions.forEach((motion) => {
      const startX = leaderStartX + facing * motion.relX;
      const startY = leaderBaseY + motion.relY;
      const endX = leaderEndX + facing * motion.relX;
      const duration = chargeDuration / motion.speedFactor;
      const tweenStart = passStart + motion.depthDelay;
      const orient = motion.el.querySelector(".raid-orient");

      // Face the direction of travel (flip on reverse passes so they aren't moonwalking)
      if (orient) {
        timeline.set(
          orient,
          {
            scaleX: facing,
            force3D: true,
          },
          passStart
        );
      }

      // Snap into the offscreen start for this pass (instant between passes)
      timeline.set(
        motion.el,
        {
          x: startX,
          y: startY,
          force3D: true,
        },
        passStart
      );

      timeline.to(
        motion.el,
        {
          x: endX,
          duration,
          ease: "none",
          force3D: true,
        },
        tweenStart
      );

      if (!motion.isLeader) {
        timeline.to(
          motion.el,
          {
            y: startY + (Math.random() - 0.5) * personHeight * 0.2,
            duration: duration * 0.5,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          tweenStart
        );
      }
    });

    // Banner tracks the leader tip, stays upright, sits well above the pack
    const bannerStartX = leaderStartX + facing * bannerLeaderOffsetX;
    const bannerEndX = leaderEndX + facing * bannerLeaderOffsetX;
    const leaderDuration = chargeDuration / 1.04;

    timeline.set(
      banner,
      {
        x: bannerStartX,
        y: bannerY,
        force3D: true,
      },
      passStart
    );

    timeline.to(
      banner,
      {
        x: bannerEndX,
        duration: leaderDuration,
        ease: "none",
        force3D: true,
      },
      passStart
    );
  }

  timeline.to(
    banner,
    {
      opacity: 0,
      duration: 0.35,
      ease: "power1.in",
    },
    totalChargeTime - 0.45
  );

  timeline.to(
    wrapper,
    {
      opacity: 0,
      duration: 0.4,
      ease: "power1.in",
    },
    totalChargeTime + 0.1
  );

  window.setTimeout(() => {
    if (document.getElementById(wrapperId)) {
      wrapper.remove();
    }
  }, (totalChargeTime + 2.5) * 1000);
}

export async function raider(
  username: string = "gforce_bot",
  raiderCount: number = 60
): Promise<void> {
  let avatarUrl =
    "https://static-cdn.jtvnw.net/jtv_user_pictures/8e051a26-051f-4abe-bcfa-e13a5d13fad0-profile_image-300x300.png";

  try {
    avatarUrl = await helpers.getTwitchAvatar(username);
  } catch (error) {
    console.error(`Error getting avatar for raid preview user ${username}:`, error);
  }

  incomingRaid({
    avatarUrl,
    displayName: username,
    raiderCount,
    originalRaiderCount: raiderCount,
    chargePasses: 1,
  });
}
