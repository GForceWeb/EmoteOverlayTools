import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


//globalConst.warp
//
//globalVars.divnumber

//setTimeout(() => {
//     createEmoteRain(images[imagenum]);
// }, j * interval);

export function VisualLurk(image, iterations=3, interval=5000) {
    for (let j = 0; j < iterations; j++) {
        let delay = j * interval; // Delay between each iteration in ms

        setTimeout(() => {
            createVisualLurk(image);
        }, delay);
    }
}


function lurking_animation_left(element) {
    TweenMax.to(element, 1, { rotationZ:'+=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { x:'+=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { rotationZ:'-=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    TweenMax.to(element, 1, { x:'-=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function lurking_animation_right(element) {
    TweenMax.to(element, 1, { rotationZ:'-=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { x:'-=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { rotationZ:'+=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    TweenMax.to(element, 1, { x:'+=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function lurking_animation_top(element) {
    TweenMax.to(element, 1, { y:'+=250', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { y:'-=250' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function lurking_animation_bottom(element) {
    TweenMax.to(element, 1, { y:'-=250', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { y:'+=250' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function createVisualLurk(image) {
    
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;
    Div.style.background = 'url(' + image + ')';
    Div.style.backgroundSize = '100% 100%';

    console.log("Creating a Lurk Element");

    //randomise side to peep from
    var random = Math.floor(Math.random() * 4) + 1;
                        
    switch (random) {
    case 1:
        // left - TweenLite.set(Div, { className: 'lurking-element', x: -600, y: helpers.Randomizer(0, innerHeight-600 ), z:0 });
        TweenLite.set(Div, { className: 'lurking-element', x: -400, y: helpers.Randomizer(0, innerHeight-400 ), z:0 });
        lurking_animation_left(Div);                        
        break;
    case 2:
        // right
        TweenLite.set(Div, { className: 'lurking-element', x: innerWidth, y: helpers.Randomizer(0, innerHeight-400 ), z:0  });
        lurking_animation_right(Div); 
    
        break;
    case 3:
        // top
        TweenLite.set(Div, { className: 'lurking-element', x: helpers.Randomizer(0, innerWidth-400), y: -400, z: 0,rotationX:180 });
        lurking_animation_top(Div); 
        break;
    default:
        // bottom
        TweenLite.set(Div, { className: 'lurking-element', x: helpers.Randomizer(0, innerWidth-400), y:innerHeight, z:0 });
        lurking_animation_bottom(Div); 
    }
    globalConst.warp.appendChild(Div);

    // Run animation
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}