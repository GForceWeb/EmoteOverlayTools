import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';

export function emoteExplode(images, count=100, interval=10) {
    
    let explodeX = helpers.Randomizer(200, innerWidth - 200);
    let explodeY = helpers.Randomizer(200, innerHeight - 200);

    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteExplode(images[imagenum], explodeX, explodeY);
          }, j * interval);
    }
}

function createEmoteExplode(image, explodeX, explodeY) {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    gsap.set(Div, { className: 'explosion-element', x: explodeX, y: explodeY, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    explosion_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
      }, 15000);
}

// Explosion Animation
function explosion_animation(element) {
    //Fire off in a random direction
    var angle = Math.random()*Math.PI*2;
    let animatex = Math.cos(angle)*innerWidth*1.5;
    let animatey = Math.sin(angle)*innerHeight*1.5;

    gsap.to(element, helpers.Randomizer(5, 10), { x: animatex, y: animatey, ease: Sine.easeOut });
}
    
