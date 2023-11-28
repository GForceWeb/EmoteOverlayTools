import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


export function createAvatarCheers(image) {
    
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber;
    globalVars.divnumber++;
    Div.style.background = 'url(' + image + ')';
    Div.style.backgroundSize = '100% 100%';

    var BeerDiv = document.createElement('div');
    BeerDiv.id = globalVars.divnumber;
    globalVars.divnumber++;
    BeerDiv.style.background = 'url(' + 'https://static-cdn.jtvnw.net/emoticons/v2/444572/default/dark/3.0' + ')';
    BeerDiv.style.backgroundSize = '100% 100%';

    console.log("Creating a Cheers Element");

    //randomise side to peep from
    var random = Math.floor(Math.random() * 2) + 1;
                        
    switch (random) {
    case 1:
        // left - TweenLite.set(Div, { className: 'lurking-element', x: -600, y: helpers.Randomizer(0, innerHeight-600 ), z:0 });
        var height = helpers.Randomizer(0, innerHeight-400 );
        TweenLite.set(Div, { className: 'cheers-element', x: -400, y: height, z:0 });
        TweenLite.set(BeerDiv, { className: 'beer-element', x: 100, y: height, z:0, opacity: 0 });
        cheers_animation_left(Div, BeerDiv);                        
        break;
    case 2:
        // right
        TweenLite.set(Div, { className: 'cheers-element', x: innerWidth, y: height, z:0  });
        cheers_animation_right(Div); 
    
        break;
    }
    globalConst.warp.appendChild(Div);
    globalConst.warp.appendChild(BeerDiv);

    // Run animation
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
    setTimeout(() => {
        helpers.removeelement(BeerDiv.id);
    }, 15000);

}

function cheers_animation_left(element, beerElement) {
    
    gsap.to(element, {duration: 5, x: '+=250'})
    gsap.to(element, {duration: 0.2, rotationZ:'+=10', yoyo: false, repeat: 0})
    gsap.to(element, {duration: 0.2, rotationZ:'-=20', yoyo: true, repeat: 23, repeatDelay: 0, delay: 0.2})
    gsap.to(element, {duration: 0.2, rotationZ: 0, yoyo: false, repeat: 0, delay: 4.8})

    
    gsap.to(beerElement, {duration: 2, opacity: 1, yoyo: false, repeat: 0, delay: 3, })
    gsap.to(beerElement, {duration: 1, rotationZ:'-=40', yoyo: false, repeat: 0, delay: 5})
    // TweenMax.to(element, 1, { rotationZ:'+=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    // TweenMax.to(element, 1, { x:'+=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    // TweenMax.to(element, 1, { rotationZ:'-=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    // TweenMax.to(element, 1, { x:'-=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function cheers_animation_right(element) {
    //TweenMax.to(e, helpers.Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
    //TweenMax.to(e, helpers.Randomizer(4, 8), {x:'+=100',rotationZ:helpers.Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
    //TweenMax.to(e,helpers.Randomizer(2, 8), {rotationX:helpers.Randomizer(0,360),rotationY:helpers.Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});

    TweenMax.to(element, 1, { rotationZ:'-=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { x:'-=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
    TweenMax.to(element, 1, { rotationZ:'+=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    TweenMax.to(element, 1, { x:'+=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });

}