import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';

export function emoteFirework(images, count=100, interval=1) {

    let imgcount = images.length;
    let chargeCount =  Math.ceil(count / imgcount);

    //separate firework for each image
    for (let i = 0; i < imgcount; i++) {
    
        let explodeX = helpers.Randomizer(200, innerWidth - 200);
        let explodeY = helpers.Randomizer(200, innerHeight - 200);
        let travelTime = helpers.Randomizer(2, 5);

        setTimeout(() => {
            createFireworkTravel(images[i], explodeX, explodeY, travelTime);
        }, i * 50);

        for (let j = 0; j < chargeCount; j++) {
            setTimeout(() => {
                createFireworkExplode(images[i], explodeX, explodeY, travelTime);
                }, (j * interval));
        }
    }
}

function createFireworkTravel(image, explodeX, explodeY, travelTime) {
    
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    gsap.set(Div, { className: 'firework-element', x: innerWidth/2, y: innerHeight, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    firework_travel_animation(Div, explodeX, explodeY, travelTime);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
      }, 5000);

}

function createFireworkExplode(image, explodeX, explodeY, travelTime) {
    
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    gsap.set(Div, { className: 'firework-element', x: explodeX, y: explodeY, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')', opacity: 0});

    globalConst.warp.appendChild(Div);

    // Run animation
    firework_explode_animation(Div, travelTime);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
      }, 15000);

}

// Explosion Animation
export function firework_travel_animation(element, targetX, targety, duration=5) {
    gsap.to(element, { x: targetX, y: targety, ease: Sine.easeOut, duration: duration });
}
    
// Explosion Animation
export function firework_explode_animation(element, delay=5) {
    //Fire off in a random direction
    var angle = Math.random()*Math.PI*2;
    let animatex = Math.cos(angle)*innerWidth*1.5;
    let animatey = Math.sin(angle)*innerHeight*1.5;

    gsap.set(element, { opacity: 1, delay: delay});
    gsap.to(element, helpers.Randomizer(5, 10), { x: animatex, y: animatey, ease: Sine.easeOut, delay: delay });
    gsap.to(element, helpers.Randomizer(5, 10), { opacity: 0, ease: Sine.easeIn, delay: delay });
}