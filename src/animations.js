import Variables from './config.js';
const { globalVars, globalConst} = Variables;
import helpers from './helpers.js';
import * as firework from './animations/firework.js';
import * as rain from './animations/rain.js';
import * as explode from './animations/explode.js';
import * as rise from './animations/rise.js';
import * as lurking from './animations/lurking.js';
import * as comets from './animations/comets.js';
import * as bounce from './animations/bounce.js';
import * as spiral from './animations/spiral.js';
import * as waves from './animations/waves.js';
import * as carousel from './animations/carousel.js';
import * as volcano from './animations/volcano.js';
import * as text from './animations/text.js';
import * as dvd from './animations/dvd.js';
import * as coinflip from './animations/coinflip.js';
import * as cube from './animations/cube.js';
import * as hypetrain from './animations/hypetrain.js';
import * as choon from './animations/choon.js';
import * as cheers from './animations/cheers.js'
import * as invaders from './animations/invaders.js';
import * as raiders from './animations/raiders.js';


const animationFunctions = {
    emoteRain: rain.emoteRain,
    emoteRise: rise.emoteRise,
    emoteExplode: explode.emoteExplode,
    emoteVolcano: volcano.emoteVolcano,
    emoteFirework: firework.emoteFirework,
    emoteRightWave: waves.emoteRightWave,
    emoteLeftWave: waves.emoteLeftWave,
    emoteCarousel: carousel.emoteCarousel,
    emoteSpiral: spiral.emoteSpiral,
    emoteComets: comets.emoteComets,
    emoteDVD: dvd.emoteDVD,
    emoteText: text.emoteText,
    emoteBounce: bounce.emoteBounce,
    emoteInvaders: invaders.emoteInvaders,
    //IN PROGRESS
    //emoteCube: cube.emoteCube,
};

function runAnimation(functionName, images, eCount, eInterval) {
    // Execute the function dynamically using the mapping object
    const animationFunction = animationFunctions[functionName];
    if (typeof animationFunction === 'function') {
      animationFunction(images, eCount, eInterval);
    } else {
      console.error(`Function '${functionName}' does not exist.`);
    }
  }

  
export default {
    runAnimation,
}

export const emoteFirework = firework.emoteFirework;
export const emoteRain = rain.emoteRain;
export const emoteExplode = explode.emoteExplode;
export const emoteRise = rise.emoteRise;
export const VisualLurk = lurking.VisualLurk;
export const emoteComets = comets.emoteComets;
export const emoteBounce = bounce.emoteBounce;
export const emoteSpiral = spiral.emoteSpiral;
export const emoteRightWave = waves.emoteRightWave;
export const emoteLeftWave = waves.emoteLeftWave;
export const emoteCarousel = carousel.emoteCarousel;
export const emoteVolcano = volcano.emoteVolcano;
export const emoteText = text.emoteText;
export const emoteDVD = dvd.emoteDVD;
export const createCoins = coinflip.createCoins;
export const emoteCube = cube.emoteCube;
export const hypetrainstart = hypetrain.hypetrainstart;
export const hypetrainfinish = hypetrain.hypetrainfinish;
export const hypetrainprogression = hypetrain.hypetrainprogression;
export const hypetrainlevelup = hypetrain.hypetrainlevelup;
export const createAvatarCheers = cheers.createAvatarCheers;
export const createAvatarChoon = choon.createAvatarChoon;
export const emoteInvaders = invaders.emoteInvaders;
export const incomingRaid = raiders.incomingRaid;