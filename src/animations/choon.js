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
    var random = Math.floor(helpers.Randomizer(1,2.99));
    //random = 1;
    console.log(random);

    //var Note = createNote("../assets/img/music1.png");

    let height = helpers.Randomizer(0, innerHeight-400 );
    let times = 5;
    let Notes = [];

    switch (random) {
    case 1:
        // left        
        gsap.set(Div, { className: 'choon-element', x: -400, y: height, z:100 });

        
        for(var i = 0; i < times; i++){
            Notes[i] = createNote("../assets/img/music1.png");
            gsap.set(Notes[i], { className: 'note-element', x: helpers.Randomizer(0, 250), y: height+helpers.Randomizer(-200, 200), z:10, opacity: 0, scale: 0.01 });
            note_animation(Notes[i]);
            console.log(Notes[i]);
        }

        choon_animation_left(Div);

        break;
    case 2:
        // right
        gsap.set(Div, { className: 'choon-element', x: innerWidth+400, y: height, z:0  });

        for(var i = 0; i < times; i++){
            Notes[i] = createNote("../assets/img/music1.png");
            gsap.set(Notes[i], { className: 'note-element', x: helpers.Randomizer(innerWidth, innerWidth-350), y: height+helpers.Randomizer(-200, 200), z:10, opacity: 0, scale: 0.01 });
            note_animation(Notes[i]);
            console.log(Notes[i]);
        }

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

    //gsap.to(element, {duration: 2, opacity: 1, yoyo: false, repeat: 0, delay: 3, })
    //gsap.to(element, {duration: 1, rotationZ:'-=40', yoyo: false, repeat: 0, delay: 5})

    let verticalTravel = innerHeight / 2;
    let delay = helpers.Randomizer(3,6);
    //Fade In
    gsap.to(element, { opacity: 1, ease: Linear.easeNone, repeat: 0, delay: delay, duration: 4 });
    gsap.to(element, { scale: 1.25, ease: Linear.easeNone, repeat: 0, delay: delay, duration: 4 });
    //Vertical Movement
    // gsap.to(element, { y: `-=${verticalTravel}`, x: function() {
    //     return helpers.Randomizer(-250, 250) + gsap.getProperty(element, "x");
    // }, ease: Linear.easeNone, repeat: 0, delay: -1, duration: helpers.Randomizer(10, 20) });
    gsap.to(element, {
        duration: 5, // Duration of the animation in seconds
        delay: 3,
        ease: Linear.easeNone, // Easing function (you can choose a different one)
        "--hue-rotate": helpers.Randomizer(180,360), // Custom property to control hue rotation
        onUpdate: () => {
          // Update the filter property during the animation
          element.style.filter = `invert(44%) sepia(61%) saturate(1001%) brightness(99%) contrast(101%) hue-rotate(${gsap.getProperty(element, "--hue-rotate")}deg)`;
        }
      });

    //Fade Out
    gsap.to(element, {
        duration: 1, // Duration of the animation in seconds
        delay: delay + 4,
        ease: "power2.out", // Easing function (you can choose a different one)
        scale: 1.5, // Scale up the element
        opacity: 0, // Make the element disappear
        rotation: 360, // Rotate the element
        onComplete: () => {
          // Callback function when the animation is complete (optional)
          element.style.display = "none"; // Hide the element
        }
      });
    //gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: helpers.Randomizer(9, 11) , duration: 4});

}

function choon_animation_left(element) {
    
    gsap.to(element, {duration: 6, x: '+=450'})
    gsap.to(element, {duration: 1, y: '-=50', yoyo: true, ease: Sine.easeInOut, repeat: 8})
    gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: helpers.Randomizer(8, 10) , duration: 4});


    gsap.to(element, {
        duration: 1, // Duration of the animation in seconds
        delay: 10,
        ease: "power2.out", // Easing function (you can choose a different one)
        scale: 1.5, // Scale up the element
        opacity: 0, // Make the element disappear
        rotation: 360, // Rotate the element
        onComplete: () => {
          // Callback function when the animation is complete (optional)
          element.style.display = "none"; // Hide the element
        }
      });
    //gsap.to(element, {duration: 0.2, rotationZ:'-=20', yoyo: true, repeat: 23, repeatDelay: 0, delay: 0.2})
    //gsap.to(element, {duration: 0.2, rotationZ: 0, yoyo: false, repeat: 0, delay: 4.8})

}

function choon_animation_right(element){

    gsap.to(element, {duration: 6, x: '-=650'})
    gsap.to(element, {duration: 1, y: '-=50', yoyo: true, ease: Sine.easeInOut, repeat: 8})
    gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: helpers.Randomizer(8, 10) , duration: 4});


    gsap.to(element, {
        duration: 1, // Duration of the animation in seconds
        delay: 10,
        ease: "power2.out", // Easing function (you can choose a different one)
        scale: 1.5, // Scale up the element
        opacity: 0, // Make the element disappear
        rotation: 360, // Rotate the element
        onComplete: () => {
          // Callback function when the animation is complete (optional)
          element.style.display = "none"; // Hide the element
        }
      });
}