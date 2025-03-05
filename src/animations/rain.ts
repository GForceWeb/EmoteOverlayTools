import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';

export function emoteRain(images: string[], count: number = 100, interval: number = 50): void {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteRain(images[imagenum]);
        }, j * interval);
    }
}
    
function createEmoteRain(image: string): void {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber.toString();
    globalVars.divnumber++;

    // @ts-ignore - GSAP is included via CDN
    gsap.set(Div, { className: 'falling-element', x: helpers.Randomizer(0, innerWidth), y: helpers.Randomizer(-500, -450), z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    falling_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

// Falling animation
function falling_animation(element: HTMLElement): void {
    // @ts-ignore - TweenMax is included via GSAP CDN
    TweenMax.to(element, helpers.Randomizer(6, 16), { y: innerHeight + 1400, ease: Linear.easeNone, repeat: 0, delay: -1 });
    // @ts-ignore - TweenMax is included via GSAP CDN
    TweenMax.to(element, helpers.Randomizer(4, 8), { x: '+=100', rotationZ: helpers.Randomizer(0, 180), repeat: 4, yoyo: true, ease: Sine.easeInOut });
    // @ts-ignore - TweenMax is included via GSAP CDN
    TweenMax.to(element, helpers.Randomizer(2, 8), { rotationX: helpers.Randomizer(0, 360), rotationY: helpers.Randomizer(0, 360), repeat: 8, yoyo: true, ease: Sine.easeInOut, delay: -5 });
}