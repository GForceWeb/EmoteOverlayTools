import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


//globalConst.warp
//globalVarsdivnumber

export function createAvatarChoon(image) {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;
    Div.style.background = 'url(' + image + ')';
    Div.style.backgroundSize = '100% 100%';


    //randomise side to peep from
    var random = Math.floor(Math.random() * 2) + 1;
    random = 1;

    //var Note = createNote("img/music1.png");

    switch (random) {
    case 1:
        // left - TweenLite.set(Div, { className: 'lurking-element', x: -600, y: helpers.Randomizer(0, innerHeight-600 ), z:0 });
        let height = helpers.Randomizer(0, innerHeight-400 );
        TweenLite.set(Div, { className: 'choon-element', x: -400, y: height, z:100 });

        let times = 5;
        let Notes = [];
        for(var i = 0; i < times; i++){
        Notes[i] = createNote("img/music1.png");
        TweenLite.set(Notes[i], { className: 'note-element', x: helpers.Randomizer(0, 250), y: height+400, z:10, opacity: 0 });
        note_animation(Notes[i]);
        console.log(Notes[i]);
        let delayms = Math.round(helpers.Randomizer(0,3000));
        //delay(delayms).then(() => note_animation(Notes[i]));
        }

        choon_animation_left(Div);

        break;
    case 2:
        // right
        TweenLite.set(Div, { className: 'choon-element', x: innerWidth, y: height, z:0  });
        choon_animation_right(Div); 
    
        break;
    }
    globalConst.warp.appendChild(Div);

    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
    
    

}

function createNote(image) {
    var MNoteDiv = document.createElement('div');
    MNoteDiv.id = globalVars.divnumber;
    globalVars.divnumber++;
    MNoteDiv.style.background = 'url(' + 'img/music1.png' + ')';
    MNoteDiv.style.backgroundSize = '100% 100%';
    //MNoteDiv.classList.add('note_element');

    globalConst.warp.appendChild(MNoteDiv);
    setTimeout(() => {
        helpers.removeelement(MNoteDiv.id);
    }, 15000);

    return MNoteDiv
}

function note_animation(element){

    gsap.to(element, {duration: 2, opacity: 1, yoyo: false, repeat: 0, delay: 3, })
    gsap.to(element, {duration: 1, rotationZ:'-=40', yoyo: false, repeat: 0, delay: 5})

    let verticalTravel = innerHeight / 2;

    //Fade In
    gsap.to(element, { opacity: 1, ease: Linear.easeNone, repeat: 0, delay: -1, duration: 3 });
    //Vertical Movement
    gsap.to(element, { y: `-=${verticalTravel}`, x: function() {
        return helpers.Randomizer(-250, 250) + gsap.getProperty(element, "x");
    }, ease: Linear.easeNone, repeat: 0, delay: -1, duration: helpers.Randomizer(10, 20) });
    //Fade Out
    gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: helpers.Randomizer(9, 11) , duration: 4});

}

function choon_animation_left(element) {
    
    gsap.to(element, {duration: 6, x: '+=450'})
    gsap.to(element, {duration: 1, y: '-=50', yoyo: true, ease: Sine.easeInOut, repeat: 6})
    gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: helpers.Randomizer(8, 10) , duration: 4});
    //gsap.to(element, {duration: 0.2, rotationZ:'-=20', yoyo: true, repeat: 23, repeatDelay: 0, delay: 0.2})
    //gsap.to(element, {duration: 0.2, rotationZ: 0, yoyo: false, repeat: 0, delay: 4.8})

    
    // TweenMax.to(element, 1, { rotationZ:'+=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    // TweenMax.to(element, 1, { x:'+=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    // TweenMax.to(element, 1, { rotationZ:'-=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    // TweenMax.to(element, 1, { x:'-=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function choon_animation_right(element){

}