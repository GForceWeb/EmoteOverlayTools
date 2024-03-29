import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';

export function emoteRain(images, count=100, interval=50) {
    
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        //var createcommand = 'createEmoteRain("' + images[imagenum] + '")';
        setTimeout(() => {
            createEmoteRain(images[imagenum]);
        }, j * interval);
    }
}
    
    
function createEmoteRain(image) {

    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

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
function falling_animation(element) {
    //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
    //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
    //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});

    TweenMax.to(element, helpers.Randomizer(6, 16), { y: innerHeight + 1400, ease: Linear.easeNone, repeat: 0, delay: -1 });
    TweenMax.to(element, helpers.Randomizer(4, 8), { x: '+=100', rotationZ: helpers.Randomizer(0, 180), repeat: 4, yoyo: true, ease: Sine.easeInOut });
    TweenMax.to(element, helpers.Randomizer(2, 8), { rotationX: helpers.Randomizer(0, 360), rotationY: helpers.Randomizer(0, 360), repeat: 8, yoyo: true, ease: Sine.easeInOut, delay: -5 });

}