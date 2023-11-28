import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


//globalConst.warp
//globalVarsdivnumber






export function emoteSpiral(images, count=100, interval=75) {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the different emote images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createSpiral(images[imagenum]);
        }, j * interval);
    }
}

function createSpiral(image){
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    //create at random Y height at left edge of screen
    gsap.set(Div, { className: 'spiral-element', x: innerWidth/2, y: innerHeight/2, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    spiral_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

function spiral_animation(element) {
    //Travel left to right

    let spiralstartx = innerWidth/2;
    let spiralstarty = innerHeight/2;
    let spiralPath = "c -47 0 -85.1 -36.09 -85.1 -80.69 c 0 -52.43 44.84 -94.94 100.15 -94.94 c 65.08 0 117.84 50.01 117.84 111.69 c 0 72.58 -62.07 131.41 -138.63 131.41 c -90.09 0 -163.09 -69.21 -163.09 -154.59 c 0 -100.45 85.87 -181.88 191.87 -181.88 c 124.67 0 225.74 95.83 225.74 214 c 0 139 -118.9 251.73 -265.6 251.73 c -172.56 0 -312.44 -132.59 -312.44 -296.15 c 0 -192.42 164.57 -348.42 367.57 -348.42 c 238.83 0 432.44 183.52 432.44 409.9 c 0 266.34 -227.75 482.24 -508.75 482.24 c -330.53 0 -598.5 -254 -598.5 -567.3 c 0 -368.67 315.26 -667.5 704.15 -667.5 c 457.52 0 828.42 351.57 828.42 785.25";
    
    let finalPath = "M " + spiralstartx + " " + spiralstarty + " " + spiralPath;
    //finalPath = "M1533.07,785.75C1533.07,352.07,1162.17.5,704.65.5,315.76.5.5,299.33.5,668,.5,981.3,268.47,1235.3,599,1235.3c281,0,508.75-215.9,508.75-482.24,0-226.38-193.61-409.9-432.44-409.9-203,0-367.57,156-367.57,348.42,0,163.56,139.88,296.15,312.44,296.15C766.88,987.73,885.78,875,885.78,736c0-118.17-101.07-214-225.74-214-106,0-191.87,81.43-191.87,181.88,0,85.38,73,154.59,163.09,154.59,76.56,0,138.63-58.83,138.63-131.41,0-61.68-52.76-111.69-117.84-111.69-55.31,0-100.15,42.51-100.15,94.94C551.9,754.91,590,791,637,791";
    //finalPath = "M637,791C590,791 551.9,754.91 551.9,710.3100000000002C551.9,657.8800000000001 596.74,615.3700000000001 652.05,615.3700000000001C717.13,615.3700000000001 769.89,665.3800000000001 769.89,727.0600000000001C769.89,799.64 707.8199999999999,858.47 631.26,858.47C541.17,858.47 468.16999999999996,789.26 468.16999999999996,703.88C468.16999999999996,603.4300000000001 554.04,522 660.04,522C784.71,522 885.78,617.83 885.78,736C885.78,875 766.88,987.73 620.18,987.7299999999999C447.61999999999995,987.7299999999999 307.73999999999995,855.1399999999999 307.73999999999995,691.5799999999999C307.73999999999995,499.15999999999997 472.30999999999995,343.15999999999997 675.31,343.15999999999997C914.14,343.15999999999997 1107.75,526.68 1107.75,753.06C1107.75,1019.4 880,1235.3 599,1235.3C268.47,1235.3 .5,981.3 .5,668C.5,299.33 315.76,.5 704.65,.5C1162.17,.5 1533.07,352.07 1533.07,785.75";
    //console.log(finalPath);

    gsap.to(element, { 
    duration: 13,
    // ease: "slow(0.7, 0.7, false)",
    ease: "power1.in",
    delay: 0,
    motionPath: {
        alignOrigin: [0.5, 0.5],
        path: finalPath,
        
    }
    });
    gsap.to(element, {opacity: 0, duration: 2, delay: 11.5, ease: Sine.easeOut});

}