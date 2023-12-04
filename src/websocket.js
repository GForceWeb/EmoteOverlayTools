import Variables from './config.js';
import animations from './animations.js';
import handlers from './handlers.js';


const { globalVars, globalConst} = Variables;


let ws = globalConst.ws;

function connectws() {
    if ("WebSocket" in window) {
     
      ws.onclose = function () {
        // "connectws" is the function we defined previously
        setTimeout(connectws, 10000);
      };
  
      //Enable all Events
      ws.onopen = function () {
        ws.send(JSON.stringify(
          {
            "request": "Subscribe",
            "events": {
              "Twitch": [
                "ChatMessage", "FirstWord", "HypeTrainStart", "HypeTrainUpdate", "HypeTrainLevelUp", "HypeTrainEnd", "Raid" 
              ],
              "Raw": [
                "Action"
              ],
              "General": [
                "Custom"
              ]
            },
            "id": "123"
          }
        ));
  
        ws.send(JSON.stringify(
          {
            "request": "GetActions",
            "id": "ActionList"
          }
        ));
      
      };
  
      ws.onmessage = function (event) {
        // grab message and parse JSON
        const msg = event.data;
        const wsdata = JSON.parse(msg);
  
        console.log(wsdata);
  
        //SetupChecks
        if(typeof wsdata.actions != "undefined" && typeof wsdata.id == "ActionList") {
          let ChatAction = wsdata.actions.filter(function (SBAction) { return SBAction.name == "ERTwitchBotChat" });
          console.log(ChatAction);
          if(ChatAction.length >= 1){
            console.log("True");
            Botchat = true;
          }
        }
  
        //Check if the channel is a gforce sub IN PROGRESS
        if(!globalConst.channelsub) {
            //   let channelsub = true;
            //console.log("I should only see this once");
        }
  
  
        //Check for Undefined WS Events
        if (typeof wsdata.event == "undefined") {
          console.log("Event undefined");
          return;
        }
        if (typeof wsdata.event.type == "undefined") {
          console.log("Event Type undefined");
          return;
        }
  
        //Pass to ChatMessageHandler 
        if (wsdata.event.type == "ChatMessage") {
            handlers.chatMessageHandler(wsdata);
            if(globalConst.debug){console.log("Passed to ChatMessageHandler");} 
            return;
        }
  
        //Pass to FirstWordsHandler 
        if (wsdata.event.type == "FirstWord") {
            handlers.firstWordsHander(wsdata);
            return;
        }
  
        //Hype Train Start - Start the repeating train animation with the train head image and the first cart
        if (wsdata.event.type == "HypeTrainStart") {
            animations.hypetrain.hypetrainstart();
            return;
        }
  
        //Hype Train Level Up - Add a cart to the end of the train
        if (wsdata.event.type == "HypeTrainLevelUp") {
            animations.hypetrain.hypetrainlevelup();  
            return;
        }
  
  
        //Hype Progression - Add a user to the current train cart
        if (wsdata.event.type == "HypeTrainUpdate") {
          animations.hypetrain.hypetrainprogression(wsdata.data.userId);
          return;
        }
  
        //Hype Train Finish - Remove the Train
        if (wsdata.event.type == "HypeTrainEnd") {
          animations.hypetrain.hypetrainfinish();
          return;
        }

        //Incoming Raid
        if (wsdata.event.type == "Raid") {
          animations.hypetrain.incomingRaid(wsdata.data.from_broadcaster_user_id, wsdata.data.from_broadcaster_user_name, wsdata.data.viewers);
          return;
        }
  
        //CoinFlipResults
        if (wsdata.event.type == "Custom") {
          if (wsdata.data.coinFlipResult == "undefined") {
            return
          }
  
          if(wsdata.data.coinFlipResult == "Heads"){
            animations.coinflip.createCoins(1, "Heads" );
          }
          if(wsdata.data.coinFlipResult == "Tails"){
            animations.coinflip.createCoins(1, "Tails" );
          }
        }
  
        //Actions
        if(wsdata.event.type == "Action"){
          handlers.actionsHandler(wsdata);
          return
        }
      }
    }
  }



// Function 2
function handleMessage(message) {
// Message handling logic goes here
}

// Export the functions as a single object
export default {
    connectws,
    handleMessage
};