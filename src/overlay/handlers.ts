import Variables from "./config.ts";
import { WSData, EmoteData } from "../shared/types.ts";
const { globalVars, globalConst } = Variables;

import helpers from "./helpers.ts";
import animations from "./animations.ts";

// Variable to track if bot chat is enabled
let Botchat: boolean = false;

function chatMessageHandler(wsdata: WSData): void {
  const message = wsdata.data?.message?.message || "";
  const lowermessage = message.toLowerCase();
  const username = wsdata.data?.message?.username || "";
  const userId = wsdata.data?.message?.userId || "";

  //Lurk
  if (lowermessage.includes("!lurk")) {
    if (!globalConst.lurk && !globalConst.all) {
      console.log("Lurk Not Enabled");
      return;
    }
    lurkCommand(username);
  }

  //Shoutout
  if (lowermessage.includes("!so")) {
    if (!globalConst.welcome && !globalConst.all) {
      console.log("Shoutout Not Enabled");
      return;
    }
    shoutoutCommand(lowermessage);
  }

  //Choon
  if (lowermessage.includes("!choon") || lowermessage.includes("!tune")) {
    if (!globalConst.all && !globalConst.choon) {
      console.log("Choon Command Not Enabled");
      return;
    }
    choonCommand(username);
  }

  //Cheers
  if (lowermessage.includes("!cheers")) {
    if (!globalConst.all && !globalConst.cheers) {
      console.log("Cheers Command Not Enabled");
      return;
    }

    let targetuser: string | undefined;

    if (lowermessage.includes("@")) {
      let split = lowermessage.split("@");
      targetuser = split[1];
    }
    cheersCommand(username, targetuser);
  }

  //Join Hype Train Command for Testing
  if (lowermessage.includes("!jointrain")) {
    if (!globalConst.debug) {
      console.log("Join Train Command Not Enabled");
      return;
    }
    animations.hypetrainprogression(userId);
  }

  //TestCommand:
  //emoteVolcano(['https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2758558107d148c9b1e73c56cb2d9e06/default/dark/2.0', 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcaf0a56231d4443a91546b869b96a25/default/dark/2.0'], 100, 20);

  if (typeof wsdata.data?.message?.emotes != "undefined") {
    emoteMessageHandler(wsdata);
  }
}

function actionsHandler(wsdata: WSData): void {
  let data = wsdata.data;
  let action = wsdata.data?.name;
}

function emoteMessageHandler(wsdata: WSData): void {
  const message = wsdata.data?.message?.message || "";
  const lowermessage = message.toLowerCase();
  const userrole = wsdata.data?.message?.role || "";
  const sub = wsdata.data?.message?.subscriber || false;
  const emotes = wsdata.data?.message?.emotes || [];
  const emotecount = emotes.length;

  let images: string[] = [];
  for (let i = 0; i < emotecount; i++) {
    if (emotes[i] && emotes[i].imageUrl) {
      images[i] = emotes[i].imageUrl;
    }
  }

  let eInterval: number = helpers.getCommandValue(lowermessage, "interval");
  let eCount: number = helpers.getCommandValue(lowermessage, "count");

  if (eCount != null) {
    if (eCount > globalConst.maxemotes) {
      eCount = globalConst.maxemotes;
    }
  }

  //TextCommand, FunctionName, DefaultEmotes, DefaultInterval
  let animationMap: [string, string, number, number, string, string?][] = [
    ["!er rain", "rain", 50, 50, "rain"],
    ["!er rise", "rise", 100, 50, "rise"],
    ["!er explode", "explode", 100, 20, "explode"],
    ["!er volcano", "volcano", 100, 20, "volcano"],
    ["!er firework", "firework", 100, 20, "firework"],
    ["!er rightwave", "rightWave", 100, 20, "waves"],
    ["!er leftwave", "leftWave", 100, 20, "waves"],
    ["!er carousel", "carousel", 100, 150, "carousel"],
    ["!er spiral", "spiral", 100, 170, "spiral"],
    ["!er comets", "comets", 100, 50, "comets"],
    ["!er dvd", "dvd", 8, 50, "dvd"],
    ["!er text", "text", 1, 25, "text", "HYPE"],
    ["!er cyclone", "cyclone", 100, 30, "cyclone"],
    ["!er tetris", "tetris", 50, 40, "tetris"],
  ];

  //Specific Animation Commands
  if (globalConst.emoterain) {
    if (globalConst.subonly && !sub) {
      console.log("Sub Only Mode enabled, Messsage was not from a Sub");
      return;
    }
  }

  animationMap.forEach(function (animation) {
    if (!lowermessage.startsWith(animation[0])) {
      return;
    }

    if (!eCount) {
      eCount = animation[2];
    }
    if (!eInterval) {
      eInterval = animation[3];
    }
    let emoteText = false;

    //EmoteText Specific Handling
    if (animation[1] == "emoteText") {
      emoteText = true;

      //Set Default Text if no text supplied
      let text = "Hype";

      //Get Text from Command
      let regexp = /text (\S*)/gm;
      let matches = regexp.exec(message);
      if (matches && matches[1]) {
        text = matches[1];
      }

      if (emotes.length < 1 && Botchat) {
        let message =
          "Invalid Syntax, please try using '!er text <WordToWrite> <Emotes to use>'";
        botChat(message);
      }

      //Ensure that text was supplied by checking if the text string matches the first emote
      let emotenames = "";
      for (const emote of emotes) {
        emotenames = emotenames + emote["name"] + " ";
      }

      console.log("running emoteText:  " + text + ". module: " + animation[4]);
      animations[animation[1]](images, text, eInterval);
      return;
    }

    console.log(
      "running " +
        animation[1] +
        " with " +
        eCount +
        " emote(s)" +
        " and interval " +
        eInterval +
        ". module: " +
        animation[4]
    );
    if (animations.hasOwnProperty(animation[1])) {
      animations[animation[1]](images, eCount, eInterval);
    } else {
      console.log("Animation Function Mapping Failed");
    }
  });

  //Kappagen Animations
  if (globalConst.kappagen) {
    if (globalConst.subonly && !sub) {
      console.log("Sub Only Mode enabled, Messsage was not from a Sub");
      return;
    }

    if (lowermessage.includes("!k ")) {
      let rAnimation = Math.round(
        helpers.Randomizer(0, animationMap.length - 1)
      );
      if (!eCount) {
        eCount = animationMap[rAnimation][2];
      }
      if (!eInterval) {
        eInterval = animationMap[rAnimation][3];
      }

      // let aniModule = animationMap[rAnimation][4];
      let aniFunction = animationMap[rAnimation][1];

      console.log(
        "Rolled: " +
          rAnimation +
          ". Running: " +
          aniFunction +
          " with " +
          eCount +
          " emote(s)" +
          " and interval " +
          eInterval
      );
      if (
        animations.hasOwnProperty(aniFunction) &&
        typeof animations[aniFunction] === "function"
      ) {
        animations[aniFunction](images, eCount, eInterval);
      } else {
        console.log("Animation Function Mapping Failed");
      }
    }
  }

  //Normal emotes animations
  let randomAnimation = Math.round(helpers.Randomizer(1, 4));
  switch (randomAnimation) {
    case 1:
      animations.rain(images, emotecount);
      break;

    case 2:
      animations.bounce(images, emotecount);
      break;

    case 3:
      animations.fade(images, emotecount);
      break;
    case 4:
      animations.dvd(images, emotecount);
      break;
  }
}

