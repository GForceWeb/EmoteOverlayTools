import { globalVars } from "./config.ts";
import { WSData, AnimationSettings } from "../shared/types.ts";
import OverlaySettings from "./settings";
import {
  animationRegistry,
  getAnimationDefinition,
  getGroupChildren,
  AnimationDefinition,
} from "../shared/animationRegistry.ts";

import helpers from "./helpers.ts";
import animations from "./animations.ts";
import logger from "./lib/logger.ts";

// Get settings reference (will be updated dynamically)
function getSettings() {
  return OverlaySettings.settings;
}

// Variable to track if bot chat is enabled
let Botchat: boolean = false;

/**
 * Check if an animation is enabled for manual execution (!er)
 */
function isAnimationEnabledManual(animationName: string): boolean {
  const settings = getSettings();
  const animSettings = settings.animations[animationName];
  
  if (!animSettings) {
    // Animation not in settings, check registry for default
    const def = getAnimationDefinition(animationName);
    return def?.defaultEnabledManual ?? false;
  }
  
  // If enableAllAnimations is on, all animations are enabled
  if (settings.enableAllAnimations) {
    return true;
  }
  
  // Check the enabledManual flag, falling back to legacy enabled flag
  return animSettings.enabledManual ?? animSettings.enabled ?? false;
}

/**
 * Check if an animation is enabled for the kappagen random pool (!k)
 */
function isAnimationEnabledKappagen(animationName: string): boolean {
  const settings = getSettings();
  const animSettings = settings.animations[animationName];
  
  if (!animSettings) {
    // Animation not in settings, check registry for default
    const def = getAnimationDefinition(animationName);
    return def?.defaultEnabledKappagen ?? false;
  }
  
  // If enableAllAnimations is on, all animations are enabled
  if (settings.enableAllAnimations) {
    return true;
  }
  
  // Check the enabledKappagen flag, falling back to legacy enabled flag
  return animSettings.enabledKappagen ?? animSettings.enabled ?? false;
}

/**
 * Get animation settings (count, interval) for a given animation
 */
function getAnimationParams(animationName: string): { count: number; interval: number } {
  const settings = getSettings();
  const animSettings = settings.animations[animationName];
  const def = getAnimationDefinition(animationName);
  
  return {
    count: animSettings?.count ?? def?.defaultCount ?? 50,
    interval: animSettings?.interval ?? def?.defaultInterval ?? 50,
  };
}

/**
 * Build the pool of animations enabled for kappagen random selection (!k)
 * This filters based on enabledKappagen and excludes group children
 * (groups handle their own child selection)
 */
function buildRandomAnimationPool(): AnimationDefinition[] {
  const pool: AnimationDefinition[] = [];
  
  for (const [name, def] of Object.entries(animationRegistry)) {
    // Skip group children - they're selected through their parent group
    if (def.group) {
      continue;
    }
    
    // Check if enabled for random pool
    if (isAnimationEnabledKappagen(name)) {
      // For groups, check if at least one child is enabled
      if (def.isGroup && def.children) {
        const enabledChildren = def.children.filter((childName) =>
          isAnimationEnabledKappagen(childName)
        );
        if (enabledChildren.length > 0) {
          pool.push(def);
        }
      } else {
        pool.push(def);
      }
    }
  }
  
  return pool;
}

/**
 * Select a random child animation from a group
 */
function selectGroupChild(groupDef: AnimationDefinition): string | null {
  if (!groupDef.children || groupDef.children.length === 0) {
    return null;
  }
  
  // Filter to only enabled children
  const enabledChildren = groupDef.children.filter((childName) =>
    isAnimationEnabledKappagen(childName)
  );
  
  if (enabledChildren.length === 0) {
    return null;
  }
  
  const index = Math.floor(Math.random() * enabledChildren.length);
  return enabledChildren[index];
}

/**
 * Execute an animation with special handling for requirements
 */
async function executeAnimation(
  animationName: string,
  images: string[],
  count: number,
  interval: number,
  username: string,
  text?: string
): Promise<void> {
  const def = getAnimationDefinition(animationName);
  
  if (!animations.hasOwnProperty(animationName) || typeof animations[animationName] !== "function") {
    logger.error(`Animation function not found: ${animationName}`);
    return;
  }
  
  // Handle special requirements
  if (def?.requiresAvatar) {
    try {
      const avatar = await helpers.getTwitchAvatar(username);
      animations[animationName](images, count, interval, avatar);
    } catch (error) {
      logger.error(`Error getting avatar for ${animationName}: ${(error as Error).message}`);
      animations[animationName](images, count, interval);
    }
  } else if (def?.requiresText) {
    const displayText = text || getSettings().animations[animationName]?.text || "Hype";
    animations[animationName](images, displayText, interval);
  } else {
    animations[animationName](images, count, interval);
  }
}

function isFeatureEnabled(feature: string, subbedCheck: boolean): boolean {
  const settings = getSettings();
  return (
    (settings.enableAllFeatures || settings.features[feature]?.enabled) && subbedCheck
  );
}

