import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';

export function emoteCyclone(images, count=100, interval=30) {

    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteCyclone(images[imagenum]);
        }, j * interval);
    }
}

function createEmoteCyclone(image) {

    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    gsap.set(Div, { className: 'cyclone-element', x: innerWidth/2, y: innerHeight, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    cyclone_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);

}

// Explosion Animation
function cyclone_animation(element) {

    //Set a base intensity value, then use that to derive the motion path
    let intensity = helpers.Randomizer(5, 100);

    let verticalStrengthx = 0;
    let verticalStrengthy = -200 * Math.ceil(intensity/20);
    let horizontalStrengthx = 20 * Math.ceil(intensity/5) 
    let horizontalStrengthy = -400 * Math.ceil(intensity/30);
    let finalLocationx = helpers.Randomizer(300, innerWidth/2);
    let finalLocationy = helpers.Randomizer(-50, -350);
    
    //Flip half to the other side
    let direction = helpers.Randomizer(0, 1);
    if(Math.round(direction) == 1) {
        verticalStrengthx = -(verticalStrengthx);
        horizontalStrengthx = -(horizontalStrengthx);
        finalLocationx = -(finalLocationx);
    }

    //Construct the Motion Path. Reference tool for paths: https://yqnn.github.io/svg-path-editor/
    //let motionPath = "M"+ " " + innerWidth/2 + " " + innerHeight + " " + "c " + verticalStrengthx + " " + verticalStrengthy + " " + horizontalStrengthx + " " +  horizontalStrengthy + " " + finalLocationx + " " + finalLocationy;
    // let motionPath = "M 250 400 Q 260 380, 270 360 T 290 320 Q 310 280, 330 240 T 370 160 Q 410 80, 450 40";
    // console.log(motionPath);

    // gsap.to(element, { 
    //     duration: helpers.Randomizer(4, 8),
    //     ease: "power1.inOut",
    //     repeat: -1,
    //     motionPath: {
    //         path: "#cyclonePath",
    //         align: "#cyclonePath",
    //         autoRotate: true        
    //     }
    // });

      //Construct the Motion Path. Reference tool for paths: https://yqnn.github.io/svg-path-editor/
      //let motionPath = "M"+ " " + innerWidth/2 + " " + innerHeight + " " + "c " + verticalStrengthx + " " + verticalStrengthy + " " + horizontalStrengthx + " " +  horizontalStrengthy + " " + finalLocationx + " " + finalLocationy;
      //let motionPath = "m"+ " " + innerWidth/2 + " " + innerHeight + " " + "c 119 -29 67 -51 -42 -53 s 76 66 137 -7 s -54 -108 -222 -60 s 256 89 302 -47 s -205 -179 -378 -43 s 439 127 498 -74 s -503 -252 -618 -76 s 658 194 721 -112 s -655 -91.6667 -1168 -241";
      let motionPath = "m"+ " " + innerWidth/2 + " " + innerHeight + " " + "c 154 -23 165 -73 -5 -71 s -211 72 5 69 c 323 -53 198 -146 -3 -141 s -333 110 2 107 c 428 -19 532 -195 -17 -218 s -376 121 17 108 c 702 16 1110 -259 -14 -249 s -204 171 1 142 c 1293 21 2175 -379 -15 -459 s -627 420 18 318 c 3017 -113 2968 -790 -22 -855 c -2857 -605 -2755 138 -5044 -970";

      console.log(motionPath);
  
      gsap.to(element, { 
      //duration: helpers.Randomizer(4, 8),
      duration: 7,
      ease: "power1.in",
      delay: 0.5,
      motionPath: {
        path: motionPath,
        autoRotate: true
          
      }
      });

    gsap.to(element, helpers.Randomizer(3, 5), { opacity: 0, ease: Sine.easeIn, delay: 4 });
}
