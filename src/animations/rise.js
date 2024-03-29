import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


export function emoteRise(images, count=100, interval=20) {
    
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteRise(images[imagenum]);
        }, j * interval);
    }
}


function createEmoteRise(image) {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    gsap.set(Div, { className: 'rising-element', x: helpers.Randomizer(0, innerWidth), y: innerHeight - 75, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    rising_animation(Div);
    //Destroy element after 8 seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}




// Rising animation
function rising_animation(element) {
    //Fade In
    TweenMax.to(element, 3, { opacity: 1, width: "75px", height: "75px", ease: Linear.easeNone, repeat: 0, delay: -1 });
    //Vertical Movement
    TweenMax.to(element, helpers.Randomizer(10, 20), { y: -100, x: function() {
    return helpers.Randomizer(-250, 250) + gsap.getProperty(element, "x");
    }, ease: Linear.easeNone, repeat: 0, delay: -1 });
    //Fade Out
    TweenMax.to(element, 4, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: helpers.Randomizer(9, 11) });
}