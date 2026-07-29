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
  const animationDef = getAnimationDefinition(animationName);
  
  return {
    count: animSettings?.count ?? animationDef?.defaultCount ?? 50,
    interval: animSettings?.interval ?? animationDef?.defaultInterval ?? 50,
  };
}

/**
 * Build the pool of animations enabled for kappagen random selection (!k)
 * This filters based on enabledKappagen and excludes group children
 * (groups handle their own child selection)
 */
function buildRandomAnimationPool(): AnimationDefinition[] {
  const pool: AnimationDefinition[] = [];
  
  for (const [name, registryDef] of Object.entries(animationRegistry)) {
    // Skip group children - they're selected through their parent group
    if (registryDef.group) {
      continue;
    }
    
    // Check if enabled for random pool
    if (isAnimationEnabledKappagen(name)) {
      // For groups, check if at least one child is enabled
      if (registryDef.isGroup && registryDef.children) {
        const enabledChildren = registryDef.children.filter((childName) =>
          isAnimationEnabledKappagen(childName)
        );
        if (enabledChildren.length > 0) {
          pool.push(registryDef);
        }
      } else {
        pool.push(registryDef);
      }
    }
  }
  
  return pool;
}

/**
 * Select a random enabled child animation from a group using the provided predicate.
 */
function selectEnabledGroupChild(
  groupDef: AnimationDefinition,
  isEnabled: (animationName: string) => boolean
): string | null {
  if (!groupDef.children || groupDef.children.length === 0) {
    return null;
  }

  const enabledChildren = groupDef.children.filter((childName) => isEnabled(childName));

  if (enabledChildren.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * enabledChildren.length);
  return enabledChildren[index];
}