function chatMessageHandler(wsdata: WSData): void {
  const settings = getSettings();
  const message = wsdata.data?.message?.message || "";
  const lowermessage = message.toLowerCase();
  const username = wsdata.data?.message?.username || "";
  const userId = wsdata.data?.message?.userId || "";
  const emotes = getEmoteImages(wsdata);

  const subbedCheck =
    !settings.subOnly || (settings.subOnly && wsdata.data?.message?.subscriber);

  switch (true) {
    case lowermessage.includes("!lurk"):
      if (isFeatureEnabled("lurk", subbedCheck)) {
        lurkCommand(username);
      } else {
        logger.info("Lurk Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!so"):
      if (isFeatureEnabled("welcome", subbedCheck)) {
        shoutoutCommand(lowermessage);
      } else {
        logger.info("Shoutout Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!choon") || lowermessage.includes("!tune"):
      if (isFeatureEnabled("choon", subbedCheck)) {
        choonCommand(username);
      } else {
        logger.info("Choon Command Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!cheers"):
      if (isFeatureEnabled("cheers", subbedCheck)) {
        let targetuser: string | undefined;
        if (lowermessage.includes("@")) {
          let split = lowermessage.split("@");
          targetuser = split[1];
        }
        cheersCommand(username, targetuser);
      } else {
        logger.info("Cheers Command Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!jointrain"):
      if (settings.debug) {
        animations.hypetrainprogression(userId);
      } else {
        logger.info("Join Train Command Not Enabled");
      }
      break;

    case lowermessage.includes("!er"):
      if (isFeatureEnabled("emoterain", subbedCheck)) {
        emoteRainHandler(message, emotes, username);
      } else {
        logger.info("EmoteRain Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!k"):
      if (isFeatureEnabled("kappagen", subbedCheck)) {
        kappagenHandler(lowermessage, emotes, username);
      } else {
        logger.info("KappaGen Not Enabled or User Not Subscribed");
      }
      break;
    case lowermessage.includes("!hypetrainpreview"):
      //Only run if debug is enabled OR message comes from the admin panel
      if (
        isFeatureEnabled(
          "kappagen",
          (subbedCheck && settings.debug) || wsdata.event?.source == "Admin"
        )
      ) {
        animations.hypetrainpreview(username);
      } else {
        logger.info("KappaGen Not Enabled or User Not Subscribed");
      }
      break;

    default:
      if (typeof wsdata.data?.message?.emotes != "undefined") {
        emoteMessageHandler(emotes);
      }
      break;
  }
}

function actionsHandler(wsdata: WSData): void {
  let data = wsdata.data;
  let action = wsdata.data?.name;
}

function getEmoteImages(wsdata: WSData): string[] {
  const emotes = wsdata.data?.message?.emotes || [];
  const emotecount = emotes.length;

  let images: string[] = [];
  for (let i = 0; i < emotecount; i++) {
    if (emotes[i] && emotes[i].imageUrl) {
      images[i] = emotes[i].imageUrl;
    }
  }

  return images;
}

function checkCountMaximum(count: number): number {
  const settings = getSettings();
  if (count > settings.maxEmotes) {
    count = settings.maxEmotes;
  }
  return count;
}

/**
 * Handle !k (kappagen) command - picks a random enabled animation
 */
async function kappagenHandler(lowermessage: string, images: string[], username: string): Promise<void> {
  // Build pool of enabled animations
  const pool = buildRandomAnimationPool();
  
  if (pool.length === 0) {
    logger.info("No animations enabled for random pool");
    return;
  }
  
  // Pick a random animation from the pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  let selectedDef = pool[randomIndex];
  let animationName = selectedDef.name;
  
  // If it's a group, select a child
  if (selectedDef.isGroup) {
    const childName = selectGroupChild(selectedDef);
    if (!childName) {
      logger.info(`No enabled children for group: ${animationName}`);
      return;
    }
    animationName = childName;
    selectedDef = getAnimationDefinition(childName) || selectedDef;
  }
  
  // Get count and interval from command or settings
  const params = getAnimationParams(animationName);
  let count = helpers.getCommandValue(lowermessage, "count") ?? params.count;
  count = checkCountMaximum(count);
  let interval = helpers.getCommandValue(lowermessage, "interval") ?? params.interval;
  
  logger.info(
    `Rolled: ${randomIndex}. Running: ${animationName} with ${count} emote(s) every ${interval} ms`
  );
  
  await executeAnimation(animationName, images, count, interval, username);
}

/**
 * Handle !er (emote rain) command - runs a specific animation
 */
async function emoteRainHandler(message: string, images: string[], username: string): Promise<void> {
  const lowermessage = message.toLowerCase();
  const regexp = /!er (\w+)/gm;
  const matches = regexp.exec(lowermessage);
  
  if (!matches || !matches[1]) {
    logger.info("No animation specified for !er");
    return;
  }
  
  let animationName = matches[1];
  logger.info("Running emoteRain: " + animationName);
  
  // Check if animation exists in registry
  let def = getAnimationDefinition(animationName);
  
  if (!def) {
    // Try to find if it's a direct animation function that exists
    if (animations.hasOwnProperty(animationName) && typeof animations[animationName] === "function") {
      // Allow direct animation calls even if not in registry
      logger.info(`Animation ${animationName} found as direct function`);
    } else {
      logger.info(`Animation ${animationName} not found`);
      return;
    }
  }
  
  // Check if animation is enabled for manual execution
  if (!isAnimationEnabledManual(animationName)) {
    logger.info(`Animation ${animationName} is disabled for manual execution`);
    return;
  }
  
  // If it's a group, select a random enabled child
  if (def?.isGroup) {
    const childName = selectGroupChild(def);
    if (!childName) {
      logger.info(`No enabled children for group: ${animationName}`);
      return;
    }
    animationName = childName;
    def = getAnimationDefinition(childName);
  }
  
  // Get parameters
  const params = getAnimationParams(animationName);
  let count = helpers.getCommandValue(lowermessage, "count") ?? params.count;
  count = checkCountMaximum(count);
  let interval = helpers.getCommandValue(lowermessage, "interval") ?? params.interval;
  
  // Extract text for text animation
  let text: string | undefined;
  if (def?.requiresText) {
    const textRegexp = /text\s+(\S+)/i;
    const textMatches = textRegexp.exec(message);
    if (textMatches && textMatches[1]) {
      text = textMatches[1];
    }
  }
  
  await executeAnimation(animationName, images, count, interval, username, text);
}

//Normal emotes animations
function emoteMessageHandler(emotes: string[]): void {
  let emoteCount = emotes.length;
  let randomAnimation = Math.round(helpers.Randomizer(1, 4));
  switch (randomAnimation) {
    case 1:
      animations.rain(emotes, emoteCount);
      break;

    case 2:
      animations.bounce(emotes, emoteCount);
      break;

    case 3:
      animations.fade(emotes, emoteCount);
      break;
    case 4:
      animations.dvd(emotes, emoteCount);
      break;
  }
}

async function firstWordsHander(wsdata: WSData): Promise<void> {
  const settings = getSettings();
  const subbedCheck =
    !settings.subOnly || (settings.subOnly && wsdata.data?.message?.subscriber);
  if (!isFeatureEnabled("firstwords", subbedCheck)) {
    logger.info("First Words Detected but Not Enabled");
    return;
  }

  const username = wsdata.data?.message?.username || "";

  try {
    const avatar = await helpers.getTwitchAvatar(username);
    animations.rain([avatar], settings.defaultEmotes, 50);
  } catch (error) {
    logger.error(`Error getting avatar: ${(error as Error).message}`);
  }
}

async function cheersCommand(
  username: string,
  targetuser?: string
): Promise<void> {
  const settings = getSettings();
  logger.info("Cheers: " + username + (targetuser || ""));

  try {
    const images = [
      await helpers.getTwitchAvatar(username),
      (
        (targetuser && (await helpers.getTwitchAvatar(targetuser))) ||
        (settings.twitchUsername && (await helpers.getTwitchAvatar(settings.twitchUsername))) ||
        "https://static-cdn.jtvnw.net/jtv_user_pictures/8e051a26-051f-4abe-bcfa-e13a5d13fad0-profile_image-300x300.png"
      ),
    ];

    const delayedFunction = helpers.executeWithInterval(
      () => animations.cheers(images),
      15000
    );
    delayedFunction();
  } catch (error) {
    logger.error(`Error in cheers command: ${(error as Error).message}`);
  }
}

async function choonCommand(username: string): Promise<void> {
  try {
    const avatar = await helpers.getTwitchAvatar(username);
    animations.choon([avatar]);
  } catch (error) {
    logger.error(`Error getting avatar: ${(error as Error).message}`);
  }
}

async function lurkCommand(username: string): Promise<void> {
  try {
    const avatar = await helpers.getTwitchAvatar(username);
    animations.lurking(avatar, 3);
  } catch (error) {
    logger.error(`Error getting avatar: ${(error as Error).message}`);
  }
}

async function shoutoutCommand(lowermessage: string): Promise<void> {
  const settings = getSettings();
  // ALLOW - And other word symbols
  let regexp = /\@(.*)/;
  let matches = lowermessage.match(regexp);
  if (!matches || !matches[1]) return;

  const sousername = matches[1];
  logger.info("Shoutout Called with username: " + sousername);

  try {
    const avatar = await helpers.getTwitchAvatar(sousername);
    animations.rain([avatar], settings.defaultEmotes, 50);
  } catch (error) {
    logger.error(`Error getting avatar for shoutout: ${(error as Error).message}`);
  }
}

function botChat(message: string): void {
  const ws = globalVars.ws;
  ws.send(
    JSON.stringify({
      request: "DoAction",
      action: {
        name: "ERTwitchBotChat",
      },
      args: {
        message: message,
      },
      id: "123",
    })
  );
}

export default {
  chatMessageHandler,
  actionsHandler,
  emoteMessageHandler,
  firstWordsHander,
  cheersCommand,
  choonCommand,
  lurkCommand,
  shoutoutCommand,
};
