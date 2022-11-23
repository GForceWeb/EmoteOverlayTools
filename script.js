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
  



    ws.onmessage = function (event) {
      // grab message and parse JSON
      const msg = event.data;
      const wsdata = JSON.parse(msg);

      console.log(wsdata);


      //check for lurk command
      if(lurk || all){
        if (typeof wsdata.event != "undefined") {
          if (typeof wsdata.event.type != "undefined") {
            if(wsdata.data.message.message) {
              var lowermessage = wsdata.data.message.message.toLowerCase();
              if (lowermessage.includes("!lurk")) {
                var username = wsdata.data.message.username;
                console.log("starting xmlhttp");
                var xhttp = new XMLHttpRequest();
                console.log("created xmlhttp object");
                xhttp.onreadystatechange = function () {
                  if (this.readyState == 4 && this.status == 200) {
                    // get display image for the user
                    console.log("got a users image back");
                    //save this to cache between sessions too.
                    var no_of_elements = 50;

                    VisualLurk(xhttp.responseText, 3);
                  }
                };
                console.log(username);
                xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
                xhttp.send();
              }
            }
          }
        }
      }
    

      // check for events to trigger

      // check for first words
      if(welcome || all){
        if (typeof wsdata.event != "undefined") {
          if (typeof wsdata.event.type != "undefined") {
            if (wsdata.event.type == "FirstWord") {


              var username = wsdata.data.user.name;
              console.log("starting xmlhttp");
              var xhttp = new XMLHttpRequest();
              console.log("created xmlhttp object");
              xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                  // get display image for the user
                  console.log("got a user image response back");
                  
                  avatar = [xhttp.responseText];
                  emoteRain(avatar, defaultemotes, 50);

                }
              };
              console.log(username);
              xhttp.open("GET", "https://decapi.me/twitch/avatar/" + username, true);
              xhttp.send();

            }
          }
        }
      }

      //shoutout
      if(welcome || all){
        if (typeof wsdata.event != "undefined") {
          if (typeof wsdata.event.type != "undefined") {
            if(wsdata.data.message.message) {
              var lowermessage = wsdata.data.message.message.toLowerCase();
              if (lowermessage.includes("!so")) {
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
            }
          }
        }
      }

      //if emotes exist in message check for command conditions and if not found, do standard rain
      if(emoterain || kappagen || all){
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
                var eInterval = getCommandValue(lowermessage, "interval");
                var eCount = getCommandValue(lowermessage, "count");

                console.log(eCount);
                console.log(eInterval);
                if(eCount != null) {
                  if(eCount > maxemotes){
                    eCount = maxemotes;           
                  }
                }

                console.log(sub);
                console.log(wsdata.data.message);

                //TestCommand: 
                //emoteVolcano(['https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2758558107d148c9b1e73c56cb2d9e06/default/dark/2.0', 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcaf0a56231d4443a91546b869b96a25/default/dark/2.0'], 100, 20);


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
                ];

                //Specific Animation Commands
                if (emoterain || all){
                  if (subonly & sub || subonly === null) {
                    animations.forEach(function (animation) {
                      if (lowermessage.includes(animation[0])) {
                        if(!eCount){eCount = animation[2];}
                        if(!eInterval){eInterval = animation[3]}


                        if(animation[1] == "emoteText") {
                          let regexp = /text (\S*)/gm;  
                          let matches = regexp.exec(wsdata.data.message.message);
                          eCount = matches[1];
                          //console.log("Text is " + eCount);


                          if(wsdata.data.message.emotes.length < 1 && Botchat){
                            let message = "Invalid Syntax, please try using '!er text <WordToWrite> <Emotes to use>'"
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


                          //get all emotenamess to compare 
                          let emotenames = "";
                          for(const emote of wsdata.data.message.emotes) {
                            emotenames = emotenames + emote["name"] + " ";
                          }

                          //Set Default Text
                          if(emotenames.includes(eCount)){
                            eCount = "Hype";
                          }
                        }

                        window[animation[1]](images, eCount, eInterval);
                        console.log("running " + animation[1] + " with " + eCount + " emote(s)" + " and interval " + eInterval);
                      }
                    });
                  }
                }

                //Kappagen Animations
                if (kappagen || all){
                  if (subonly & sub || subonly === null) {
                    if(lowermessage.includes("!k ")) {
                      rAnimation = Math.round(Randomizer(0,animations.length));
                      if(!eCount){eCount = animations[rAnimation][2];}
                      if(!eInterval){eInterval = animations[rAnimation][3];}

                      window[animations[rAnimation][1]](images, eCount, eInterval);
                      console.log("running " + animations[rAnimation][1] + " with " + eCount + " emote(s)" + " and interval " + eInterval);
                    }
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
            }
          }
        }
      }
    }
  }
}


