import Variables from './config.js';
const { globalVars, globalConst} = Variables;

import helpers from './helpers.js';
import animations from './animations.js';

function chatMessageHandler(wsdata) {
    var message = wsdata.data.message.message
    var lowermessage = wsdata.data.message.message.toLowerCase();
    var username = wsdata.data.message.username;
    var userId = wsdata.data.message.userId;

    //Lurk
    if (lowermessage.includes("!lurk")) {
      if(!globalConst.lurk && !globalConst.all){
        console.log("Lurk Not Enabled");
        return
      }
      lurkCommand(username);
    }

    //Shoutout
    if (lowermessage.includes("!so")) {
      if(!globalConst.welcome && !globalConst.all){
        console.log("Shoutout Not Enabled");
        return
      }
      shoutoutCommand(lowermessage);
    }

    //Choon
    if (lowermessage.includes("!choon")) {
      if(!globalConst.all){
        console.log("Choon Command Not Enabled");
        return
      }
      choonCommand(username);
    }

    //Cheers
    if (lowermessage.includes("!cheers") || lowermessage.includes("!tune")) {
      if(!globalConst.all){
        console.log("Cheers Command Not Enabled");
        return
      }

      let targetuser;

      if(lowermessage.includes("@")){
        let split = lowermessage.split('@');
        targetuser = split[1];

      }
      cheersCommand(username, targetuser);
    }

    //Join Hype Train Command for Testing
    if (lowermessage.includes("!jointrain")) {
      if(!debug){
        console.log("Cheers Command Not Enabled");
        return
      }
      animations.hypetrain.hypetrainprogression(userId);
    }

    //TestCommand: 
    //emoteVolcano(['https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2758558107d148c9b1e73c56cb2d9e06/default/dark/2.0', 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcaf0a56231d4443a91546b869b96a25/default/dark/2.0'], 100, 20);

    if (typeof wsdata.data.message.emotes != "undefined") {
      emoteMessageHandler(wsdata);
    }
  }

function actionsHandler(wsdata){
  let data = wsdata.data;
  let action = wsdata.data.name;

}

function emoteMessageHandler(wsdata){
  var message = wsdata.data.message.message
  var lowermessage = wsdata.data.message.message.toLowerCase();
  var userrole = wsdata.data.message.role;
  var sub = wsdata.data.message.subscriber;
  var emotecount = wsdata.data.message.emotes.length;

  var images = [];
  var i;
  for (i = 0; i < emotecount; i++) {
    images[i] = wsdata.data.message.emotes[i].imageUrl;
  }


  var eInterval = helpers.getCommandValue(lowermessage, "interval");
  var eCount = helpers.getCommandValue(lowermessage, "count");

  if(eCount != null) {
  if(eCount > maxemotes){
      eCount = maxemotes;           
  }
  }

  //TextCommand, FunctionName, DefaultEmotes, DefaultInterval
  let animationMap = [
  ['!er rain','emoteRain', 50, 50, 'rain'],
  ['!er rise', 'emoteRise', 100, 50, 'rise'],
  ['!er explode', 'emoteExplode', 100, 20, 'explode'],
  ['!er volcano', 'emoteVolcano', 100, 20, 'volcano'],
  ['!er firework', 'emoteFirework', 100, 20, 'firework'],
  ['!er rightwave', 'emoteRightWave', 100, 20, 'waves'],
  ['!er leftwave', 'emoteLeftWave', 100, 20, 'waves'],
  ['!er carousel', 'emoteCarousel', 100, 150, 'carousel'],
  ['!er spiral', 'emoteSpiral', 100, 170, 'spiral'],
  ['!er comets', 'emoteComets', 100, 50, 'comets'],
  ['!er dvd', 'emoteDVD', 8, 50, 'dvd'],
  ['!er text', 'emoteText', 'HYPE', 25, 'text'],
  //['!er cube', 'emoteCube', 8, 50],
  ];



  //Specific Animation Commands
  if (globalConst.emoterain){
    if (globalConst.subonly & !sub) {
      console.log("Sub Only Mode enabled, Messsage was not from a Sub");
      return
    }
  }


  animationMap.forEach(function (animation) {
    if (!lowermessage.startsWith(animation[0])) {
      return
    }

    if(!eCount){eCount = animation[2];}
    if(!eInterval){eInterval = animation[3]}

    //EmoteText Specific Handling
    if(animation[1] == "emoteText") {
        let regexp = /text (\S*)/gm;  
        let matches = regexp.exec(wsdata.data.message.message);
        eCount = matches[1];

        if(wsdata.data.message.emotes.length < 1 && Botchat){
        let message = "Invalid Syntax, please try using '!er text <WordToWrite> <Emotes to use>'"
        botChat(message);
        }

        //Ensure that text was supplied by checking if the text string matches the first emote
        let emotenames = "";
        for(const emote of wsdata.data.message.emotes) {
        emotenames = emotenames + emote["name"] + " ";
        }
        //Set Default Text if no text supplied
        if(emotenames.includes(eCount)){
        eCount = "Hype";
        }                
    }

    
    console.log("running " + animation[1] + " with " + eCount + " emote(s)" + " and interval " + eInterval + ". module: " + animation[4]);
    if (animations.hasOwnProperty(animation[4]) && animations[animation[4]].hasOwnProperty(animation[1]) && typeof animations[animation[4]][animation[1]] === 'function'){
      animations[animation[4]][animation[1]](images, eCount, eInterval);
    } else {
      console.log("Animation Function Mapping Failed");
    }

      
  });
  


  //Kappagen Animations
  if (globalConst.kappagen){
    if (globalConst.subonly & !sub) {
      console.log("Sub Only Mode enabled, Messsage was not from a Sub");
      return
  }

  if(lowermessage.includes("!k ")) {
      let rAnimation = Math.round(helpers.Randomizer(0,animationMap.length - 1 ));
      if(!eCount){eCount = animationMap[rAnimation][2];}
      if(!eInterval){eInterval = animationMap[rAnimation][3];}

      let aniModule = animationMap[rAnimation][4];
      let aniFunction = animationMap[rAnimation][1];
      
      console.log("Rolled: " + rAnimation + ". Running: " + aniModule + " : " + aniFunction + " with " + eCount + " emote(s)" + " and interval " + eInterval);
      if (animations.hasOwnProperty(aniModule) && animations[aniModule].hasOwnProperty(aniFunction) && typeof animations[aniModule][aniFunction] === 'function'){
        animations[aniModule][aniFunction](images, eCount, eInterval);
      } else {
        console.log("Animation Function Mapping Failed");
      }
  }

}

  //Normal emotes animations
  let randomAnimation = Math.round(helpers.Randomizer(1,3));
    switch(randomAnimation) {
    case 1:
        animations.rain.emoteRain(images, emotecount);
        break;

    case 2:  
        animations.bounce.emoteBounce(images, emotecount);
        break;
    case 3:
        animations.fade.create(images, emotecount);
  };
}

