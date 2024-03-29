import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


//globalConst.warp
//globalVarsdivnumber





export function emoteCube (images, count=1, interval=50) {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the different emote images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteCube(images[imagenum]);
        }, j * interval);
    }
}

function createEmoteCube(image) {
    var Div = document.createElement('div');
    Div.id = divnumber;
    divnumber++;

    //create at random X/Y within screen bounds
    gsap.set(Div, { className: 'cube-element', x: Randomizer(0, innerWidth), y: Randomizer(0, innerHeight), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    warp.appendChild(Div);

    // Run animation
    cube_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

function cube_animation(element) {


}