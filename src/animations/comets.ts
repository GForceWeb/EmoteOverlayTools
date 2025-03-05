import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';

export function emoteComets(images: string[], count: number = 100, interval: number = 50): void {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteComets(images[imagenum]);
        }, j * interval);
    }
}

function createEmoteComets(image: string): void {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber.toString();
    globalVars.divnumber++;

    // @ts-ignore - GSAP is included via CDN
    gsap.set(Div, { className: 'comet-element', x: helpers.Randomizer(0, innerWidth), y: -300, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    comet_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
      }, 15000);
}

// Comets animation
function comet_animation(element: HTMLElement): void {
    // create random size of the travel
    let id = "left" + helpers.Randomizer(-250, 250) + "-" + "top" + helpers.Randomizer(450, 550);

    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { y: innerHeight + 400, duration: helpers.Randomizer(3, 6), ease: Linear.easeNone });

    // @ts-ignore - GSAP is included via CDN
    gsap.from(element, { opacity: 0, duration: 0.5 });
    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { opacity: 0, duration: 0.5, delay: helpers.Randomizer(2, 5.5) });

    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { rotation: helpers.Randomizer(180, 360) * helpers.randomSign(), duration: helpers.Randomizer(3, 6), ease: Linear.easeNone });
    
    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { scale: 0.5, duration: helpers.Randomizer(3, 6), ease: Linear.easeNone });
}