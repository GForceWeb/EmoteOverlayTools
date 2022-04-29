//update here to allow more than 10 emotes per chat message
// This may be pretty intensive on the system under heavy load so please use with care.
//var maxemotes = 2000;
var divnumber = 0;
var defaultemotes = 50;
var maxemotes = 200;

gsap.registerPlugin(MotionPathPlugin);

var warp = document.getElementById("confetti-container"),
  innerWidth = window.innerWidth,
  innerHeight = window.innerHeight;

function connectws() {
  if ("WebSocket" in window) {
    const urlParams = new URLSearchParams(window.location.search);
    var server = urlParams.get('server');
    if (!(server === null)) {
      server="ws://"+server+"/";
    }
    else
    {
      server="ws://localhost:8080/";
    }


    const ws = new WebSocket(server);
    ws.onclose = function () {
      // "connectws" is the function we defined previously
      setTimeout(connectws, 10000);
    };

    if(urlParams.get('maxemotes')){
      maxemotes = urlParams.get('maxemotes');
    } else {
      maxemotes = 200;
    }
    // const maxemotes = urlParams.get('maxemotes');
    let subonly = urlParams.get('subonly');
    let emoterain = urlParams.get('emoterain');
    let welcome = urlParams.get('welcome');
    let all = urlParams.get('all');
    let lurk = urlParams.get('lurk');
    let kappagen = urlParams.get('kappagen');
    
    //let lurk = urlParams.get('lurk');
    if(!(lurk === null )){lurk = true;} else {lurk = null;}
    if(!(kappagen === null )){kappagen = true;} else {kappagen = null;}
    if(!(all === null )){all = true;} else {all = null;}
    if(!(subonly === null )){subonly = true;} else {subonly = null;}
    if(!(emoterain === null )){emoterain = true;} else {emoterain = null;}
    if(!(welcome === null )){welcome = true;} else {welcome = null;}


    // console.log(subonly);
    // console.log(emoterain);
    // console.log(welcome);
    // console.log(all);
    // console.log(lurk);
    // console.log(kappagen);
    
    

    //Enable all Events
      ws.onopen = function () {
        ws.send(JSON.stringify(
          {
            "request": "Subscribe",
            "events": {
              "Twitch": [
                "ChatMessage", "FirstWord"
              ],
              "Raw": [
                "Action"
              ]
            },
            "id": "123"
          }
        ));
      };
    }
    else if (!(welcomeonly === null) ) {
      console.log("Only first words enabled");
      ws.onopen = function () {
        ws.send(JSON.stringify(
          {
            "request": "Subscribe",
            "events": {
              "Twitch": [
                "FirstWord"
              ],
              "Raw": [
                "Action"
              ]
            },
            "id": "123"
          }
        ));
      };
    }
    else {
      //no first words / welcome support

      ws.onopen = function () {
        ws.send(JSON.stringify(
          {
            "request": "Subscribe",
            "events": {
              "Twitch": [
                "ChatMessage"
              ]
              ,
              "Raw": [
                "Action"
              ]
            },
            "id": "123"
          }
        ));
      };

    }

    ws.onmessage = function (event) {
      // grab message and parse JSON
      const msg = event.data;
      const wsdata = JSON.parse(msg);

      //check for lurk command

      if (typeof wsdata.event != "undefined") {
        if (typeof wsdata.event.type != "undefined") {
          if (typeof wsdata.data.name != "undefined") {
            if (wsdata.data.name == "VisualLurk") {

              var username = wsdata.data.user.login;
              console.log("starting xmlhttp");
              var xhttp = new XMLHttpRequest();
              console.log("created xmlhttp object");
              xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                  // get display image for the user
                  console.log("got a users image back");
                  //save this to cache between sessions too.
                  var no_of_elements = 50;

                  //visualLurk = createVisualLurk(xhttp.responseText);
                  lurkInterval = setInterval(function() { createVisualLurk(xhttp.responseText); }, 5000);
                  setTimeout(function() { clearInterval(lurkInterval); }, 15000);
                }
              };
              console.log(username);
              xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
              xhttp.send();



            }

          }
        }
      }

      // check for events to trigger
      // check for first words

      if (typeof wsdata.event != "undefined") {
        if (typeof wsdata.event.type != "undefined") {
          if (wsdata.event.type == "FirstWord") {


            var username = wsdata.data.user.login;
            console.log("starting xmlhttp");
            var xhttp = new XMLHttpRequest();
            console.log("created xmlhttp object");
            xhttp.onreadystatechange = function () {
              if (this.readyState == 4 && this.status == 200) {
                // get display image for the user
                console.log("got a response back");
                //save this to cache between sessions too.
                var no_of_elements = 50;

                var warp = document.getElementById("confetti-container"),
                  innerWidth = window.innerWidth,
                  innerHeight = window.innerHeight;

                // Load into page
                for (i = 0; i < no_of_elements; i++) {
                  var Div = document.createElement('div');
                  Div.id = divnumber;
                  divnumber++;

                  TweenLite.set(Div, { className: 'falling-element', x: Randomizer(0, innerWidth), y: Randomizer(-500, -450), z: Randomizer(-200, 200) });
                  Div.style.background = 'url(' + xhttp.responseText + ')';
                  Div.style.backgroundSize = '100% 100%';

                  warp.appendChild(Div);

                  // Run animation
                  falling_animation(Div);

                  setTimeout("removeelement(" + Div.id + ")", 15000);
                }
              }
            };
            console.log(username);
            xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
            xhttp.send();

          }
        }
      }


      //if emotes exist in message check for command conditions and if not found, do standard rain
      if (typeof wsdata.event != "undefined") {
        if (typeof wsdata.event.type != "undefined") {
          if (typeof wsdata.data.message.emotes != "undefined") {
            if (typeof wsdata.data.message.emotes != "undefined") {

              emotecount = wsdata.data.message.emotes.length;

              var images = [];
              for (i = 0; i < emotecount; i++) {
                images[i] = wsdata.data.message.emotes[i].imageUrl;
              }
              var lowermessage = wsdata.data.message.message.toLowerCase();
              var userrole = wsdata.data.message.role;
              
              var sub = wsdata.data.message.subscriber;

              //TODO: add a way to specify custom interval in chat message
              var eInterval;
              var eCount = getNumberAtEnd(lowermessage);
              if(eCount){
                if(eCount > maxemotes){
                  eCount = maxemotes;
                }
              }

              console.log(sub);
              console.log(wsdata.data.message);
              //console.log(sub);

              if(lowermessage.includes("!er rain") && userrole > 1 && (!(rain === null) || !(all === null))) {
                //set default values
                if(!eCount){eCount = 50;}
                if(!eInterval){eInterval = 50;}
                emoteRain(images, eCount, eInterval);
              }
              if(lowermessage.includes("!er rise") && userrole > 1 && (!(rain === null) || !(all === null))) {
                if(!eCount){eCount = 100;}
                if(!eInterval){eInterval = 50;}
                emoteRise(images, eCount, eInterval);
              }
              if(lowermessage.includes("!er explode") && userrole > 1 && (!(rain === null) || !(all === null))) {
                if(!eCount){eCount = 100;}
                if(!eInterval){eInterval = 20;}
                emoteExplode(images, eCount, eInterval);
              }
              if(lowermessage.includes("!er firework") && userrole > 1 && (!(rain === null) || !(all === null))) {
                if(!eCount){eCount = 100;}
                if(!eInterval){eInterval = 20;}
                emoteFirework(images, eCount, eInterval);
              }
              if(lowermessage.includes("!er volcano") && userrole > 1 && (!(rain === null) || !(all === null))) {
                if(!eCount){eCount = 100;}
                if(!eInterval){eInterval = 20;}
                emoteVolcano(images, eCount, eInterval);
              }
              if(lowermessage.includes("!k ") && sub && (!(rain === null) || !(all === null))) {
                if(!eCount){eCount = 100;}
                if(!eInterval){eInterval = 20;}

                randomAnimation = Math.round(Randomizer(1,5));
                switch(randomAnimation)
                {
                    case 1:
                    if(!eCount){eCount = 100;}
                    if(!eInterval){eInterval = 20;}
                    emoteVolcano(images, eCount, eInterval);
                    break;

                    case 2:
                    if(!eCount){eCount = 100;}
                    if(!eInterval){eInterval = 20;}
                    emoteFirework(images, eCount, eInterval);
                    break;

                    case 3:
                    if(!eCount){eCount = 100;}
                    if(!eInterval){eInterval = 20;}
                    emoteExplode(images, eCount, eInterval);
                    break;

                    case 4:
                    if(!eCount){eCount = 100;}
                    if(!eInterval){eInterval = 50;}
                    emoteRise(images, eCount, eInterval);
                    break;

                    case 5:
                    if(!eCount){eCount = 50;}
                    if(!eInterval){eInterval = 50;}
                    emoteRain(images, eCount, eInterval);
                    break;
                }
                
              }
              else {
                emoteRain(images, emotecount);
              }
            }
          }
        }
      }



      //check for emotes wsdata.data.message.emotes
      //get user image from wsdata.data.user.login
      //Send this to emote rain
      if (typeof wsdata.data != "undefined") {
        if (typeof wsdata.data.message != "undefined") {
          if (typeof wsdata.data.message.emotes != "undefined") {
            if (typeof wsdata.data.message.emotes != "undefined") {

              if (wsdata.data.message.emotes.length > 0) {
                if (wsdata.data.message.emotes.length > maxemotes) {
                  emotecount = maxemotes;
                }
                else {
                  emotecount = wsdata.data.message.emotes.length;
                }




                //Loop through number of emotes in message
                for (i = 0; i < emotecount; i++) {
                  //document.getElementById("lastemote").src=wsdata.data.message.emotes[i].imageUrl;
                  var emoteraincommand = 'emoteRain("' + wsdata.data.message.emotes[i].imageUrl + '")';
                  var emoterisecommand = 'emoteRise("' + wsdata.data.message.emotes[i].imageUrl + '")';
                  var emoteexplodecommand = 'emoteExplode("' + wsdata.data.message.emotes[i].imageUrl + '")';
                  //console.log(emoterisecommand);
                  //document.getElementById("test").innerHTML=emoteraincommand;
                  var lowermessage = wsdata.data.message.message.toLowerCase();


                  if (lowermessage.includes("!er rain") && wsdata.data.message.role > 1 && (!(rain === null) || !(all === null))) {

                    for (j = 0; j < 50; j++) {
                      //setTimeout(emoteraincommand, (j * 200));
                    }

                  }
                  if (lowermessage.includes("!er rise") && wsdata.data.message.role > 1 && (!(rain === null) || !(all === null))) {

                    for (j = 0; j < 200; j++) {
                      //setTimeout(emoterisecommand, (j * 10));
                    }

                  }
                  if (lowermessage.includes("!er explode") && wsdata.data.message.role > 1 && (!(rain === null) || !(all === null))) {

                    for (j = 0; j < 200; j++) {
                      //setTimeout(emoteexplodecommand, (j * 10));
                    }

                  }
                  else {
                    //setTimeout(emoteraincommand, 300);
                  }
                  
                };
              }
            }
          }
        }
      }
    }
  }
}

