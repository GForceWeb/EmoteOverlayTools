/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./TestingSplits/animations.js
var animations_animations = {

    divnumber:0,
    emoteFirework:function(images, count=100, interval=1) {

        imgcount = images.length;
        chargeCount =  Math.ceil(count / imgcount);
    
        //separate firework for each image
        for (i = 0; i < imgcount; i++) {
        
        explodeX = Randomizer(200, innerWidth - 200);
        explodeY = Randomizer(200, innerHeight - 200);
        travelTime = Randomizer(2, 5);
    
        var createcommand = 'createFireworkTravel("' + images[i] + '","' + explodeX + '","' + explodeY + '","' + travelTime + '")';
        setTimeout(createcommand, (i * 50));
        console.log(createcommand);
    
        for (j = 0; j < chargeCount; j++) {
            var createcommand = 'createFireworkExplode("' + images[i] + '","' + explodeX + '","' + explodeY + '","' + travelTime + '")';
            setTimeout(createcommand, (j * interval));
        }
        }
    },
    
    createFireworkTravel:function(image, explodeX, explodeY, travelTime) {
    
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        gsap.set(Div, { className: 'firework-element', x: innerWidth/2, y: innerHeight, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        firework_travel_animation(Div, explodeX, explodeY, travelTime);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 5000);
    
    },
    
    createFireworkExplode:function(image, explodeX, explodeY, travelTime) {
    
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        gsap.set(Div, { className: 'firework-element', x: explodeX, y: explodeY, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')', opacity: 0});
    
        warp.appendChild(Div);
    
        // Run animation
        firework_explode_animation(Div, travelTime);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    
    },
    
    // Explosion Animation
    firework_travel_animation:function(element, targetX, targety, duration=5) {
        gsap.to(element, { x: targetX, y: targety, ease: Sine.easeOut, duration: duration });
    },
    
    // Explosion Animation
    firework_explode_animation:function(element, delay=5) {
        //Fire off in a random direction
        var angle = Math.random()*Math.PI*2;
        animatex = Math.cos(angle)*innerWidth*1.5;
        animatey = Math.sin(angle)*innerHeight*1.5;
    
        gsap.set(element, { opacity: 1, delay: delay});
        gsap.to(element, Randomizer(5, 10), { x: animatex, y: animatey, ease: Sine.easeOut, delay: delay });
        gsap.to(element, Randomizer(5, 10), { opacity: 0, ease: Sine.easeIn, delay: delay });
    },    
    
    createEmoteExplode:function(image) {
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        gsap.set(Div, { className: 'explosion-element', x: explodeX, y: explodeY, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        explosion_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    
    emoteExplode:function(images, count=100, interval=10) {
    
        explodeX = Randomizer(200, innerWidth - 200);
        explodeY = Randomizer(200, innerHeight - 200);
    
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteExplode("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    emoteRise:function(images, count=100, interval=20) {
    
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteRise("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    
    createEmoteRise:function(image) {
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        gsap.set(Div, { className: 'rising-element', x: Randomizer(0, innerWidth), y: innerHeight - 75, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        rising_animation(Div);
        //Destroy element after 8 seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    
    emoteRain:function(images, count=100, interval=50) {
    
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteRain("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    
    createEmoteRain:function(image) {
    
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        gsap.set(Div, { className: 'falling-element', x: Randomizer(0, innerWidth), y: Randomizer(-500, -450), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        falling_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },

    

    // Firework Animation
    firework_animation:function(element) {
        // Travel to explosion point
        gsap.to(element, 3, { x: Randomizer(200, innerWidth-200), y: Randomizer(200, innerHeight-200), ease: Sine.easeOut });
        // Explode in random direction
        gsap.to(element, 1, { x: Randomizer(), ease: Sine.easeOut });
    
    
    },
    
    // Explosion Animation
    explosion_animation:function(element) {
        //Fire off in a random direction
        var angle = Math.random()*Math.PI*2;
        animatex = Math.cos(angle)*innerWidth*1.5;
        animatey = Math.sin(angle)*innerHeight*1.5;
    
        gsap.to(element, Randomizer(5, 10), { x: animatex, y: animatey, ease: Sine.easeOut });
    },
    
    // Rising animation
    rising_animation:function(element) {
        //Fade In
        TweenMax.to(element, 3, { opacity: 1, width: "75px", height: "75px", ease: Linear.easeNone, repeat: 0, delay: -1 });
        //Vertical Movement
        TweenMax.to(element, Randomizer(10, 20), { y: -100, x: function() {
        return Randomizer(-250, 250) + gsap.getProperty(element, "x");
        }, ease: Linear.easeNone, repeat: 0, delay: -1 });
        //Fade Out
        TweenMax.to(element, 4, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: Randomizer(9, 11) });
    },
    
    // Falling animation
    falling_animation:function(element) {
        //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
        //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
        //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});
    
        TweenMax.to(element, Randomizer(6, 16), { y: innerHeight + 1400, ease: Linear.easeNone, repeat: 0, delay: -1 });
        TweenMax.to(element, Randomizer(4, 8), { x: '+=100', rotationZ: Randomizer(0, 180), repeat: 4, yoyo: true, ease: Sine.easeInOut });
        TweenMax.to(element, Randomizer(2, 8), { rotationX: Randomizer(0, 360), rotationY: Randomizer(0, 360), repeat: 8, yoyo: true, ease: Sine.easeInOut, delay: -5 });
    
    },
    
    lurking_animation_left:function(element) {
        //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
        //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
        //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});
    
        TweenMax.to(element, 1, { rotationZ:'+=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { x:'+=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { rotationZ:'-=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
        TweenMax.to(element, 1, { x:'-=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    },
    
    lurking_animation_right:function(element) {
        //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
        //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
        //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});
    
        TweenMax.to(element, 1, { rotationZ:'-=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { x:'-=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { rotationZ:'+=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
        TweenMax.to(element, 1, { x:'+=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    },
    
    lurking_animation_top:function(element) {
        //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
        //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
        //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});
    
        TweenMax.to(element, 1, { y:'+=250', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { y:'-=250' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    },
    
    lurking_animation_bottom:function(element) {
        //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
        //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
        //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});
    
        TweenMax.to(element, 1, { y:'-=250', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { y:'+=250' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    
    
    },

    
    VisualLurk:function(image, iterations=3, interval=5000) {
        for (j = 0; j < iterations; j++) {
        delay = j * interval; // Delay between each iteration in ms
    
        var createcommand = 'createVisualLurk("' + image + '")';
        setTimeout(createcommand, (delay));
    
        }
    },
    
    
    createVisualLurk:function(image) {
        
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
        Div.style.background = 'url(' + image + ')';
        Div.style.backgroundSize = '100% 100%';
    
        console.log("Creating a Lurk Element");
    
        //randomise side to peep from
        var random = Math.floor(Math.random() * 4) + 1;
                            
        switch (random) {
        case 1:
            // left - TweenLite.set(Div, { className: 'lurking-element', x: -600, y: Randomizer(0, innerHeight-600 ), z:0 });
            TweenLite.set(Div, { className: 'lurking-element', x: -400, y: Randomizer(0, innerHeight-400 ), z:0 });
            lurking_animation_left(Div);                        
            break;
        case 2:
            // right
            TweenLite.set(Div, { className: 'lurking-element', x: innerWidth, y: Randomizer(0, innerHeight-400 ), z:0  });
            lurking_animation_right(Div); 
        
            break;
        case 3:
            // top
            TweenLite.set(Div, { className: 'lurking-element', x: Randomizer(0, innerWidth-400), y: -400, z: 0,rotationX:180 });
            lurking_animation_top(Div); 
            break;
        default:
            // bottom
            TweenLite.set(Div, { className: 'lurking-element', x: Randomizer(0, innerWidth-400), y:innerHeight, z:0 });
            lurking_animation_bottom(Div); 
        }
        warp.appendChild(Div);
    
        // Run animation
        
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },

    

    emoteComets:function(images, count=170, interval=50) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteComets("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createEmoteComets:function(image) {
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random Y height at left edge of screen
        gsap.set(Div, { className: 'comet-element', x: Randomizer(-500, innerWidth + 500), y: Randomizer(-200, -75), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        comet_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    comet_animation:function(element) {
        var cometDuration =  Randomizer(4,8);
        var cometSize = Randomizer(25,100);
        var cometX = gsap.getProperty(element, "x");
        console.log(cometX);
        if(cometX > 920){
        cometX = cometX - Randomizer(1150,1500);
        }
        else if(cometX < 920){
        cometX = cometX + Randomizer(1150,1500);
        }
        console.log(cometX);
        gsap.to(element, {duration: cometDuration, x: cometX, ease: "sine.out" });
        gsap.to(element, {duration: cometDuration, y: Randomizer(800, 1080), ease: "power3.in" });
        gsap.to(element, {duration: cometDuration, width: cometSize, height: cometSize, ease: "sine.out" });
        gsap.to(element, {duration: 1, opacity: 0, ease: "sine.inOut", delay: cometDuration });
        gsap.to(element, {duration: 1, height: 0, ease: "power3.out", delay: cometDuration});
    },
    
    
    
    
    emoteBounce:function(images, count=100, interval=20) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteBounce("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createEmoteBounce:function(image){
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random Y height at left edge of screen
        gsap.set(Div, { className: 'bounce-element', x: Randomizer(0, innerWidth), y: Randomizer(0, 200), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        bounce_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    bounce_animation:function(element) {
    
        gsap.to(element, {
        x: function() {
            return Randomizer(0, 250) + gsap.getProperty(element, "x");
        },
        y: innerHeight-75,
        duration: 3,
        ease: "bounce.out",
        });
        //Move right as we bounce
        gsap.to(element, {
        x: "+=200",
        duration: 3,
        // ease: "sine.inOut",
        delay: 0,
        });
        //Do a flip
        gsap.to(element, {
        rotationZ: 360,
        duration: 2,
        delay: 1
        });
        gsap.to(element, {opacity: 0, duration: 1, ease: "sine.inOut", delay: 3});
    },
    
    emoteSpiral:function(images, count=100, interval=75) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createSpiral("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createSpiral:function(image){
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random Y height at left edge of screen
        gsap.set(Div, { className: 'spiral-element', x: innerWidth/2, y: innerHeight/2, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        spiral_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    spiral_animation:function(element) {
        //Travel left to right
    
        spiralstartx = innerWidth/2;
        spiralstarty = innerHeight/2;
        spiralPath = "c -47 0 -85.1 -36.09 -85.1 -80.69 c 0 -52.43 44.84 -94.94 100.15 -94.94 c 65.08 0 117.84 50.01 117.84 111.69 c 0 72.58 -62.07 131.41 -138.63 131.41 c -90.09 0 -163.09 -69.21 -163.09 -154.59 c 0 -100.45 85.87 -181.88 191.87 -181.88 c 124.67 0 225.74 95.83 225.74 214 c 0 139 -118.9 251.73 -265.6 251.73 c -172.56 0 -312.44 -132.59 -312.44 -296.15 c 0 -192.42 164.57 -348.42 367.57 -348.42 c 238.83 0 432.44 183.52 432.44 409.9 c 0 266.34 -227.75 482.24 -508.75 482.24 c -330.53 0 -598.5 -254 -598.5 -567.3 c 0 -368.67 315.26 -667.5 704.15 -667.5 c 457.52 0 828.42 351.57 828.42 785.25";
        
        finalPath = "M " + spiralstartx + " " + spiralstarty + " " + spiralPath;
        //finalPath = "M1533.07,785.75C1533.07,352.07,1162.17.5,704.65.5,315.76.5.5,299.33.5,668,.5,981.3,268.47,1235.3,599,1235.3c281,0,508.75-215.9,508.75-482.24,0-226.38-193.61-409.9-432.44-409.9-203,0-367.57,156-367.57,348.42,0,163.56,139.88,296.15,312.44,296.15C766.88,987.73,885.78,875,885.78,736c0-118.17-101.07-214-225.74-214-106,0-191.87,81.43-191.87,181.88,0,85.38,73,154.59,163.09,154.59,76.56,0,138.63-58.83,138.63-131.41,0-61.68-52.76-111.69-117.84-111.69-55.31,0-100.15,42.51-100.15,94.94C551.9,754.91,590,791,637,791";
        //finalPath = "M637,791C590,791 551.9,754.91 551.9,710.3100000000002C551.9,657.8800000000001 596.74,615.3700000000001 652.05,615.3700000000001C717.13,615.3700000000001 769.89,665.3800000000001 769.89,727.0600000000001C769.89,799.64 707.8199999999999,858.47 631.26,858.47C541.17,858.47 468.16999999999996,789.26 468.16999999999996,703.88C468.16999999999996,603.4300000000001 554.04,522 660.04,522C784.71,522 885.78,617.83 885.78,736C885.78,875 766.88,987.73 620.18,987.7299999999999C447.61999999999995,987.7299999999999 307.73999999999995,855.1399999999999 307.73999999999995,691.5799999999999C307.73999999999995,499.15999999999997 472.30999999999995,343.15999999999997 675.31,343.15999999999997C914.14,343.15999999999997 1107.75,526.68 1107.75,753.06C1107.75,1019.4 880,1235.3 599,1235.3C268.47,1235.3 .5,981.3 .5,668C.5,299.33 315.76,.5 704.65,.5C1162.17,.5 1533.07,352.07 1533.07,785.75";
        console.log(finalPath);
    
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
    
    },
    
    emoteRightWave:function(images, count=100, interval=20) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createRightWave("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    emoteLeftWave:function(images, count=100, interval=20) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createLeftWave("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createRightWave:function(image){
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random Y height at left edge of screen
        gsap.set(Div, { className: 'rightwave-element', x: -100, y: Randomizer(100, innerHeight - 100), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        rightwave_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    createLeftWave:function(image){
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random Y height at left edge of screen
        gsap.set(Div, { className: 'rightwave-element', x: innerWidth + 100, y: Randomizer(100, innerHeight - 100), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        leftwave_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    rightwave_animation:function(element) {
        //Travel left to right
        gsap.to(element, { x: innerWidth + 100, duration: Randomizer(6, 11), ease: Sine.easeInOut});
        //sway up and down a bit
        gsap.to(element, { y: function() {
        return Randomizer(-350, 350) + gsap.getProperty(element, "y");
        }, duration: Randomizer(1, 2), ease: Sine.easeInOut, yoyo: true, repeat: -1});
    
    },
    
    leftwave_animation:function(element) {
        //Travel right to left
        gsap.to(element, { x: -100, duration: Randomizer(6, 11), ease: Sine.easeInOut});
        //sway up and down a bit
        gsap.to(element, { y: function() {
        return Randomizer(-350, 350) + gsap.getProperty(element, "y");
        }, duration: Randomizer(1, 2), ease: Sine.easeInOut, yoyo: true, repeat: -1});
    
    },
    
    emotecarousel:function(images, count=100, interval=120) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createCarousel("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createCarousel:function(image){
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random Y height at left edge of screen
        gsap.set(Div, { className: 'carousel-element', x: -100, y: innerHeight/2, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        carousel_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    carousel_animation:function(element) {
        gsap.to(element, { x: innerWidth + 100, duration: 5, ease: Sine.easeInOut});
        gsap.to(element, { y: "+=200", duration: 2.5, ease: Sine.easeInOut, repeat: 1, yoyo: true});
        
        gsap.to(element, { x: -100, duration: 5, ease: Sine.easeInOut, delay: 5});
        gsap.to(element, { y: "-=200", duration: 2.5, ease: Sine.easeInOut, repeat: 1, yoyo: true, delay: 5});
    },
    
    emoteVolcano:function(images, count=100, interval=30) {
    
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteVolcano("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createEmoteVolcano:function(image) {
    
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        gsap.set(Div, { className: 'volcano-element', x: innerWidth/2, y: innerHeight, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        volcano_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    
    },
    
    // Explosion Animation
    volcano_animation:function(element) {
    
        //Set a base intensity value, then use that to derive the motion path
        var intensity = Randomizer(5, 100);
    
        var verticalStrengthx = 0;
        var verticalStrengthy = -200 * Math.ceil(intensity/20);
        var horizontalStrengthx = 20 * Math.ceil(intensity/5) 
        var horizontalStrengthy = -400 * Math.ceil(intensity/30);
        var finalLocationx = Randomizer(300, innerWidth/2);
        var finalLocationy = Randomizer(-50, -350);
        
        //Flip half to the other side
        var direction = Randomizer(0, 1);
        if(Math.round(direction) == 1) {
        verticalStrengthx = -(verticalStrengthx);
        horizontalStrengthx = -(horizontalStrengthx);
        finalLocationx = -(finalLocationx);
        }
    
        //Construct the Motion Path. Reference tool for paths: https://yqnn.github.io/svg-path-editor/
        var motionPath = "M"+ " " + innerWidth/2 + " " + innerHeight + " " + "c " + verticalStrengthx + " " + verticalStrengthy + " " + horizontalStrengthx + " " +  horizontalStrengthy + " " + finalLocationx + " " + finalLocationy;
    
        //console.log(motionPath);
    
        gsap.to(element, { 
        duration: Randomizer(4, 8),
        ease: "power2.out",
        delay: 0.5,
        motionPath: {
            path: motionPath,
            
        }
        });
        gsap.to(element, Randomizer(3, 5), { opacity: 0, ease: Sine.easeIn, delay: 4 });
    },
    

    emoteCube:function (images, count=1, interval=50) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteCube("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createEmoteCube:function(image) {
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random X/Y within screen bounds
        gsap.set(Div, { className: 'cube-element', x: Randomizer(0, innerWidth), y: Randomizer(0, innerHeight), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        cube_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    cube_animation:function(element) {
    
    
    },
    
    
    
    emoteText:function (images, text='hype', interval=25){
        let imgcount = images.length;
        let count = 0;
        let length = text.length
        let character = 0;
        
        //Iterate each letter in textstring
        for (var i = 0; i < text.length; i++) {
        //alert(str.charAt(i));
        character++;
        let char = text.charAt(i)
        let pattern = alnumDist[char];
        
        //Iterate over each line of the letter
        for (var j = 0; j < pattern.length; j++) {   
            let line = j + 1;
            //console.log(pattern[k]);
    
            //Iterate each pixel of line
            for (var k = 0; k < pattern[j].length; k++) {
    
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
                imagenum = i % imgcount;
                var createcommand = 'createEmoteText("' + images[imagenum] + '", '+ length +', ' + character +', ' + line + ', '+ position +')';
                //console.log(createcommand);
                setTimeout(createcommand, (count * interval));
            }
    
            }
    
        }
    
        console.log(pattern);
    
        }
    },
    
    createEmoteText:function(image, length, character, x, y) {
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        let charwidthstart;
        let pixelsize = 30;
        let letterpadding = 20
        let letterwidth = 5 * pixelsize + letterpadding;
    
        //Total Width = Length of Word x pixels per letter x size of pixel
        let totalwidth = length * letterwidth;
        console.log("innerWidth: " + innerWidth);
        console.log("TotalWidth: " + totalwidth);
        if(totalwidth < innerWidth){
        charwidthstart = (innerWidth - totalwidth) / 2;
        console.log("Shorter than width");
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
        let random = Math.round(Randomizer(1,4));
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
        gsap.set(Div, { className: 'text-element', x: startX, y: startY, z: Randomizer(-200, 200), opacity: 0, width: pixelsize, height: pixelsize, backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        text_animation(Div, pixelX, pixelY);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    text_animation:function(element, pixelX, pixelY) {
        
    
        gsap.to(element, {duration: 2, opacity: 1, delay: 0});
        gsap.to(element, {duration: Randomizer(3, 5), x: pixelX, y: pixelY, delay: 0});
        gsap.to(element, {duration: 2, opacity: 0, delay: 13});
    
        gsap.to(element, {duration: 0.7, rotation: 30, repeat: -1, repeatDelay: 3});
        gsap.to(element, {duration: 2.3, rotation: 0, ease:Elastic.easeOut.config(0.9,0.1), delay: 0.7, repeat: -1, repeatDelay: 3});
    
        //gsap.to(element, {duration: 0.5, x: ""});
    
    },
    
    
    
    emoteDVD:function (images, count=1, interval=50) {
        imgcount = images.length;
    
        for (j = 0; j < count; j++) {
        // split the count amounst the different emote images
        imagenum = j % imgcount;
        var createcommand = 'createEmoteDVD("' + images[imagenum] + '")';
        setTimeout(createcommand, (j * interval));
        }
    },
    
    createEmoteDVD:function(image) {
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
    
        //create at random X/Y within screen bounds
        gsap.set(Div, { className: 'dvd-element', x: Randomizer(0, innerWidth), y: Randomizer(0, innerHeight), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });
    
        warp.appendChild(Div);
    
        // Run animation
        dvd_animation(Div);
        //Destroy element after X seconds so we don't eat up resources over time!
        setTimeout("removeelement(" + Div.id + ")", 15000);
    },
    
    dvd_animation:function(element) {
        var DVDStartX = gsap.getProperty(element, "x");
        var DVDStartY = gsap.getProperty(element, "y");
        var DVDStartDirection = Randomizer(0,360);
        var DVDFirstX = Randomizer(0, innerWidth);
        var DVDFirstY = Randomizer(0, innerWidth);
    
        var DVDFirstX = Math.sin(DVDStartDirection) * 2000;
        var DVDFirstY = Math.cos(DVDStartDirection) * 2000;
    
        console.log(DVDFirstX);
        console.log(DVDFirstY);
        
        gsap.to(element, {
        duration: 15,
        x: Randomizer(4000, 8000) * randomSign(), 
        y: Randomizer(4000, 8000) * randomSign(),    
        modifiers: { x: modX, y: modY }
        }); 
    
        gsap.to(element, {duration: 1, opacity: 0, delay: 14});
    
    },
    
    modX:function(x) {

        var minX = 0;
        var size = 75;
        var maxX = innerWidth  - size;
        x = parseInt(x);
          
        if (x > maxX || x < minX) {
          
          var delta = ((x % maxX) + maxX) % maxX;
          var start = x > maxX ? 1 : 0;
          var ratio = x / maxX + start;
          var even  = !(ratio & 1);
      
          x = even ? maxX - delta : minX + delta;
      
      }
      
        // console.log(x);
      
        return x + 'px';
    },
      
    modY:function(y) {
          
        var minY = 0;
        var size = 75;
        var maxY = innerHeight - size;
        y = parseInt(y);
      
        if (y > maxY || y < minY) {
          
          var delta = ((y % maxY) + maxY) % maxY;
          var start = y > maxY ? 1 : 0;
          var ratio = y / maxY + start;
          var even  = !(ratio & 1);
      
          y = even ? maxY - delta : minY + delta;
        }
      
        // console.log(y);
      
        return y + 'px';
    },


    train_animation:function(element){
        gsap.timeline({ repeat: -1, defaults: { duration: 3, ease: "none" } })
        .to(element, { x: innerWidth, duration: 10 })
        .to(element, { y: -500, duration: 0.5 })
        .to(element, { x: 0 - innerWidth, duration: 0.5 })
        .to(element, { y: 0, duration: 0.5 });
    },
    
    passenger_animation:function(element) {
        gsap.timeline({ repeat: -1, defaults: { duration: 3, ease: "none" } })
        .to(element, { x: "+=120" })
        .to(element, { x: "-=120" });
        gsap.to(element, {duration: 1, repeat: -1, y: "-=20", ease: "sine.out", yoyo: true });
    },

    
    createRaider:function(image){
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
        Div.style.background = 'url(' + image + ')';
        Div.style.backgroundSize = '100% 100%';
    
    
        TweenLite.set(Div, { className: 'raider-element', x: Randomizer(-400, -100), y: Randomizer(0, innerHeight), z:100 });
    
        warp.appendChild(Div);
    
        raiderAnimation(Div);
    
        setTimeout("removeelement(" + Div.id + ")", 50000);
    
    },
    
    raiderAnimation:function(element){
        //gsap.to(element, {y: "+=100", duration: 1, yoyo: true, repeat: 25, ease: "sine.inOut"});
        
        gsap.to(element, {rotation: "-=20", duration: 0.25, ease: "sine.inOut"});
        gsap.to(element, {rotation: "+=40", delay: 0.25, duration: 0.5, yoyo: true, repeat: 50, ease: "sine.inOut"});
        gsap.to(element, {duration: 8, x: Randomizer(innerWidth+100, innerWidth+400), yoyo: true, repeat: 1, repeatDelay: 5});
    
        let width = Randomizer(1, innerWidth); //0,1920
        let middle = innerWidth / 2; //980
        let height;
    
        if(width > middle){
        let newwidth = width - 980;
    
        height = 300 - newwidth/middle * 200;
        console.log(newwidth/middle * 200);
        console.log(height);
        }
        else {
        height = 100 + width/middle * 200;
        console.log(width/middle * 200);
        console.log(height);
        }
        
        gsap.to(element, {duration: 0, x: width, y: innerHeight+100, delay: 26});
        gsap.to(element, {duration: 2, y: innerHeight-height, delay: 27});
        gsap.to(element, {duration: 5, opacity: 0, delay: 29});
        
        
    
        //var tl2 = gsap.timeline({ repeat: 2, defaults: { duration: flipTime, ease: "none" } })
        //tl2.to(element, {duration: 6, x: innerWidth + 200});
        //tl2.to(element, {duration: 6, x: -200, delay: 5});
    
        //tl2.resume();
    },
    
    createAvatarChoon:function(image) {
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
        Div.style.background = 'url(' + image + ')';
        Div.style.backgroundSize = '100% 100%';
    
    
        //randomise side to peep from
        var random = Math.floor(Math.random() * 2) + 1;
        random = 1;
    
        //var Note = createNote("img/music1.png");
    
        switch (random) {
        case 1:
            // left - TweenLite.set(Div, { className: 'lurking-element', x: -600, y: Randomizer(0, innerHeight-600 ), z:0 });
            var height = Randomizer(0, innerHeight-400 );
            TweenLite.set(Div, { className: 'choon-element', x: -400, y: height, z:100 });
    
            var times = 5;
            var Notes = [];
            for(var i = 0; i < times; i++){
            Notes[i] = createNote("img/music1.png");
            TweenLite.set(Notes[i], { className: 'note-element', x: Randomizer(0, 250), y: height+400, z:10, opacity: 0 });
            //setTimeout("note_animation(" + Note + ")", 3000); 
            note_animation(Notes[i]);
            console.log(Notes[i]);
            let delayms = Math.round(Randomizer(0,3000));
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
        warp.appendChild(Div);
    
        setTimeout("removeelement(" + Div.id + ")", 15000);
        
        
    
    },
    
    createNote:function(image) {
        var MNoteDiv = document.createElement('div');
        MNoteDiv.id = divnumber;
        divnumber++;
        MNoteDiv.style.background = 'url(' + 'img/music1.png' + ')';
        MNoteDiv.style.backgroundSize = '100% 100%';
    
        warp.appendChild(MNoteDiv);
        setTimeout("removeelement(" + MNoteDiv.id + ")", 15000);
    
        return MNoteDiv
    },
    
    note_animation:function(element){
    
        gsap.to(element, {duration: 2, opacity: 1, yoyo: false, repeat: 0, delay: 3, })
        gsap.to(element, {duration: 1, rotationZ:'-=40', yoyo: false, repeat: 0, delay: 5})
    
    
        //Fade In
        gsap.to(element, { opacity: 1, width: "75px", height: "75px", ease: Linear.easeNone, repeat: 0, delay: -1, duration: 3 });
        //Vertical Movement
        gsap.to(element, { y: "-=400", x: function() {
        return Randomizer(-250, 250) + gsap.getProperty(element, "x");
        }, ease: Linear.easeNone, repeat: 0, delay: -1, duration: Randomizer(10, 20) });
        //Fade Out
        gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: Randomizer(9, 11) , duration: 4});
    
    },
    
    choon_animation_left:function(element) {
        
        gsap.to(element, {duration: 6, x: '+=450'})
        gsap.to(element, {duration: 1, y: '-=50', yoyo: true, ease: Sine.easeInOut, repeat: 6})
        gsap.to(element, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: Randomizer(8, 10) , duration: 4});
        //gsap.to(element, {duration: 0.2, rotationZ:'-=20', yoyo: true, repeat: 23, repeatDelay: 0, delay: 0.2})
        //gsap.to(element, {duration: 0.2, rotationZ: 0, yoyo: false, repeat: 0, delay: 4.8})
    
        
        // TweenMax.to(element, 1, { rotationZ:'+=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        // TweenMax.to(element, 1, { x:'+=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        // TweenMax.to(element, 1, { rotationZ:'-=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
        // TweenMax.to(element, 1, { x:'-=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    },
    
    choon_animation_right:function(element){
    
    },
    
    
    createAvatarCheers:function(image) {
        
        var Div = document.createElement('div');
        Div.id = divnumber;
        divnumber++;
        Div.style.background = 'url(' + image + ')';
        Div.style.backgroundSize = '100% 100%';
    
        var BeerDiv = document.createElement('div');
        BeerDiv.id = divnumber;
        divnumber++;
        BeerDiv.style.background = 'url(' + 'https://static-cdn.jtvnw.net/emoticons/v2/444572/default/dark/3.0' + ')';
        BeerDiv.style.backgroundSize = '100% 100%';
    
        console.log("Creating a Cheers Element");
    
        //randomise side to peep from
        var random = Math.floor(Math.random() * 2) + 1;
                            
        switch (random) {
        case 1:
            // left - TweenLite.set(Div, { className: 'lurking-element', x: -600, y: Randomizer(0, innerHeight-600 ), z:0 });
            var height = Randomizer(0, innerHeight-400 );
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
        warp.appendChild(Div);
        warp.appendChild(BeerDiv);
    
        // Run animation
        
        setTimeout("removeelement(" + Div.id + ")", 15000);
        setTimeout("removeelement(" + BeerDiv.id + ")", 15000);
    
    },
    
    cheers_animation_left:function(element, beerElement) {
        
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
    },
    
    cheers_animation_right:function(element) {
        //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
        //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
        //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});
    
        TweenMax.to(element, 1, { rotationZ:'-=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { x:'-=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
        TweenMax.to(element, 1, { rotationZ:'+=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
        TweenMax.to(element, 1, { x:'+=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
    
    },
    
    createCoins:function(count, side) {
    
        //var template = $(".template").remove();
        var template = document.querySelector(".template");
        var coinTl = new TimelineMax();
        var jumpTime = (Math.random() * .75) + .8;
        var coins = [];
        
        for (var i = 0; i < count; i++) {
    
        // Copy the template
        var clone = template.cloneNode(true);
        warp.append(clone);
        clone.id = divnumber;
        divnumber++;
    
    
        setTimeout("removeelement(" + clone.id + ")", 60000);
        
        // Finds the images inside the clone
        var img = document.querySelector(".template").querySelectorAll('img');
        
        var coin = {
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
        } 
        
    
        setTimeout(function() {
        flippage(coin, side);
        }, 4000);
        
        //return coins;  
    },
    
    flippage:function(coin, side) {
        
    
        if(side != "Heads" && side != "Tails") {
        return
        }
    
        var flipTime = 1 / 3;
    
        var tl1 = gsap.timeline({ repeat: 0, defaults: { duration: 3, ease: "none" } })
        // tl1.addLabel("headEnd2", 0);
        // tl1.addLabel("tailStart2", ">");
        tl1.to(coin.box, {y: "-=200", rotation: 10, duration: 3, ease: Power1.easeOut});
        tl1.to(coin.box, {y: "+=200", rotation: -10, duration: 3, ease: Bounce.easeOut});
        tl1.to(coin.box, {rotation: 0, duration: 0.1  });
    
        if(side == "Heads"){
        //heads
        var tl2 = gsap.timeline({ repeat: 3, defaults: { duration: flipTime, ease: "none" } })
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
        var tl2 = gsap.timeline({ repeat: 5, defaults: { duration: flipTime, ease: "none" } })
        tl2.fromTo(coin.heads, {scaleY: 1, y: 0}, {scaleY: 0, y: 0}, "headEnd2");
        tl2.fromTo(coin.edge, {scaleY: 1, y: 0}, {scaleY: 0, y: 8}, "headEnd2");
        tl2.fromTo(coin.line, {height: 0, y: 0}, {height: 8, y: 0}, "headEnd2");
        tl2.to(coin.edge, {y: 0, duration: 0}, "tailStart2");
        tl2.fromTo(coin.tails, {opacity: 1, scaleY: 0, y: 8}, {opacity: 1, scaleY: 1, y: 0}, "tailStart2");
        tl2.to(coin.edge, {scaleY: 1, y: 0}, "tailStart2");
        tl2.to(coin.line, {height: 0, y: 0}, "tailStart2");
        }
    
        
    
    },
    
    getFlippage:function(coin, whatSide) {
    
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
    },
    
    //makes a new animation for a coin that's tails
    // tailFlip:function(coin) {
    
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
    
    // headFlip:function(coin) {
        
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
    
    // buildTimeline:function(coins, coinTl) {
    
    //   // forEach is an array method
    //   coins.forEach(function(coin) {    
    //     coinTl.add(coin.flip(), 0);
    //   });
    // };

    //Add user avatar to current train car
hypetrainprogression:function(userId){
  
    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        // get display image for the userId
        console.log("got a user image response back");
        // console.log(xhttp.responseText);
        
        image = [xhttp.responseText];
        createhypetrainprogression(image);
  
      }
    };
    
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + userId + "?id=true", true);
    xhttp.send();
  },
  
  createhypetrainprogression:function(image){
    var UserImage = document.createElement('img');
    UserImage.id = divnumber;
    divnumber++;
  
    //image = "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2758558107d148c9b1e73c56cb2d9e06/default/dark/2.0";
  
   
  
    gsap.set(UserImage, { className: 'cart-image', z: 10, zIndex: 10, position: "absolute", left: "20px;", top: "70px", attr: { src: image } });
  
    HypeCart.appendChild(UserImage);
    passenger_animation(UserImage)
  
  },
  
  hypetrainfinish:function(){
    
    //console.log(HypeTrainWrapper.id);
  
    clearTimeout(hypetimer);
    hypetimer = setTimeout("removeelement(" + HypeTrainWrapper.id + ")", 5000);
    
  },

  hypetrainstart:function(){
  
    let image = "img/trainhead.png";
    var HypeTrainWrapper = document.createElement('div');
    HypeTrainWrapper.id = self.divnumber;
    self.divnumber++;
  
    var HypeTrainHead = document.createElement('div');
    
    gsap.set(HypeTrainWrapper, { className: 'train-wrapper', x: 0 - innerWidth, y: 0, z: Randomizer(-200, 200), });
    //gsap.set(HypeTrainWrapper, { className: 'train-wrapper', x: 0, y: 0, z: Randomizer(-200, 200), });
    gsap.set(HypeTrainHead, { className: 'train-head', float: "right", z: Randomizer(-200, 200), width: "225px", height: "225px", backgroundImage: 'url(' + image + ')' });
  
    warp.appendChild(HypeTrainWrapper);
    HypeTrainWrapper.appendChild(HypeTrainHead); 
  
    hypetimer = setTimeout("removeelement(" + HypeTrainWrapper.id + ")", 360000);
  
    train_animation(HypeTrainWrapper);
    hypetrainlevelup();
  
    let delayTime = 1000;
    hypetrainCache.forEach(async (userId) => {
      delay(delayTime).then(() => hypetrainprogression(userId));
      delayTime = delayTime + 3000;
    });
    
  },
  
  //Add additional Car to Train
  hypetrainlevelup:function(){
  
    clearTimeout(hypetimer);
    hypetimer = setTimeout("removeelement(" + HypeTrainWrapper.id + ")", 360000);
  
    cartNum = Math.round(Randomizer(1,2));
    let image;
    if(cartNum == 1){
      image = "img/cart1.png";
    }
    if(cartNum == 2){
      image = "img/cart2.png";
    }
    else {
      image = "img/cart1.png";
    }
  
    HypeCart = document.createElement('div');
    HypeCart.id = divnumber;
    divnumber++;
  
    
  
    gsap.set(HypeCart, { className: 'train-cart', float: "right", z: Randomizer(-200, 200), width: "225px", height: "225px" });
  
  
    var CartImage = document.createElement('img');
    CartImage.id = divnumber;
    divnumber++;
  
    gsap.set(CartImage, { className: 'cart-image', z: 100, zIndex: 100, position: "relative", width: "225px", height: "225px", attr: { src: image }  });
  
    HypeTrainWrapper.appendChild(HypeCart);
    HypeCart.appendChild(CartImage);
  
  }
    
}
;// CONCATENATED MODULE: ./TestingSplits/helpers.js
// Randomizer
function helpers_Randomizer(min, max) {
    return min + Math.random() * (max - min);
}

function TopOrBottom() {
    var topOrBottom = Math.random();
    if (topOrBottom < 0.5) {
        return -200;
    } else {
        return innerHeight + 200;
    }
}

// Check if string ends with number
function countvalues(str) {
    return str.match(/\s[0-9]+/g);
}


// Get number at end of string
function getCommandValue(str, type) {

    let values = countvalues(str);

    if (values === null) {
        return null;
    }

    if (type == 'count') {

        if (values.length == 2) {
            return values[0].trim();
        } else if (values.length == 1) {
            return values[0].trim();
        } else {
            return null;
        }
    }

    if (type == 'interval') {

        if (values.length == 2) {
            return values[1].trim();
        } else {
            return null;
        }
    }
}

function helpers_delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


function helpers_randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}


function removeelement(div) {
    document.getElementById(div).remove();
}
;// CONCATENATED MODULE: ./TestingSplits/handlers.js


function chatMessageHandler(wsdata) {
    var message = wsdata.data.message.message
    var lowermessage = wsdata.data.message.message.toLowerCase();
    var username = wsdata.data.message.username;
    var userId = wsdata.data.message.userId;

    //Lurk
    if (lowermessage.includes("!lurk")) {
      if(!lurk && !all){
        console.log("Lurk Not Enabled");
        return
      }
      lurkCommand(username);
    }

    //Shoutout
    if (lowermessage.includes("!so")) {
      if(!welcome && !all){
        console.log("Shoutout Not Enabled");
        return
      }
      shoutoutCommand(lowermessage);
    }

    //Choon
    if (lowermessage.includes("!choon")) {
      if(!all){
        console.log("Choon Command Not Enabled");
        return
      }
      choonCommand(username);
    }

    //Cheers
    if (lowermessage.includes("!cheers") || lowermessage.includes("!tune")) {
      if(!all){
        console.log("Cheers Command Not Enabled");
        return
      }
      cheersCommand(username);
    }

    //Join Hype Train Command for Testing
    if (lowermessage.includes("!jointrain")) {
      if(!debug){
        console.log("Cheers Command Not Enabled");
        return
      }
      hypetrainprogression(userId);
    }

    //Emotes
    //TestCommand: 
    //emoteVolcano(['https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2758558107d148c9b1e73c56cb2d9e06/default/dark/2.0', 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcaf0a56231d4443a91546b869b96a25/default/dark/2.0'], 100, 20);

    if (typeof wsdata.data.message.emotes != "undefined") {
      emoteMessageHandler(wsdata);
    }
  }

function actionsHandler(wsdata){
var data = wsdata.data;
var action = wsdata.data.name;

if (action == "IncomingRaid") {
    if(!all){
    console.log("All Not Enabled");
    return
    }
    incomingRaid(data);
}

if (action == "New Cheer" || action == "New Sub"){
    if(hypetrainCache[2]){
    hypetrainCache[3] = hypetrainCache[2];
    hypetrainCache[2] = hypetrainCache[1];
    hypetrainCache[1] = wsdata.data.arguments.userId;
    }
    else if(hypetrainCache[1]){
    hypetrainCache[2] = hypetrainCache[1];
    hypetrainCache[1] = wsdata.data.arguments.userId;
    }
    else {
    hypetrainCache[1] = wsdata.data.arguments.userId;
    }
}     

}

function emoteMessageHandler(wsdata){
  var message = wsdata.data.message.message
  var lowermessage = wsdata.data.message.message.toLowerCase();
  var userrole = wsdata.data.message.role;
  var sub = wsdata.data.message.subscriber;
  var emotecount = wsdata.data.message.emotes.length;

  var images = [];
  var i;
  for (i = 0; i < emotecount; i++) {
    images[i] = wsdata.data.message.emotes[i].imageUrl;
  }


  var eInterval = getCommandValue(lowermessage, "interval");
  var eCount = getCommandValue(lowermessage, "count");

  if(eCount != null) {
  if(eCount > maxemotes){
      eCount = maxemotes;           
  }
  }

  //TextCommand, FunctionName, DefaultEmotes, DefaultInterval
  var animations = [
  ['!er rain', 'emoteRain', 50, 50],
  ['!er rise', 'emoteRise', 100, 50],
  ['!er explode', 'emoteExplode', 100, 20],
  ['!er volcano', 'emoteVolcano', 100, 20],
  ['!er firework', 'emoteFirework', 100, 20],
  ['!er rightwave', 'emoteRightWave', 100, 20],
  ['!er leftwave', 'emoteLeftWave', 100, 20],
  ['!er carousel', 'emotecarousel', 100, 150],
  ['!er spiral', 'emoteSpiral', 100, 170],
  ['!er comets', 'emoteComets', 100, 50],
  ['!er dvd', 'emoteDVD', 8, 50],
  ['!er text', 'emoteText', 8, 25],
  //['!er cube', 'emoteCube', 8, 50],
  ];

  //Specific Animation Commands
  if (emoterain){
  if (subonly & !sub) {
      console.log("Sub Only Mode enabled, Messsage was not from a Sub");
      return
  }


  animations.forEach(function (animation) {
      if (lowermessage.startsWith(animation[0])) {
      if(!eCount){eCount = animation[2];}
      if(!eInterval){eInterval = animation[3]}

      //EmoteText Specific Handling
      if(animation[1] == "emoteText") {
          let regexp = /text (\S*)/gm;  
          let matches = regexp.exec(wsdata.data.message.message);
          eCount = matches[1];

          if(wsdata.data.message.emotes.length < 1 && Botchat){
          let message = "Invalid Syntax, please try using '!er text <WordToWrite> <Emotes to use>'"
          botChat(message);
          }

          //Ensure that text was supplied by checking if the text string matches the first emote
          let emotenames = "";
          for(const emote of wsdata.data.message.emotes) {
          emotenames = emotenames + emote["name"] + " ";
          }
          //Set Default Text if no text supplied
          if(emotenames.includes(eCount)){
          eCount = "Hype";
          }                
      }

      window[animation[1]](images, eCount, eInterval);
      console.log("running " + animation[1] + " with " + eCount + " emote(s)" + " and interval " + eInterval);
      }
  });
}


//Kappagen Animations
if (kappagen){
if (subonly & !sub) {
    console.log("Sub Only Mode enabled, Messsage was not from a Sub");
    return
}

if(lowermessage.includes("!k ")) {
    rAnimation = Math.round(Randomizer(0,animations.length));
    if(!eCount){eCount = animations[rAnimation][2];}
    if(!eInterval){eInterval = animations[rAnimation][3];}

    window[animations[rAnimation][1]](images, eCount, eInterval);
    console.log("running " + animations[rAnimation][1] + " with " + eCount + " emote(s)" + " and interval " + eInterval);
}

}

//Normal emotes animations
randomAnimation = Math.round(Randomizer(1,2));
switch(randomAnimation) {
case 1:
    emoteRain(images, emotecount);
    break;

case 2:  
    emoteBounce(images, emotecount);
    break;
}

}

function firstWordsHander(wsdata){
    if(!welcome && !all){
    console.log("First Words Not Enabled");
    return
    }
    
    var username = wsdata.data.user.name;
    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got a user image response back");
        
        avatar = [xhttp.responseText];
        //Trigger Animation
        emoteRain(avatar, defaultemotes, 50);

    }
    };
    console.log(username);
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
    xhttp.send();          
}

function cheersCommand(username){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got a user image response back");
        // console.log(xhttp.responseText);
      
        avatar = [xhttp.responseText];
        //createAvatarCheers(avatar);
      }
      xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
      xhttp.send();
    }
}
  
function choonCommand(username){
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
    // get display image for the user
    console.log("got a user image response back");
    // console.log(xhttp.responseText);
    
    avatar = [xhttp.responseText];
    //Disabled While Live
    createAvatarChoon(avatar);

    }
};

xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
xhttp.send();
}

function incomingRaid(data){
    var raiders = data.arguments.raiderNames.split(',');
  
    console.log(raiders);
  
    raiders.forEach(async (raider) => {
      var username = raider;
      var xhttp = new XMLHttpRequest();
      console.log("created xmlhttp object");
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          // get display image for the user
          console.log("got a user image response back");
          
          avatar = [xhttp.responseText];
          //Trigger Animation
          animations.createRaider(avatar);
  
        }
      };
      console.log(username);
      xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
      xhttp.send();  
  
    });
}

function lurkCommand(username){
    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got the users image back");         
        //Trigger Animation
        VisualLurk(xhttp.responseText, 3);
      }
    };
    //console.log(username);
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
    xhttp.send();   
}
  
function shoutoutCommand(lowermessage){
            
    // ALLOW - And other word symbols
    const regexp = /\@(.*)/;
    const matches = lowermessage.match(regexp);
    const sousername = matches[1];
    console.log(sousername);
    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // get display image for the user
        console.log("got a user image response back");
        // console.log(xhttp.responseText);
        
        avatar = [xhttp.responseText];
        emoteRain(avatar, defaultemotes, 50);

      }
    };
    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + sousername, true);
    xhttp.send();           
}
;// CONCATENATED MODULE: ./TestingSplits/script.js





//update here to allow more than 10 emotes per chat message
//This may be pretty intensive on the system under heavy load so please use with care.
//var maxemotes = 2000;
//var divnumber = 0;
var script_defaultemotes = 50;
var script_maxemotes = 200;
var channelsub;
var script_hypetrainCache = (/* unused pure expression or super */ null && ([]));
//Checks for SB Actions
var BotChat;
var script_hypetimer;
var script_HypeTrainWrapper;
var script_HypeCart;



const urlParams = new URLSearchParams(window.location.search);

// const maxemotes = urlParams.get('maxemotes');
let script_subonly = urlParams.get('subonly');
let script_emoterain = urlParams.get('emoterain');
let script_welcome = urlParams.get('welcome');
let script_all = urlParams.get('all');
let script_lurk = urlParams.get('lurk');
let script_kappagen = urlParams.get('kappagen');
let script_debug = urlParams.get('debug');


var server = urlParams.get('server');
    if (!(server === null)) {
      server="ws://"+server+"/";
    }
    else
    {
      server="ws://localhost:8080/";
    }
const ws = new WebSocket(server);

gsap.registerPlugin(MotionPathPlugin);

var script_warp = document.getElementById("confetti-container"),
  script_innerWidth = window.innerWidth,
  script_innerHeight = window.innerHeight;

function connectws() {
  if ("WebSocket" in window) {
   
    ws.onclose = function () {
      // "connectws" is the function we defined previously
      setTimeout(connectws, 10000);
    };

    if(urlParams.get('maxemotes')){
      script_maxemotes = urlParams.get('maxemotes');
    } else {
      script_maxemotes = 200;
    }
    

    //let lurk = urlParams.get('lurk');
    if(!(script_lurk === null )){script_lurk = true;} else {script_lurk = null;}
    if(!(script_kappagen === null )){script_kappagen = true;} else {script_kappagen = null;}
    if(!(script_all === null )){script_all = true;} else {script_all = null;}
    if(!(script_subonly === null )){script_subonly = true;} else {script_subonly = null;}
    if(!(script_emoterain === null )){script_emoterain = true;} else {script_emoterain = null;}
    if(!(script_welcome === null )){script_welcome = true;} else {script_welcome = null;}
    if(!(script_debug === null )){script_debug = true;} else {script_debug = null;}

    if(script_all){
      script_lurk = true;
      script_emoterain = true;
      script_kappagen = true;
      script_welcome = true;
    }



    //Enable all Events
    ws.onopen = function () {
      ws.send(JSON.stringify(
        {
          "request": "Subscribe",
          "events": {
            "Twitch": [
              "ChatMessage", "FirstWord", "HypeTrainStart", "HypeTrainUpdate", "HypeTrainLevelUp", "HypeTrainEnd", "Raid" 
            ],
            "Raw": [
              "Action"
            ],
            "General": [
              "Custom"
            ]
          },
          "id": "123"
        }
      ));

      ws.send(JSON.stringify(
        {
          "request": "GetActions",
          "id": "ActionList"
        }
      ));
    
    };

    ws.onmessage = function (event) {
      // grab message and parse JSON
      const msg = event.data;
      const wsdata = JSON.parse(msg);

      console.log(wsdata);

      //SetupChecks
      if(typeof wsdata.actions != "undefined" && typeof wsdata.id == "ActionList") {
        let ChatAction = wsdata.actions.filter(function (SBAction) { return SBAction.name == "ERTwitchBotChat" });
        console.log(ChatAction);
        if(ChatAction.length >= 1){
          console.log("True");
          Botchat = true;
        }
      }

      //Check if the channel is a gforce sub
      if(!channelsub) {
        channelsub = true;
        console.log("I should only see this once");
      }


      //Check for Undefined WS Events
      if (typeof wsdata.event == "undefined") {
        console.log("Event undefined");
        return;
      }
      if (typeof wsdata.event.type == "undefined") {
        console.log("Event Type undefined");
        return;
      }

      //Pass to ChatMessageHandler 
      if (wsdata.event.type == "ChatMessage") {
        chatMessageHandler(wsdata);
        return;
      }

      //Pass to FirstWordsHandler 
      if (wsdata.event.type == "FirstWord") {
        firstWordsHander(wsdata);
        return;
      }

      //Hype Train Start - Start the repeating train animation with the train head image and the first cart
      if (wsdata.event.type == "HypeTrainStart") {
        animations_animations.hypetrainstart();
        return;
      }

      //Hype Train Level Up - Add a cart to the end of the train
      if (wsdata.event.type == "HypeTrainLevelUp") {
        animations_animations.hypetrainlevelup();  
        return;
      }


      //Hype Progression - Add a user to the current train cart
      if (wsdata.event.type == "HypeTrainUpdate") {
        animations_animations.hypetrainprogression(wsdata.data.userId);
        return;
      }

      //Hype Train Finish - Remove the Train
      if (wsdata.event.type == "HypeTrainEnd") {
        animations_animations.hypetrainfinish();
        return;
      }

      //CoinFlipResults
      if (wsdata.event.type == "Custom") {
        if (wsdata.data.coinFlipResult == "undefined") {
          return
        }

        if(wsdata.data.coinFlipResult == "Heads"){
          animations_animations.createCoins(1, "Heads" );
        }
        if(wsdata.data.coinFlipResult == "Tails"){
          animations_animations.createCoins(1, "Tails" );
        }
      }

      //Actions
      if(wsdata.event.type == "Action"){
        actionsHandler(wsdata);
        return
      }
    }
  }
}



function firework(image){}




function script_botChat(message){
  ws.send(JSON.stringify(
    {
      "request": "DoAction",
      "action": {
        "name": "ERTwitchBotChat"
      },
      "args": {
        "message": message,
      },
      "id": "123"
    }
  ));
}



connectws();
/******/ })()
;