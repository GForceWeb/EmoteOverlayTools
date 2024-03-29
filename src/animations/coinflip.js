import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';


//globalConst.warp
//globalVarsdivnumber

export function createCoins(count, side) {

    //var template = $(".template").remove();
    let template = document.querySelector(".template");
    let coinTl = new TimelineMax();
    let jumpTime = (Math.random() * .75) + .8;
    let coins = [];
    
    for (var i = 0; i < count; i++) {
        // Copy the template
        let clone = template.cloneNode(true);
        globalConst.warp.append(clone);
        clone.id = globalVars.divnumber;
        globalVars.divnumber++;


        setTimeout(() => {
            helpers.removeelement(clone.id);
        }, 60000);
        
        // Finds the images inside the clone
        let img = document.querySelector(".template").querySelectorAll('img');
        
        let coin = {
            index : i,
            box   : clone,
            heads : img[0],
            edge  : img[1],
            line  : img[2],
            tails : img[3],
            flip  : function() {
            //if(side == "heads") { var result = headFlip(this);}
            //if(side == "tails") { var result = tailFlip(this);}
            //return getFlippage(this.box, result);
            }
        };

        coins.push(coin);

        gsap.set(clone, { x: innerWidth / 2 - 100, y: innerHeight / 2 + 100, autoAlpha: 1, opacity: 0 });
        gsap.to(clone, { opacity: 1, duration: 1 });

        setTimeout(() => {
            flippage(coin, side);
        }, 4000);
    } 
    

    // setTimeout(function() {
    //     flippage(coin, side);
    // }, 4000);
    
    //return coins;  
}

function flippage(coin, side) {
    
    if(side != "Heads" && side != "Tails") {
        return
    }

    let flipTime = 1 / 3;

    let tl1 = gsap.timeline({ repeat: 0, defaults: { duration: 3, ease: "none" } })
    // tl1.addLabel("headEnd2", 0);
    // tl1.addLabel("tailStart2", ">");
    tl1.to(coin.box, {y: "-=200", rotation: 10, duration: 3, ease: Power1.easeOut});
    tl1.to(coin.box, {y: "+=200", rotation: -10, duration: 3, ease: Bounce.easeOut});
    tl1.to(coin.box, {rotation: 0, duration: 0.1  });

    if(side == "Heads"){
    //heads
    let tl2 = gsap.timeline({ repeat: 3, defaults: { duration: flipTime, ease: "none" } })
    tl2.fromTo(coin.heads, {scaleY: 1, y: 0}, {scaleY: 0, y: 0}, "headEnd");
    tl2.fromTo(coin.heads, {scaleY: 1, y: 0}, {scaleY: 0, y: 8}, "headEnd");
    tl2.fromTo(coin.line, {height: 0, y: 0}, {height: 8, y: 0}, "headEnd");
    tl2.to(coin.heads, {y: 0, duration: 0}, "tailStart");
    tl2.fromTo(coin.tails, {opacity: 1, scaleY: 0, y: 8}, {opacity: 1, scaleY: 1, y: 0}, "tailStart");
    tl2.to(coin.edge, {scaleY: 1, y: 0}, "tailStart");
    tl2.to(coin.line, {height: 0, y: 0}, "tailStart");
    tl2.to(coin.tails, {scaleY: 0 }, "tailEnd");
    tl2.fromTo(coin.edge, {scaleY: 1, y: 0}, {scaleY: 0, y: 8}, "tailEnd");
    tl2.to(coin.line, {height: 8, y: 0}, "tailEnd");
    tl2.fromTo(coin.heads, {scaleY: 0, y: 8}, {scaleY: 1, y: 0}, "headStart");
    tl2.fromTo(coin.edge, {scaleY: 0, y: 0}, {scaleY: 1, y: 0}, "headStart");
    tl2.to(coin.line, {height: 0, y: 0 }, "headStart");
    }

    if(side == "Tails"){
        
    //tails
    let tl2 = gsap.timeline({ repeat: 5, defaults: { duration: flipTime, ease: "none" } })
    tl2.fromTo(coin.heads, {scaleY: 1, y: 0}, {scaleY: 0, y: 0}, "headEnd2");
    tl2.fromTo(coin.edge, {scaleY: 1, y: 0}, {scaleY: 0, y: 8}, "headEnd2");
    tl2.fromTo(coin.line, {height: 0, y: 0}, {height: 8, y: 0}, "headEnd2");
    tl2.to(coin.edge, {y: 0, duration: 0}, "tailStart2");
    tl2.fromTo(coin.tails, {opacity: 1, scaleY: 0, y: 8}, {opacity: 1, scaleY: 1, y: 0}, "tailStart2");
    tl2.to(coin.edge, {scaleY: 1, y: 0}, "tailStart2");
    tl2.to(coin.line, {height: 0, y: 0}, "tailStart2");
    }

    

}

