import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


export function create(images, count=10, interval=150) {
    
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createDivs(images[imagenum]);
        }, j * interval);
    }
}


function createDivs(image) {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    gsap.set(Div, { className: 'fade-element', x: helpers.Randomizer(0, innerWidth), y: helpers.Randomizer(0, innerHeight), z: helpers.Randomizer(-200, 200), scale: 0.1 , opacity: 0, backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    animation(Div);
    //Destroy element after 8 seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}




// Rising animation
function animation(element) {
    //Fade In
    gsap.to(element, { opacity: 1, ease: Linear.easeNone, repeat: 0, delay: 1, duration: 3 });
    gsap.to(element, { scale: 2.5, ease: Linear.easeNone, repeat: 0, delay: 1, duration: 6 });
    gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: 4, duration: 4 });
    
}