function emoteText (images, text='hype', interval=25){
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
}

function createEmoteText(image, length, character, x, y) {
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
}

function text_animation(element, pixelX, pixelY) {
  

  gsap.to(element, {duration: 2, opacity: 1, delay: 0});
  gsap.to(element, {duration: Randomizer(3, 5), x: pixelX, y: pixelY, delay: 0});
  gsap.to(element, {duration: 2, opacity: 0, delay: 13});

  gsap.to(element, {duration: 0.7, rotation: 30, repeat: -1, repeatDelay: 3});
  gsap.to(element, {duration: 2.3, rotation: 0, ease:Elastic.easeOut.config(0.9,0.1), delay: 0.7, repeat: -1, repeatDelay: 3});

  //gsap.to(element, {duration: 0.5, x: ""});

}



function emoteDVD (images, count=1, interval=50) {
  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the different emote images
    imagenum = j % imgcount;
    var createcommand = 'createEmoteDVD("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function createEmoteDVD(image) {
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
}

function dvd_animation(element) {
  var DVDStartX = gsap.getProperty(element, "x");
  var DVDStartY = gsap.getProperty(element, "y");
  var DVDStartDirection = Randomizer(0,360);
  var DVDFirstX = Randomizer(0, innerWidth);
  var DVDFirstY = Randomizer(0, innerWidth);

  var DVDFirstX = Math.sin(DVDStartDirection) * 2000;
  var DVDFirstY = Math.cos(DVDStartDirection) * 2000;

  console.log(DVDFirstX);
  console.log(DVDFirstY);

  //TopBox Intersection
  intersection = intersect(0, 0, innerWidth, 0, DVDStartX, DVDStartY, DVDFirstX, DVDFirstY);
  if(intersection){
    console.log(intersection);
    var DVDSecondX = intersection.x;
    var DVDSecondY = intersection.y;
  }
  //LeftBox Intersection
  intersection = intersect(0, 0, 0, innerHeight, DVDStartX, DVDStartY, DVDFirstX, DVDFirstY);
  if(intersection){
    console.log(intersection);
    var DVDSecondX = intersection.x;
    var DVDSecondY = intersection.y;
  }
  //BottomBox Intersection
  intersection = intersect(0, innerHeight, innerWidth, innerHeight, DVDStartX, DVDStartY, DVDFirstX, DVDFirstY);
  if(intersection){
    console.log(intersection);
    var DVDSecondX = intersection.x;
    var DVDSecondY = intersection.y;
  }
  //RightBox Intersection
  intersection = intersect(innerWidth, 0, innerWidth, innerHeight, DVDStartX, DVDStartY, DVDFirstX, DVDFirstY);
  if(intersection){
    console.log(intersection);
    var DVDSecondX = intersection.x;
    var DVDSecondY = intersection.y;
  }

  //console.log(intersection);

  gsap.to(element, {duration: 3, x: DVDSecondX, y: DVDSecondY});

}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false
  }

  denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1)
  let y = y1 + ua * (y2 - y1)

  return {x, y}
}

