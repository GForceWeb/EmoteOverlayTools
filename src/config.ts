import { GlobalVars, GlobalConst } from './types';

const urlParams = new URLSearchParams(window.location.search);

let server = urlParams.get('server') === null ? "ws://localhost:8080/" : "ws://"+urlParams.get('server')+"/";

let maxemotes: number = urlParams.get('maxemotes') === null ? 200 : parseInt(urlParams.get('maxemotes'));
let subonly: boolean = urlParams.get('subonly') === null ? false : true;
let emoterain: boolean = urlParams.get('emoterain') === null ? false : true;
let welcome: boolean = urlParams.get('welcome') === null ? false : true;
let all: boolean = urlParams.get('all') === null ? false : true;
let lurk: boolean = urlParams.get('lurk') === null ? false : true;
let kappagen: boolean = urlParams.get('kappagen') === null ? false : true;
let debug: boolean = urlParams.get('debug') === null ? false : true;
let hypetrain: boolean = urlParams.get('hypetrain') === null ? false : true;
let cheers: boolean = urlParams.get('cheers') === null ? false : true;
let choon: boolean = urlParams.get('choon') === null ? false : true;


if(all){
  lurk = true;
  emoterain = true;
  kappagen = true;
  welcome = true;
}


let channelsub: boolean; //TODO: Build out the G-Force Sub Requirement
let hypetrainCache: string[] = [];
// //Checks for SB Actions
let BotChat: boolean;
let hypetimer: ReturnType<typeof setTimeout>;
let HypeTrainWrapper: HTMLElement;
let HypeCart: HTMLElement;

let warp = document.getElementById("confetti-container") as HTMLElement;


const root = document.documentElement;

function setCSSVars(): void {
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
export const globalVars: GlobalVars = {
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
export const globalConst: GlobalConst = {
  defaultemotes: 50,
  maxemotes,
  ws: new WebSocket(server),
  warp: document.getElementById("confetti-container") as HTMLElement,
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