function firstWordsHander(wsdata){
    if(!globalConst.welcome && !globalConst.all){
    console.log("First Words Not Enabled");
    return
    }
    
    var username = wsdata.data.user.name;
    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got a user image response back");
        
        avatar = [xhttp.responseText];
        //Trigger Animation
        animations.rain.emoteRain(avatar, defaultemotes, 50);

    }
    };
    console.log(username);
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
    xhttp.send();          
}


async function cheersCommand(username, targetuser){

  console.log("Cheers: " + username + targetuser);
  let images = [];

    try {
        images.push(await helpers.getTwitchAvatar(username));
    } catch (error) {
        console.error(error);
        throw error;
    }
  
    if(targetuser){
      try {
          images.push(await helpers.getTwitchAvatar(targetuser));
      } catch (error) {
          console.error(error);
          throw error;
      }
        //images.push(helpers.getTwitchAvatar(targetuser));
    } else {
      images.push("https://static-cdn.jtvnw.net/jtv_user_pictures/8e051a26-051f-4abe-bcfa-e13a5d13fad0-profile_image-300x300.png");
    }

    const delayedFunction = helpers.executeWithInterval(function () {
      animations.cheers.create(images);
    }, 15000); 

    delayedFunction();
}

function choonCommand(username){
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
    // get display image for the user
    console.log("got a user image response back: " + xhttp.responseText);
    // console.log(xhttp.responseText);
    
    let avatar = [xhttp.responseText];
    
    //Disabled While Live
    animations.choon.createAvatarChoon(avatar);

    }
};

xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
xhttp.send();
}

// function incomingRaid(data){


//     //RAIDER NAMES DEPRECATED. Switching to just passing the raider details and count  
//     var raiders = data.arguments.raiderNames.split(',');
  
//     console.log(raiders);
  
//     raiders.forEach(async (raider) => {
//       var username = raider;
//       var xhttp = new XMLHttpRequest();
//       console.log("created xmlhttp object");
//       xhttp.onreadystatechange = function () {
//         if (this.readyState == 4 && this.status == 200) {
//           // get display image for the user
//           console.log("got a user image response back");
          
//           avatar = [xhttp.responseText];
//           //Trigger Animation
//           animations.createRaider(avatar);
  
//         }
//       };
//       console.log(username);
//       xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
//       xhttp.send();  
  
//     });
// }

function lurkCommand(username){
    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got the users image back");         
        //Trigger Animation
        animations.lurking.create(xhttp.responseText, 3);
      }
    };
    //console.log(username);
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
    xhttp.send();   
}
  
function shoutoutCommand(lowermessage){
            
    // ALLOW - And other word symbols
    let regexp = /\@(.*)/;
    let matches = lowermessage.match(regexp);
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
        animations.rain.emoteRain(avatar, globalConst.defaultemotes, 50);

      }
    };
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + sousername, true);
    xhttp.send();           
}

function botChat(message){
  ws.send(JSON.stringify(
    {
      "request": "DoAction",
      "action": {
        "name": "ERTwitchBotChat"
      },
      "args": {
        "message": message,
      },
      "id": "123"
    }
  ));
}

export default {
  chatMessageHandler,
  actionsHandler,
  emoteMessageHandler,
  firstWordsHander,
  cheersCommand,
  choonCommand,
  lurkCommand,
  shoutoutCommand
}