function emoteComets(images, count=170, interval=50) {
  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the different emote images
    imagenum = j % imgcount;
    var createcommand = 'createEmoteComets("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function createEmoteComets(image) {
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
}

function comet_animation(element) {
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
}


function emoteBounce(images, count=100, interval=20) {
  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the different emote images
    imagenum = j % imgcount;
    var createcommand = 'createEmoteBounce("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function createEmoteBounce(image){
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
}

function bounce_animation(element) {

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
}

function emoteSpiral(images, count=100, interval=75) {
  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the different emote images
    imagenum = j % imgcount;
    var createcommand = 'createSpiral("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function createSpiral(image){
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
}

function spiral_animation(element) {
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

}

function emoteRightWave(images, count=100, interval=20) {
  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the different emote images
    imagenum = j % imgcount;
    var createcommand = 'createRightWave("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function emoteLeftWave(images, count=100, interval=20) {
  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the different emote images
    imagenum = j % imgcount;
    var createcommand = 'createLeftWave("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function createRightWave(image){
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
}

function createLeftWave(image){
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
}

function rightwave_animation(element) {
  //Travel left to right
  gsap.to(element, { x: innerWidth + 100, duration: Randomizer(6, 11), ease: Sine.easeInOut});
  //sway up and down a bit
  gsap.to(element, { y: function() {
    return Randomizer(-350, 350) + gsap.getProperty(element, "y");
  }, duration: Randomizer(1, 2), ease: Sine.easeInOut, yoyo: true, repeat: -1});

}

function leftwave_animation(element) {
  //Travel right to left
  gsap.to(element, { x: -100, duration: Randomizer(6, 11), ease: Sine.easeInOut});
  //sway up and down a bit
  gsap.to(element, { y: function() {
    return Randomizer(-350, 350) + gsap.getProperty(element, "y");
  }, duration: Randomizer(1, 2), ease: Sine.easeInOut, yoyo: true, repeat: -1});

}

function emotecarousel(images, count=100, interval=120) {
  imgcount = images.length;

  for (j = 0; j < count; j++) {
    // split the count amounst the different emote images
    imagenum = j % imgcount;
    var createcommand = 'createCarousel("' + images[imagenum] + '")';
    setTimeout(createcommand, (j * interval));
  }
}

function createCarousel(image){
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
}

function carousel_animation(element) {
  gsap.to(element, { x: innerWidth + 100, duration: 5, ease: Sine.easeInOut});
  gsap.to(element, { y: "+=200", duration: 2.5, ease: Sine.easeInOut, repeat: 1, yoyo: true});
  
  gsap.to(element, { x: -100, duration: 5, ease: Sine.easeInOut, delay: 5});
  gsap.to(element, { y: "-=200", duration: 2.5, ease: Sine.easeInOut, repeat: 1, yoyo: true, delay: 5});
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
    ease: "power2.out",
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
function countvalues(str){
  return str.match(/\s[0-9]+/g);
}

// }
// function has1number(str) {
//   return /\s[0-9]+$/.test(str);
// }

// function has2numbers(str) {
//   return /\s[0-9]+\s[0-9]+$/.test(str);
// }
// Get number at end of string
function getCommandValue(str, type) {

  let values = countvalues(str);

  if (values === null) {
    return null;
  }
  
  if(type == 'count'){

    if(values.length == 2){
      return values[0].trim();
    }
    else if(values.length == 1){
      return values[0].trim();
    }
    else {
      return null;
    }
  }

  if(type == 'interval'){

    if(values.length == 2){
      return values[1].trim();
    }
    else {
      return null;
    }
  }
}




function VisualLurk(image, iterations=3, interval=5000) {
  for (j = 0; j < iterations; j++) {
    delay = j * interval; // Delay between each iteration in ms

    var createcommand = 'createVisualLurk("' + image + '")';
    setTimeout(createcommand, (delay));

  }
}


function createVisualLurk(image) {
  
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