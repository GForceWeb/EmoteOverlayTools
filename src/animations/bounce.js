import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


export function emoteBounce(images, count=100, interval=20) {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the different emote images
        let imagenum = j % imgcount;        
        setTimeout(() => {
            createEmoteBounce(images[imagenum]);
        }, j * interval);
    }
}

function createEmoteBounce(image){
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    //create at random Y height at left edge of screen
    gsap.set(Div, { className: 'bounce-element', x: helpers.Randomizer(0, innerWidth), y: helpers.Randomizer(0, 200), z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    bounce_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

function bounce_animation(element) {

    gsap.to(element, {
    x: function() {
        return helpers.Randomizer(0, 250) + gsap.getProperty(element, "x");
    },
    y: innerHeight-75,
    duration: 3,
    ease: "bounce.out",
    });
    //Move right as we bounce
    gsap.to(element, {
    x: "+=200",
    duration: 3,
    // ease: "sine.inOut",
    delay: 0,
    });
    //Do a flip
    gsap.to(element, {
    rotationZ: 360,
    duration: 2,
    delay: 1
    });
    gsap.to(element, {opacity: 0, duration: 1, ease: "sine.inOut", delay: 3});
}