function firstWordsHander(wsdata: WSData): void {
  if (!globalConst.welcome && !globalConst.all) {
    console.log("First Words Not Enabled");
    return;
  }

  var username = wsdata.data?.message?.username || "";
  var xhttp = new XMLHttpRequest();
  console.log("created xmlhttp object");
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // get display image for the user
      console.log("got a user image response back");

      let avatar = [xhttp.responseText];
      //Trigger Animation
      animations.rain(avatar, globalConst.defaultemotes, 50);
    }
  };
  console.log(username);
  xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
  xhttp.send();
}

async function cheersCommand(
  username: string,
  targetuser?: string
): Promise<void> {
  console.log("Cheers: " + username + (targetuser || ""));
  let images: string[] = [];

  try {
    images.push(await helpers.getTwitchAvatar(username));
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (targetuser) {
    try {
      images.push(await helpers.getTwitchAvatar(targetuser));
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    images.push(
      "https://static-cdn.jtvnw.net/jtv_user_pictures/8e051a26-051f-4abe-bcfa-e13a5d13fad0-profile_image-300x300.png"
    );
  }

  const delayedFunction = helpers.executeWithInterval(function () {
    animations.cheers(images);
  }, 15000);

  delayedFunction();
}

function choonCommand(username: string): void {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // get display image for the user
      console.log("got a user image response back: " + xhttp.responseText);

      let avatar = [xhttp.responseText];

      //Disabled While Live
      animations.choon(avatar);
    }
  };

  xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
  xhttp.send();
}

function lurkCommand(username: string): void {
  var xhttp = new XMLHttpRequest();
  console.log("created xmlhttp object");
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // get display image for the user
      console.log("got the users image back");
      //Trigger Animation
      animations.lurking(xhttp.responseText, 3);
    }
  };
  xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
  xhttp.send();
}

function shoutoutCommand(lowermessage: string): void {
  // ALLOW - And other word symbols
  let regexp = /\@(.*)/;
  let matches = lowermessage.match(regexp);
  if (!matches || !matches[1]) return;

  let sousername = matches[1];
  console.log(sousername);
  let xhttp = new XMLHttpRequest();
  console.log("created xmlhttp object");
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // get display image for the user
      console.log("got a user image response back");

      let avatar = [xhttp.responseText];
      //console.log(avatar);
      animations.rain(avatar, globalConst.defaultemotes, 50);
    }
  };
  xhttp.open("GET", "https://decapi.me/twitch/avatar/" + sousername, true);
  xhttp.send();
}

function botChat(message: string): void {
  const ws = globalConst.ws;
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
