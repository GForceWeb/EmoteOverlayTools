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
      cheersCommand(username);
    }

    //Join Hype Train Command for Testing
    if (lowermessage.includes("!jointrain")) {
      if(!debug){
        console.log("Cheers Command Not Enabled");
        return
      }
      hypetrainprogression(userId);
    }

    //Emotes
    //TestCommand: 
    //emoteVolcano(['https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2758558107d148c9b1e73c56cb2d9e06/default/dark/2.0', 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcaf0a56231d4443a91546b869b96a25/default/dark/2.0'], 100, 20);

    if (typeof wsdata.data.message.emotes != "undefined") {
      emoteMessageHandler(wsdata);
    }
  }

function actionsHandler(wsdata){
  var data = wsdata.data;
  var action = wsdata.data.name;

  if (action == "New Cheer" || action == "New Sub"){
      if(globalVars.hypetrainCache[2]){
      globalVars.hypetrainCache[3] = globalVars.hypetrainCache[2];
      globalVars.hypetrainCache[2] = globalVars.hypetrainCache[1];
      globalVars.hypetrainCache[1] = wsdata.data.arguments.userId;
      }
      else if(globalVars.hypetrainCache[1]){
      globalVars.hypetrainCache[2] = globalVars.hypetrainCache[1];
      globalVars.hypetrainCache[1] = wsdata.data.arguments.userId;
      }
      else {
      globalVars.hypetrainCache[1] = wsdata.data.arguments.userId;
      }
  }     

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
  ['!er rain','emoteRain', 50, 50],
  ['!er rise', 'emoteRise', 100, 50],
  ['!er explode', 'emoteExplode', 100, 20],
  ['!er volcano', 'emoteVolcano', 100, 20],
  ['!er firework', 'emoteFirework', 100, 20],
  ['!er rightwave', 'emoteRightWave', 100, 20],
  ['!er leftwave', 'emoteLeftWave', 100, 20],
  ['!er carousel', 'emoteCarousel', 100, 150],
  ['!er spiral', 'emoteSpiral', 100, 170],
  ['!er comets', 'emoteComets', 100, 50],
  ['!er dvd', 'emoteDVD', 8, 50],
  ['!er text', 'emoteText', 8, 25],
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

    
    console.log("running " + animation[1] + " with " + eCount + " emote(s)" + " and interval " + eInterval);
    animations.runAnimation(animation[1], images, eCount, eInterval);
    // let animationFunction = animationFunctions[animation[1]];

      
    });
  


  //Kappagen Animations
  if (globalConst.kappagen){
    if (globalConst.subonly & !sub) {
      console.log("Sub Only Mode enabled, Messsage was not from a Sub");
      return
  }

  if(lowermessage.includes("!k ")) {
      rAnimation = Math.round(helpers.Randomizer(0,animations.length));
      if(!eCount){eCount = animations[rAnimation][2];}
      if(!eInterval){eInterval = animations[rAnimation][3];}

      window[animations[rAnimation][1]](images, eCount, eInterval);
      console.log("running " + animations[rAnimation][1] + " with " + eCount + " emote(s)" + " and interval " + eInterval);
  }

}

  //Normal emotes animations
  let randomAnimation = Math.round(helpers.Randomizer(1,2));
    switch(randomAnimation) {
    case 1:
        animations.runAnimation('emoteRain', images, emotecount);
        break;

    case 2:  
        animations.runAnimation('emoteBounce', images, emotecount);
        break;
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
        animations.runAnimation('emoteRain', avatar, defaultemotes, 50);

    }
    };
    console.log(username);
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
    xhttp.send();          
}

function cheersCommand(username){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got a user image response back");
        // console.log(xhttp.responseText);
      
        let avatar = [xhttp.responseText];
        //createAvatarCheers(avatar);
      }
      xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
      xhttp.send();
    }
}
  
function choonCommand(username){
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
    // get display image for the user
    console.log("got a user image response back");
    // console.log(xhttp.responseText);
    
    let avatar = [xhttp.responseText];
    //Disabled While Live
    createAvatarChoon(avatar);

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
        VisualLurk(xhttp.responseText, 3);
      }
    };
    //console.log(username);
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
    xhttp.send();   
}
  
function shoutoutCommand(lowermessage){
            
    // ALLOW - And other word symbols
    const regexp = /\@(.*)/;
    const matches = lowermessage.match(regexp);
    const sousername = matches[1];
    console.log(sousername);
    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got a user image response back");
        // console.log(xhttp.responseText);
        
        avatar = [xhttp.responseText];
        emoteRain(avatar, defaultemotes, 50);

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