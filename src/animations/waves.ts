import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';

export function emoteRightWave(images: string[], count: number = 100, interval: number = 20): void {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the different emote images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createRightWave(images[imagenum]);
        }, j * interval);
    }
}

export function emoteLeftWave(images: string[], count: number = 100, interval: number = 20): void {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the different emote images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createLeftWave(images[imagenum]);
        }, j * interval);
    }
}

function createRightWave(image: string): void {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber.toString();
    globalVars.divnumber++;

    //create at random Y height at left edge of screen
    // @ts-ignore - GSAP is included via CDN
    gsap.set(Div, { className: 'rightwave-element', x: -100, y: helpers.Randomizer(100, innerHeight - 100), z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    rightwave_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

function createLeftWave(image: string): void {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber.toString();
    globalVars.divnumber++;

    //create at random Y height at left edge of screen
    // @ts-ignore - GSAP is included via CDN
    gsap.set(Div, { className: 'rightwave-element', x: innerWidth + 100, y: helpers.Randomizer(100, innerHeight - 100), z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    leftwave_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

function rightwave_animation(element: HTMLElement): void {
    //Travel left to right
    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { x: innerWidth + 100, duration: helpers.Randomizer(6, 11), ease: Sine.easeInOut});
    //sway up and down a bit
    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { y: function() {
        return helpers.Randomizer(-350, 350) + gsap.getProperty(element, "y");
        }, duration: helpers.Randomizer(1, 2), ease: Sine.easeInOut, yoyo: true, repeat: -1});
}

function leftwave_animation(element: HTMLElement): void {
    //Travel right to left
    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { x: -100, duration: helpers.Randomizer(6, 11), ease: Sine.easeInOut});
    //sway up and down a bit
    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, { y: function() {
        return helpers.Randomizer(-350, 350) + gsap.getProperty(element, "y");
        }, duration: helpers.Randomizer(1, 2), ease: Sine.easeInOut, yoyo: true, repeat: -1});
}