function getFlippage(coin, whatSide) {

    //define jumping
    jumpTime = (Math.random() * 1.75) + .8;
    var jumpTl = new TimelineMax();
    var jumpUp = new TweenMax(coin, jumpTime / 2, {
    y: -100,
    rotation: 10,
    ease: Power1.easeOut
    });
    var jumpDown = new TweenMax(coin, jumpTime / 2, {
    y: 100,
    rotation: -10,
    ease: Bounce.easeOut
    });

    jumpTl
    .add(jumpUp.play())
    .add(jumpDown.play())
    .to(coin, .1, {
    rotation: 0
    }, "-=.2");

    // timeline for each
    var coinFlipTl = new TimelineMax();
    coinFlipTl
    .add(whatSide, 0) //picks whether to land on heads or tails
    .add(jumpTl, 0);
    return coinFlipTl;
}

//makes a new animation for a coin that's tails
// function tailFlip(coin) {

//   var flipTime = 1 / 3;  
//   var tailsTl = new TimelineMax({ repeat: 1 });
    
//   tailsTl
//     .fromTo(coin.heads, flipTime, {
//     scaleY: 1,
//     y: 0
//   }, {
//     scaleY: 0,
//     y: 0
//   }, "headEnd2")
//     .fromTo(coin.edge, flipTime, {
//     scaleY: 1,
//     y: 0
//   }, {
//     scaleY: 0,
//     y: 8
//   }, "headEnd2")
//     .fromTo(coin.line, flipTime, {
//     height: 0,
//     y: 0
//   }, {
//     height: 8,
//     y: 0
//   }, "headEnd2")

//     .to(coin.edge, 0, {
//     y: 0
//   }, "tailStart2")
//     .fromTo(coin.tails, flipTime, {
//     opacity: 1,
//     scaleY: 0,
//     y: 8
//   }, {
//     opacity: 1,
//     scaleY: 1,
//     y: 0
//   }, "tailStart2")
//     .to(coin.edge, flipTime, {
//     scaleY: 1,
//     y: 0
//   }, "tailStart2")
//     .to(coin.line, flipTime, {
//     height: 0,
//     y: 0
//   }, "tailStart2");

//   return tailsTl;
// };

// function headFlip(coin) {
    
//   var flipTime = 1 / 4;
//   var headsTl = new TimelineMax({ repeat: 1 });
    
//   headsTl
//     .fromTo(coin.heads, flipTime, {
//     scaleY: 1,
//     y: 0
//   }, {
//     scaleY: 0,
//     y: 0
//   }, "headEnd")
//     .fromTo(coin.heads, flipTime, {
//     scaleY: 1,
//     y: 0
//   }, {
//     scaleY: 0,
//     y: 8
//   }, "headEnd")
//     .fromTo(coin.line, flipTime, {
//     height: 0,
//     y: 0
//   }, {
//     height: 8,
//     y: 0
//   }, "headEnd")

//     .to(coin.heads, 0, {
//     y: 0
//   }, "tailStart")
//     .fromTo(coin.tails, flipTime, {
//     opacity: 1,
//     scaleY: 0,
//     y: 8
//   }, {
//     opacity: 1,
//     scaleY: 1,
//     y: 0
//   }, "tailStart")
//     .to(coin.edge, flipTime, {
//     scaleY: 1,
//     y: 0
//   }, "tailStart")
//     .to(coin.line, flipTime, {
//     height: 0,
//     y: 0
//   }, "tailStart")

//     .to(coin.tails, flipTime, {
//     scaleY: 0
//   }, "tailEnd")
//     .fromTo(coin.edge, flipTime, {
//     scaleY: 1,
//     y: 0
//   }, {
//     scaleY: 0,
//     y: 8
//   }, "tailEnd")
//     .to(coin.line, flipTime, {
//     height: 8,
//     y: 0
//   }, "tailEnd")
//     .fromTo(coin.heads, flipTime, {
//     scaleY: 0,
//     y: 8
//   }, {
//     scaleY: 1,
//     y: 0
//   }, "headStart")
//     .fromTo(coin.edge, flipTime, {
//     scaleY: 0,
//     y: 0
//   }, {
//     scaleY: 1,
//     y: 0
//   }, "headStart")
//     .to(coin.line, flipTime, {
//     height: 0,
//     y: 0
//   }, "headStart");
    
//   return headsTl;
// };

// function buildTimeline(coins, coinTl) {

//   // forEach is an array method
//   coins.forEach(function(coin) {    
//     coinTl.add(coin.flip(), 0);
//   });
// };