function isValidAnimationName(animationName: string): boolean {
  if (getAnimationDefinition(animationName)) {
    return true;
  }
  return (
    animations.hasOwnProperty(animationName) &&
    typeof animations[animationName] === "function"
  );
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
  const animationDef = getAnimationDefinition(animationName);
  
  if (!animations.hasOwnProperty(animationName) || typeof animations[animationName] !== "function") {
    logger.error(`Animation function not found: ${animationName}`);
    return;
  }
  
  // Handle special requirements
  if (animationDef?.requiresAvatar) {
    try {
      const avatar = await helpers.getTwitchAvatar(username);
      animations[animationName](images, count, interval, avatar);
    } catch (error) {
      logger.error(`Error getting avatar for ${animationName}: ${(error as Error).message}`);
      animations[animationName](images, count, interval);
    }
  } else if (animationDef?.requiresText) {
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
  const emotes = getEmoteImages(wsdata, message);

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
      // Alias: users sometimes type `!k <animation>` but mean `!er <animation>`.
      // If the token after !k is a valid animation name, run it as if it were !er.
      {
        const aliasMatch = /^!k\s+(\w+)/i.exec(message);
        const aliasAnimation = aliasMatch?.[1];
        const shouldAliasToEr =
          !!aliasAnimation && isValidAnimationName(aliasAnimation.toLowerCase());

        if (shouldAliasToEr) {
          if (isFeatureEnabled("emoterain", subbedCheck)) {
            const erMessage = message.replace(/^!k\b/i, "!er");
            emoteRainHandler(erMessage, emotes, username);
          } else {
            logger.info("EmoteRain Not Enabled or User Not Subscribed");
          }
          break;
        }
      }

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

function summarizeAutomaticRewardPayload(wsdata: WSData): string {
  const dataRecord = helpers.asRecord(wsdata.data);
  const emoteRecord = helpers.asRecord(dataRecord?.gigantified_emote);

  return JSON.stringify({
    rewardType: helpers.getNestedString(wsdata.data, ["reward_type"]),
    gigantifiedEmoteUrl: helpers.getNestedString(wsdata.data, ["gigantified_emote", "imageUrl"]),
    dataKeys: dataRecord ? Object.keys(dataRecord) : [],
    emoteKeys: emoteRecord ? Object.keys(emoteRecord) : [],
  });
}

async function customEventHandler(wsdata: WSData): Promise<void> {
  const rounds = 3;
  const avatarsPerRound = 5;
  const roundDelayMs = 2000;
  const eventName = helpers.getFirstString(wsdata.data, [["eventName"]]);

  if (eventName !== "MaxOutMultiply") {
    return;
  }

  const multiplyUsers = helpers.getFirstString(wsdata.data, [
    ["args", "multiplyUsers"],
    ["multiplyUsers"],
  ]);

  if (!multiplyUsers) {
    logger.warning("MaxOutMultiply event missing multiplyUsers");
    return;
  }

  const usernames = [...new Set(helpers.getTrimmedCsvStrings(multiplyUsers))];

  if (usernames.length === 0) {
    logger.warning("MaxOutMultiply event had no valid users");
    return;
  }

  const avatarResults = await Promise.all(
    usernames.map(async (username) => {
      try {
        return await helpers.getTwitchAvatar(username);
      } catch (error) {
        logger.error(
          `Error getting avatar for MaxOutMultiply user ${username}: ${(error as Error).message}`
        );
        return null;
      }
    })
  );

  const avatars = avatarResults.filter((avatar): avatar is string => typeof avatar === "string");

  if (avatars.length === 0) {
    logger.warning("MaxOutMultiply event resolved no avatars");
    return;
  }

  const scheduledAvatars = helpers.repeatValuesToLength(avatars, rounds * avatarsPerRound);

  const params = getAnimationParams("firework");

  if (
    !animations.hasOwnProperty("firework") ||
    typeof animations.firework !== "function"
  ) {
    logger.error("Firework animation function not found");
    return;
  }

  for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
    const roundStart = roundIndex * avatarsPerRound;
    const roundAvatars = scheduledAvatars.slice(
      roundStart,
      roundStart + avatarsPerRound
    );

    setTimeout(() => {
      animations.firework(roundAvatars, params.count, params.interval);
    }, roundIndex * roundDelayMs);
  }
}

function gigantifyRedeemHandler(wsdata: WSData): void {
  const isAdminPreview = wsdata.event?.source === "Admin";

  if (!isAdminPreview && !isFeatureEnabled("gigantifyredeem", true)) {
    logger.info("Gigantify Emote Redeems Not Enabled");
    return;
  }

  const rewardType = helpers.getNestedString(wsdata.data, ["reward_type"]);

  logger.info(
    `AutomaticRewardRedemption payload summary: ${summarizeAutomaticRewardPayload(wsdata)}`
  );

  if (rewardType !== "gigantify_an_emote") {
    logger.info(
      `Ignoring automatic reward redemption. rewardType=${rewardType || "<missing>"}`
    );
    return;
  }

  const gigantifiedEmoteUrl = helpers.getNestedString(wsdata.data, [
    "gigantified_emote",
    "imageUrl",
  ]);

  if (!gigantifiedEmoteUrl) {
    logger.warning(
      `Gigantify reward missing emote URL. Payload summary: ${summarizeAutomaticRewardPayload(wsdata)}`
    );
    return;
  }

  if (
    !animations.hasOwnProperty("gigantify") ||
    typeof animations.gigantify !== "function"
  ) {
    logger.error("Gigantify animation function not found");
    return;
  }

  animations.gigantify([gigantifiedEmoteUrl]);
}

function extractEmojiStrings(message: string): string[] {
  // Matches:
  // - Keycap sequences: 1️⃣, #️⃣, *️⃣
  // - Regional indicator flags: 🇺🇸
  // - Extended pictographic emojis including ZWJ sequences and skin tone modifiers
  const emojiRegex =
    /(?:[0-9#*]\uFE0F?\u20E3)|(?:[\u{1F1E6}-\u{1F1FF}]{2})|(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:[\u{1F3FB}-\u{1F3FF}])?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:[\u{1F3FB}-\u{1F3FF}])?)*)/gu;

  const matches = message.match(emojiRegex);
  return matches ?? [];
}

function emojiToTwemojiUrl(emoji: string): string {
  const codepoints = Array.from(emoji)
    .map((char) => char.codePointAt(0)!.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codepoints}.png`;
}

function extractEmojiImageUrls(message: string): string[] {
  const unique = new Set<string>();
  for (const emoji of extractEmojiStrings(message)) {
    unique.add(emojiToTwemojiUrl(emoji));
  }
  return [...unique];
}

function getEmoteImages(wsdata: WSData, message?: string): string[] {
  const emotes = wsdata.data?.message?.emotes || [];
  const emotecount = emotes.length;

  const images: string[] = [];
  for (let i = 0; i < emotecount; i++) {
    if (emotes[i] && emotes[i].imageUrl) {
      images.push(emotes[i].imageUrl);
    }
  }

  const emojiUrls = extractEmojiImageUrls(message ?? wsdata.data?.message?.message ?? "");
  for (const url of emojiUrls) {
    if (!images.includes(url)) {
      images.push(url);
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
  let selectedAnimationDef = pool[randomIndex];
  let animationName = selectedAnimationDef.name;
  
  // If it's a group, select a child
  if (selectedAnimationDef.isGroup) {
    const childName = selectEnabledGroupChild(selectedAnimationDef, isAnimationEnabledKappagen);
    if (!childName) {
      logger.info(`No enabled children for group: ${animationName}`);
      return;
    }
    animationName = childName;
    selectedAnimationDef = getAnimationDefinition(childName) || selectedAnimationDef;
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
  let animationDef = getAnimationDefinition(animationName);
  
  if (!animationDef) {
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
  if (animationDef?.isGroup) {
    const childName = selectEnabledGroupChild(animationDef, isAnimationEnabledManual);
    if (!childName) {
      logger.info(`No enabled children for group: ${animationName}`);
      return;
    }
    animationName = childName;
    animationDef = getAnimationDefinition(childName);
  }
  
  // Get parameters
  const params = getAnimationParams(animationName);
  let count = helpers.getCommandValue(lowermessage, "count") ?? params.count;
  count = checkCountMaximum(count);
  let interval = helpers.getCommandValue(lowermessage, "interval") ?? params.interval;
  
  // Extract text for text animation
  let text: string | undefined;
  if (animationDef?.requiresText) {
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
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    logger.error("Unable to send bot chat message: WebSocket is not connected");
    return;
  }

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
  customEventHandler,
  gigantifyRedeemHandler,
  emoteMessageHandler,
  firstWordsHander,
  cheersCommand,
  choonCommand,
  lurkCommand,
  shoutoutCommand,
};
