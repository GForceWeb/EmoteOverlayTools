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
import * as fade from './animations/fade.js';
import * as cyclone from './animations/cyclone.js';

const animations = {
  firework,
  rain,
  explode,
  rise,
  lurking,
  comets,
  bounce,
  spiral,
  waves,
  carousel,
  volcano,
  text,
  dvd,
  coinflip,
  cube,
  hypetrain,
  choon,
  cheers,
  invaders,
  raiders,
  fade,
  cyclone
}


// function runAnimation(functionName, images, eCount, eInterval) {
//     // Execute the function dynamically using the mapping object
//     const animationFunction = animationFunctions[functionName];
//     if (typeof animationFunction === 'function') {
//       animationFunction(images, eCount, eInterval);
//     } else {
//       console.error(`Function '${functionName}' does not exist.`);
//     }
//   }


export default animations;
