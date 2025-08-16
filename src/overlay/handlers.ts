import { globalVars } from "./config.ts";
import { WSData } from "../shared/types.ts";
import OverlaySettings from "./settings";
const settings = OverlaySettings.settings;

import helpers from "./helpers.ts";
import animations from "./animations.ts";

// Variable to track if bot chat is enabled
let Botchat: boolean = false;

let ani = settings.animations;
let animationMap: [string, number, number][] = [
  [
    "rain", // FunctionName: The name of the animation function to be called.
    ani.rain.count ?? 50, // DefaultEmotes: The default number of emotes for the animation.
    ani.rain.interval ?? 50, // DefaultInterval: The default interval (in milliseconds) between emotes for the animation.
  ],
  ["rise", ani.rise.count ?? 100, ani.rise.interval ?? 50],
  ["explode", ani.explode.count ?? 100, ani.explode.interval ?? 20],
  ["volcano", ani.volcano.count ?? 100, ani.volcano.interval ?? 20],
  ["firework", ani.firework.count ?? 100, ani.firework.interval ?? 20],
  ["rightwave", ani.rightwave.count ?? 100, ani.rightwave.interval ?? 20],
  ["leftwave", ani.leftwave.count ?? 100, ani.leftwave.interval ?? 20],
  ["carousel", ani.carousel.count ?? 100, ani.carousel.interval ?? 150],
  ["spiral", ani.spiral.count ?? 100, ani.spiral.interval ?? 170],
  ["comets", ani.comets.count ?? 100, ani.comets.interval ?? 50],
  ["dvd", ani.dvd.count ?? 8, ani.dvd.interval ?? 50],
  ["text", ani.text.count ?? 1, ani.text.interval ?? 25],
  ["cyclone", ani.cyclone.count ?? 100, ani.cyclone.interval ?? 30],
  ["tetris", ani.tetris.count ?? 50, ani.tetris.interval ?? 40],
  ["cube", ani.cube.count ?? 100, ani.cube.interval ?? 50]
];

function isFeatureEnabled(feature: string, subbedCheck: boolean): boolean {
  return (
    (settings.enableAllFeatures || settings.features[feature]) && subbedCheck
  );
}

function chatMessageHandler(wsdata: WSData): void {
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
        console.log("Lurk Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!so"):
      if (isFeatureEnabled("welcome", subbedCheck)) {
        shoutoutCommand(lowermessage);
      } else {
        console.log("Shoutout Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!choon") || lowermessage.includes("!tune"):
      if (isFeatureEnabled("choon", subbedCheck)) {
        choonCommand(username);
      } else {
        console.log("Choon Command Not Enabled or User Not Subscribed");
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
        console.log("Cheers Command Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!jointrain"):
      if (settings.debug) {
        animations.hypetrainprogression(userId);
      } else {
        console.log("Join Train Command Not Enabled");
      }
      break;

    case lowermessage.includes("!er"):
      if (isFeatureEnabled("emoterain", subbedCheck)) {
        emoteRainHandler(lowermessage, emotes);
      } else {
        console.log("EmoteRain Not Enabled or User Not Subscribed");
      }
      break;

    case lowermessage.includes("!k"):
      if (isFeatureEnabled("kappagen", subbedCheck)) {
        kappagenHandler(lowermessage, emotes);
      } else {
        console.log("KappaGen Not Enabled or User Not Subscribed");
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
        console.log("KappaGen Not Enabled or User Not Subscribed");
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

function checkCountMaximum(count): number {
  if (count > settings.maxEmotes) {
    count = settings.maxEmotes;
  }
  return count;
}

function kappagenHandler(lowermessage, images): void {
  let rAnimation = Math.round(helpers.Randomizer(0, animationMap.length - 1));
  let count =
    helpers.getCommandValue(lowermessage, "count") ??
    animationMap[rAnimation][1];
  count = checkCountMaximum(count);
  let interval =
    helpers.getCommandValue(lowermessage, "interval") ??
    animationMap[rAnimation][2];
  let animation = animationMap[rAnimation][0];

  console.log(
    `Rolled: ${rAnimation}. Running: ${animation} with ${count} emote(s) every ${interval} ms`
  );

  if (
    animations.hasOwnProperty(animation) &&
    typeof animations[animation] === "function"
  ) {
    animations[animation](images, count, interval);
  } else {
    console.log("Animation Function Mapping Failed");
  }
}

function emoteRainHandler(lowermessage, images): void {
  //Get !er animation with regex from lowermessage
  let regexp = /!er (\w*)/gm;
  let matches = regexp.exec(lowermessage);
  if (matches && matches[1]) {
    let animation = matches[1];
    console.log("Running emoteRain: " + animation);
    if (animation == "text") {
      //Set Default Text if no text supplied
      let text = "Hype";
      let interval =
        helpers.getCommandValue(lowermessage, "interval") ??
        animationMap["text"][2];
      //Get Text from Command
      let regexp = /text (\S*)/gm;
      let matches = regexp.exec(lowermessage);
      if (matches && matches[1]) {
        text = matches[1];
      }

      animations.text(images, text, interval);

      return;
    }
    //Check if animation is in the list of animationMap
    let animationCheck = animationMap.find((item) => item[0] == animation);
    if (animationCheck) {
      let count =
        helpers.getCommandValue(lowermessage, "count") ?? animationCheck[1];
      count = checkCountMaximum(count);
      let interval =
        helpers.getCommandValue(lowermessage, "interval") ?? animationCheck[2];
      animations[animation](images, count, interval);
    } else {
      console.log(`Animation ${animation} Not Found in animationMap`);
    }
  }
}

//Normal emotes animations
function emoteMessageHandler(emotes): void {
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
  const subbedCheck =
    !settings.subOnly || (settings.subOnly && wsdata.data?.message?.subscriber);
  if (!isFeatureEnabled("firstwords", subbedCheck)) {
    console.log("First Words Not Enabled");
    return;
  }

  const username = wsdata.data?.message?.username || "";

  try {
    const avatar = await helpers.getTwitchAvatar(username);
    animations.rain([avatar], settings.defaultEmotes, 50);
  } catch (error) {
    console.error("Error getting avatar:", error);
  }
}

async function cheersCommand(
  username: string,
  targetuser?: string
): Promise<void> {
  console.log("Cheers: " + username + (targetuser || ""));

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
    console.error("Error in cheers command:", error);
  }
}

async function choonCommand(username: string): Promise<void> {
  try {
    const avatar = await helpers.getTwitchAvatar(username);
    animations.choon([avatar]);
  } catch (error) {
    console.error("Error getting avatar:", error);
  }
}

async function lurkCommand(username: string): Promise<void> {
  try {
    const avatar = await helpers.getTwitchAvatar(username);
    animations.lurking(avatar, 3);
  } catch (error) {
    console.error("Error getting avatar:", error);
  }
}

async function shoutoutCommand(lowermessage: string): Promise<void> {
  // ALLOW - And other word symbols
  let regexp = /\@(.*)/;
  let matches = lowermessage.match(regexp);
  if (!matches || !matches[1]) return;

  const sousername = matches[1];
  console.log(sousername);

  try {
    const avatar = await helpers.getTwitchAvatar(sousername);
    animations.rain([avatar], settings.defaultEmotes, 50);
  } catch (error) {
    console.error("Error getting avatar:", error);
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