function emoteVolcano(images, count=100, interval=30) {

  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the images
    imagenum = j % imgcount;
    var createcommand = 'createEmoteVolcano("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function createEmoteVolcano(image) {

  var Div = document.createElement('div');
  Div.id = divnumber;
  divnumber++;

  gsap.set(Div, { className: 'volcano-element', x: innerWidth/2, y: innerHeight, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

  warp.appendChild(Div);

  // Run animation
  volcano_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout("removeelement(" + Div.id + ")", 15000);

}

// Explosion Animation
function volcano_animation(element) {

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
    ease: Sine.easeOut,
    delay: 0.5,
    motionPath: {
      path: motionPath,
      
    }
  });
  gsap.to(element, Randomizer(3, 5), { opacity: 0, ease: Sine.easeIn, delay: 4 });
}


function emoteFirework(images, count=100, interval=1) {

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
}

function createFireworkTravel(image, explodeX, explodeY, travelTime) {

  var Div = document.createElement('div');
  Div.id = divnumber;
  divnumber++;

  gsap.set(Div, { className: 'firework-element', x: innerWidth/2, y: innerHeight, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

  warp.appendChild(Div);

  // Run animation
  firework_travel_animation(Div, explodeX, explodeY, travelTime);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout("removeelement(" + Div.id + ")", 5000);

}

function createFireworkExplode(image, explodeX, explodeY, travelTime) {

  var Div = document.createElement('div');
  Div.id = divnumber;
  divnumber++;

  gsap.set(Div, { className: 'firework-element', x: explodeX, y: explodeY, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')', opacity: 0});

  warp.appendChild(Div);

  // Run animation
  firework_explode_animation(Div, travelTime);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout("removeelement(" + Div.id + ")", 15000);

}

// Explosion Animation
function firework_travel_animation(element, targetX, targety, duration=5) {
  gsap.to(element, { x: targetX, y: targety, ease: Sine.easeOut, duration: duration });
}

// Explosion Animation
function firework_explode_animation(element, delay=5) {
  //Fire off in a random direction
  var angle = Math.random()*Math.PI*2;
  animatex = Math.cos(angle)*innerWidth*1.5;
  animatey = Math.sin(angle)*innerHeight*1.5;

  gsap.set(element, { opacity: 1, delay: delay});
  gsap.to(element, Randomizer(5, 10), { x: animatex, y: animatey, ease: Sine.easeOut, delay: delay });
  gsap.to(element, Randomizer(5, 10), { opacity: 0, ease: Sine.easeIn, delay: delay });
}


function createEmoteExplode(image) {
  var Div = document.createElement('div');
  Div.id = divnumber;
  divnumber++;

  gsap.set(Div, { className: 'explosion-element', x: explodeX, y: explodeY, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

  warp.appendChild(Div);

  // Run animation
  explosion_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout("removeelement(" + Div.id + ")", 15000);
}


function emoteExplode(images, count=100, interval=10) {

  explodeX = Randomizer(200, innerWidth - 200);
  explodeY = Randomizer(200, innerHeight - 200);

  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the images
    imagenum = j % imgcount;
    var createcommand = 'createEmoteExplode("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function emoteRise(images, count=100, interval=20) {

  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the images
    imagenum = j % imgcount;
    var createcommand = 'createEmoteRise("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}


function createEmoteRise(image) {
  var Div = document.createElement('div');
  Div.id = divnumber;
  divnumber++;

  gsap.set(Div, { className: 'rising-element', x: Randomizer(0, innerWidth), y: innerHeight - 75, z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

  warp.appendChild(Div);

  // Run animation
  rising_animation(Div);
  //Destroy element after 8 seconds so we don't eat up resources over time!
  setTimeout("removeelement(" + Div.id + ")", 15000);
}


function emoteRain(images, count=100, interval=50) {

  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the images
    imagenum = j % imgcount;
    var createcommand = 'createEmoteRain("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}


function createEmoteRain(image) {

  var Div = document.createElement('div');
  Div.id = divnumber;
  divnumber++;

  gsap.set(Div, { className: 'falling-element', x: Randomizer(0, innerWidth), y: Randomizer(-500, -450), z: Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

  warp.appendChild(Div);

  // Run animation
  falling_animation(Div);
  //Destroy element after X seconds so we don't eat up resources over time!
  setTimeout("removeelement(" + Div.id + ")", 15000);
}



function removeelement(div) {
  document.getElementById(div).remove();
}

function firework(image){}


// Firework Animation
function firework_animation(element) {
  // Travel to explosion point
  gsap.to(element, 3, { x: Randomizer(200, innerWidth-200), y: Randomizer(200, innerHeight-200), ease: Sine.easeOut });
  // Explode in random direction
  gsap.to(element, 1, { x: Randomizer(), ease: Sine.easeOut });


}

// Explosion Animation
function explosion_animation(element) {
  //Fire off in a random direction
  var angle = Math.random()*Math.PI*2;
  animatex = Math.cos(angle)*innerWidth*1.5;
  animatey = Math.sin(angle)*innerHeight*1.5;

  gsap.to(element, Randomizer(5, 10), { x: animatex, y: animatey, ease: Sine.easeOut });
}

// Rising animation
function rising_animation(element) {
  //Fade In
  TweenMax.to(element, 3, { opacity: 1, width: "75px", height: "75px", ease: Linear.easeNone, repeat: 0, delay: -1 });
  //Vertical Movement
  TweenMax.to(element, Randomizer(10, 20), { y: -100, x: function() {
    return Randomizer(-250, 250) + gsap.getProperty(element, "x");
  }, ease: Linear.easeNone, repeat: 0, delay: -1 });
  //Fade Out
  TweenMax.to(element, 4, { opacity: 0, ease: Linear.easeNone, repeat: 0, delay: Randomizer(9, 11) });
}

// Falling animation
function falling_animation(element) {
  //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
  //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
  //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});

  TweenMax.to(element, Randomizer(6, 16), { y: innerHeight + 1400, ease: Linear.easeNone, repeat: 0, delay: -1 });
  TweenMax.to(element, Randomizer(4, 8), { x: '+=100', rotationZ: Randomizer(0, 180), repeat: 4, yoyo: true, ease: Sine.easeInOut });
  TweenMax.to(element, Randomizer(2, 8), { rotationX: Randomizer(0, 360), rotationY: Randomizer(0, 360), repeat: 8, yoyo: true, ease: Sine.easeInOut, delay: -5 });

}

function lurking_animation_left(element) {
  //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
  //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
  //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});

  TweenMax.to(element, 1, { rotationZ:'+=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
  TweenMax.to(element, 1, { x:'+=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
  TweenMax.to(element, 1, { rotationZ:'-=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
  TweenMax.to(element, 1, { x:'-=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function lurking_animation_right(element) {
  //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
  //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
  //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});

  TweenMax.to(element, 1, { rotationZ:'-=40', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
  TweenMax.to(element, 1, { x:'-=200', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
  TweenMax.to(element, 1, { rotationZ:'+=40' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
  TweenMax.to(element, 1, { x:'+=200' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function lurking_animation_top(element) {
  //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
  //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
  //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});

  TweenMax.to(element, 1, { y:'+=250', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
  TweenMax.to(element, 1, { y:'-=250' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });
}

function lurking_animation_bottom(element) {
  //TweenMax.to(e, Randomizer(6, 16), {y:innerHeight+100, ease:Linear.easeNone, repeat:-1, delay:-15});
  //TweenMax.to(e, Randomizer(4, 8), {x:'+=100',rotationZ:Randomizer(0, 180), repeat:-1, yoyo:true, ease:Sine.easeInOut});
  //TweenMax.to(e,Randomizer(2, 8), {rotationX:Randomizer(0,360),rotationY:Randomizer(0,360),repeat:-1,yoyo:true,ease:Sine.easeInOut,delay:-5});

  TweenMax.to(element, 1, { y:'-=250', yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 0 });
  TweenMax.to(element, 1, { y:'+=250' , yoyo:true,repeat: 0,  ease: Sine.easeInOut, delay: 1.5 });


}

// Randomizer
function Randomizer(min, max) { return min + Math.random() * (max - min); }

function TopOrBottom() {
  var topOrBottom = Math.random();
  if (topOrBottom < 0.5) {
    return -200;
  } else {
    return innerHeight + 200;
  }
}

// Check if string ends with number
function endsWithNumber(str) {
  return /[0-9]+$/.test(str);
}
// Get number at end of string
function getNumberAtEnd(str) {
  if (endsWithNumber(str)) {
    return Number(str.match(/[0-9]+$/)[0]);
  }

  return null;
}

function createVisualLurk(image) {
  var warp = document.getElementById("confetti-container"),
    innerWidth = window.innerWidth,
    innerHeight = window.innerHeight;

  // Load into page
  
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
}



connectws();