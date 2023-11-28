const urlParams = new URLSearchParams(window.location.search);

let server = urlParams.get('server');
if (!(server === null)) {
  server="ws://"+server+"/";
}
else {
  server="ws://localhost:8080/";
}


// const maxemotes = urlParams.get('maxemotes');
let maxemotes = urlParams.get('maxemotes') === null ? 200 : urlParams.get('maxemotes');
let subonly = urlParams.get('subonly') === null ? false : true;
let emoterain = urlParams.get('emoterain') === null ? false : true;
let welcome = urlParams.get('welcome') === null ? false : true;
let all = urlParams.get('all') === null ? false : true;
let lurk = urlParams.get('lurk') === null ? false : true;
let kappagen = urlParams.get('kappagen') === null ? false : true;
let debug = urlParams.get('debug') === null ? false : true;

// console.log(all);
// console.log(urlParams.get('all') );

// if(maxemotes === null){maxemotes = 200;}
// if(!(lurk === null )){lurk = true;} else {lurk = null;}
// if(!(kappagen === null )){kappagen = true;} else {kappagen = null;}
// //if(!(all === null )){all = true;} else {all = null;}
// if(!(subonly === null )){subonly = true;} else {subonly = null;}
// //if(!(emoterain === null )){emoterain = true;} else {emoterain = null;}
// if(!(welcome === null )){welcome = true;} else {welcome = null;}

if(all){
lurk = true;
emoterain = true;
kappagen = true;
welcome = true;
}


let channelsub; //TODO: Build out the G-Force Sub Requirement
let hypetrainCache = [];
// //Checks for SB Actions
let BotChat;
let hypetimer;
let HypeTrainWrapper;
let HypeCart;

let warp = document.getElementById("confetti-container");


const root = document.documentElement;

function setCSSVars() {
  // Get the window width and height
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let cssEmoteSizeStandard = Math.ceil(window.innerHeight / 14);
  let cssAvatarSizeStandard = Math.ceil(window.innerHeight / 5);

  // Set CSS variables based on window size
  root.style.setProperty('--emote-size-standard', cssEmoteSizeStandard + 'px');
  root.style.setProperty('--emote-size-large', cssEmoteSizeStandard * 2 + 'px');
  root.style.setProperty('--emote-size-small', cssEmoteSizeStandard / 2 + 'px');
  root.style.setProperty('--avatar-size-standard', cssAvatarSizeStandard + 'px');
  root.style.setProperty('--avatar-size-large', cssAvatarSizeStandard * 2 + 'px');
  root.style.setProperty('--avatar-size-small', cssAvatarSizeStandard / 2 + 'px');
}

// Call the function on page load and resize
window.addEventListener('load', setCSSVars);
window.addEventListener('resize', setCSSVars);


// Global variables
export var globalVars = {
    channelsub,
    hypetrainCache,
    //Checks for SB Actions
    BotChat,
    hypetimer,
    HypeTrainWrapper,
    HypeCart,
    divnumber: 0,
  };



// Global constants
export const globalConst = {
    defaultemotes: 50,
    maxemotes,
    ws: new WebSocket(server),
    warp: document.getElementById("confetti-container"),
    maxemotes,
    subonly,
    emoterain,
    welcome,
    all,
    lurk,
    kappagen,
    debug,
    warp,
};




  
export default {
    globalVars,
    globalConst
};