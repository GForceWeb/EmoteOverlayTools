import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';
import { alnumDist } from '../lib/emotetext.js'


export function emoteText (images, text='hype', interval=25){
    let imgcount = images.length;
    let count = 0;
    let length = text.length
    let character = 0;
    let thischaracter = [];
    
    //Iterate each letter in textstring
    for (var i = 0; i < text.length; i++) {
        //alert(str.charAt(i));
        character++;
        let char = text.charAt(i)
        let pattern = alnumDist[char];
        
        //Iterate over each line of the letter
        for (let j = 0; j < pattern.length; j++) {   
            let line = j + 1;
            //console.log(pattern[k]);
            
            
            //Iterate each pixel of line
            for (let k = 0; k < pattern[j].length; k++) {

                let position = k + 1;
                let show;
                if (pattern[j][k] == 1) {
                    show = "true";
                }
                else {
                    show = "false";
                }

                if(pattern[j][k] == 1) {
                    count++;
                    let imagenum = i % imgcount;
                    (function (image, length, character, line, position) {
                        setTimeout(() => {
                            createEmoteText(image, length, character, line, position);
                        }, j * interval);
                      })(images[imagenum], length, character, line,  position);
                }
            }
        }
        console.log(pattern);
    }
}

function createEmoteText(image, length, character, x, y) {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;

    let charwidthstart;
    let pixelsize = 30;
    let letterpadding = 20
    let letterwidth = 5 * pixelsize + letterpadding;

    //Total Width = Length of Word x pixels per letter x size of pixel
    let totalwidth = length * letterwidth;
    //console.log("innerWidth: " + innerWidth);
    //console.log("TotalWidth: " + totalwidth);
    if(totalwidth < innerWidth){
        charwidthstart = (innerWidth - totalwidth) / 2;
        //console.log("Shorter than width");
    }
    else {
        charwidthstart = 0;
        pixelsize = 20;
        letterpadding = 3;
        letterwidth = 5 * pixelsize + letterpadding;
        totalwidth = length * letterwidth
        charwidthstart = (innerWidth - totalwidth) / 2;

        if(totalwidth > innerWidth){
            charwidthstart = 50;
            pixelsize = 15;
            letterpadding = 3;
            letterwidth = 5 * pixelsize + letterpadding;
            totalwidth = length * letterwidth
            charwidthstart = (innerWidth - totalwidth) / 2;
        }
    }

    //Work out locations
    
    console.log("Start: " + charwidthstart + ", LetterWidth: " + letterwidth + ", Char: " + character );
    //let charwidthstart = (innerWidth / 11) + (letterwidth * (character - 1));
    charwidthstart = charwidthstart + (letterwidth * (character - 1));
    console.log("finalwidthstart: " + charwidthstart);
    let charheightstart = innerHeight / 10 * 6;
    
    let spacingX = x * pixelsize;
    let spacingY = y * pixelsize;

    let pixelX = charwidthstart + spacingX;
    let pixelY = charheightstart - spacingY;

    let startX = pixelX;
    let startY = pixelY;

    //Randomize offscreen start point
    let random = Math.round(helpers.Randomizer(1,4));
    switch(random) {
    case 1:
        // Left Offscreen
        startX = -200;
        break;
    case 2:
        // Right Offscreen
        startX = innerWidth + 200;
        break;
    case 3:
        // Above Screen
        startY = -200;
        break;
    case 4:
        // Below Screen
        startY = innerHeight + 200;
        break;
    default:
    }


    //create at random X/Y within screen bounds
    gsap.set(Div, { className: 'text-element', x: startX, y: startY, z: helpers.Randomizer(-200, 200), opacity: 0, width: pixelsize, height: pixelsize, backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    text_animation(Div, pixelX, pixelY);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

function text_animation(element, pixelX, pixelY) {
    

    gsap.to(element, {duration: 2, opacity: 1, delay: 0});
    gsap.to(element, {duration: helpers.Randomizer(3, 5), x: pixelX, y: pixelY, delay: 0});
    gsap.to(element, {duration: 2, opacity: 0, delay: 13});

    gsap.to(element, {duration: 0.7, rotation: 30, repeat: -1, repeatDelay: 3});
    gsap.to(element, {duration: 2.3, rotation: 0, ease:Elastic.easeOut.config(0.9,0.1), delay: 0.7, repeat: -1, repeatDelay: 3});

    //gsap.to(element, {duration: 0.5, x: ""});

}