const urlParams = new URLSearchParams(window.location.search);

let server = urlParams.get('server');
if (!(server === null)) {
  server="ws://"+server+"/";
}
else {
  server="ws://localhost:8080/";
}


let maxemotes = urlParams.get('maxemotes') === null ? 200 : urlParams.get('maxemotes');
let subonly = urlParams.get('subonly') === null ? false : true;
let emoterain = urlParams.get('emoterain') === null ? false : true;
let welcome = urlParams.get('welcome') === null ? false : true;
let all = urlParams.get('all') === null ? false : true;
let lurk = urlParams.get('lurk') === null ? false : true;
let kappagen = urlParams.get('kappagen') === null ? false : true;
let debug = urlParams.get('debug') === null ? false : true;
let hypetrain = urlParams.get('hypetrain') === null ? false : true;
let cheers = urlParams.get('cheers') === null ? false : true;
let choon = urlParams.get('choon') === null ? false : true;


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
    hypetrain,
    cheers,
    choon
};

if(globalConst.debug) {
  console.log(globalConst);
  console.log(globalVars);
}
  
export default {
    globalVars,
    globalConst
};