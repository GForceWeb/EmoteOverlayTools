import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


export function emoteComets(images, count=170, interval=50) {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the different emote images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteComets(images[imagenum]);
        }, j * interval);
    }
}

function createEmoteComets(image) {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    //create at random Y height at left edge of screen
    gsap.set(Div, { className: 'comet-element', x: helpers.Randomizer(-500, innerWidth + 500), y: helpers.Randomizer(-200, -75), z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    comet_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);

}

function comet_animation(element) {
    var cometDuration =  helpers.Randomizer(4,8);
    var cometSize = helpers.Randomizer(25,100);
    var cometX = gsap.getProperty(element, "x");
    //console.log(cometX);
    if(cometX > 920){
    cometX = cometX - helpers.Randomizer(1150,1500);
    }
    else if(cometX < 920){
    cometX = cometX + helpers.Randomizer(1150,1500);
    }
    //console.log(cometX);
    gsap.to(element, {duration: cometDuration, x: cometX, ease: "sine.out" });
    gsap.to(element, {duration: cometDuration, y: helpers.Randomizer(800, 1080), ease: "power3.in" });
    gsap.to(element, {duration: cometDuration, width: cometSize, height: cometSize, ease: "sine.out" });
    gsap.to(element, {duration: 1, opacity: 0, ease: "sine.inOut", delay: cometDuration });
    gsap.to(element, {duration: 1, height: 0, ease: "power3.out", delay: cometDuration});
}