import Variables from "../config.js";
const { globalVars, globalConst } = Variables;
import helpers from "../helpers.js";
import { gsap } from "gsap";

//TWITCH HAS DEPRECATED THE IDs of each raider so this code doesn't work anymore
//TODO: Replace with raid animation where raiding user is shown, with an army of default people icons, charging across the screen

export async function incomingRaid(userId, displayName, viewers) {
  console.log(userId);
  console.log(displayName);
  console.log(viewers);

  let avatar;

  try {
    avatar = await helpers.getTwitchAvatar(userId, true);
  } catch (error) {
    console.error(error);
    throw error;
  }

  console.log(avatar);

  //Setup the raid wrapper

  //Commented out for type error
  // let raidWrapper = document.createElement('div');
  // raidWrapper.id = setTimeout(() => {
  //     helpers.removeelement(raidWrapper.id);
  // }, 600000);
  // gsap.set(raidWrapper, { className: 'raid-wrapper', position: "absolute", height: innerHeight, width: innerWidth, x: 0, y: 0, z: helpers.Randomizer(-200, 200), });
  // globalConst.warp.appendChild(raidWrapper);

  // Calculate the number of rows and columns in the pyramid
  let numRows = Math.ceil(Math.sqrt(viewers));
  let numCols = numRows;

  // Calculate the width and height of each pyramid element
  let elementWidth = 50;
  let elementHeight = 50;
  let spacing = 10;

  // Calculate the total width of each row
  let rowWidth = numCols * (elementWidth + spacing) - spacing;

  //lead raider
  let raider = document.createElement("div");
  raider.className = "raider-element";
  raider.style.width = elementWidth * 2 + "px";
  raider.style.height = elementHeight * 2 + "px";

  // Position the raider
  let xPos = innerHeight / 2;
  let yPos = (numRows - 1) * (elementHeight + spacing);
  raider.style.top = xPos + "px";
  raider.style.left = yPos + "px";

  // Append the raider to the container
  gsap.set(raider, {
    className: "raider-leader",
    z: 10,
    zIndex: 10,
    position: "absolute",
    backgroundImage: "url(" + avatar + ")",
  });
  //raidWrapper.appendChild(raider);

  //raiderAnimation(raider);

  // Loop through the rows and columns to create and position each element
  for (let row = numRows - 1; row >= 0; row--) {
    let rowStartX =
      (rowWidth - (numCols * (elementWidth + spacing) - spacing)) / 2;

    for (let col = 0; col < numCols; col++) {
      let element = document.createElement("div");
      element.className = "raider-element";
      element.style.width = elementWidth + "px";
      element.style.height = elementHeight + "px";

      // Position the element
      let xPos = rowStartX + col * (elementWidth + spacing);
      let yPos = (numRows - 1 - row) * (elementHeight + spacing);
      element.style.top = xPos + "px";
      element.style.left = yPos + "px";

      // Append the element to the container
      gsap.set(element, {
        className: "raider-image",
        z: 10,
        zIndex: 10,
        position: "absolute",
        backgroundImage: "url(" + avatar + ")",
      });
      //raidWrapper.appendChild(element);

      //raiderAnimation(element);
      console.log("raider added");
    }
    numCols--;
  }

  // Use GSAP animations if needed
  //gsap.set(".pyramid-element", { opacity: 0, y: -50, stagger: 0.1 });

  return;
}

export function createRaider(image) {
  var Div = document.createElement("div");
  Div.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  Div.style.background = "url(" + image + ")";
  Div.style.backgroundSize = "100% 100%";

  TweenLite.set(Div, {
    className: "raider-element",
    x: helpers.Randomizer(-400, -100),
    y: helpers.Randomizer(0, innerHeight),
    z: 100,
  });

  globalConst.warp.appendChild(Div);

  raiderAnimation(Div);

  setTimeout(() => {
    helpers.removeelement(Div.id);
  }, 50000);
}

function raiderAnimation(element) {
  //gsap.to(element, {y: "+=100", duration: 1, yoyo: true, repeat: 25, ease: "sine.inOut"});

  gsap.to(element, { rotation: "-=20", duration: 0.25, ease: "sine.inOut" });
  gsap.to(element, {
    rotation: "+=40",
    delay: 0.25,
    duration: 0.5,
    yoyo: true,
    repeat: 50,
    ease: "sine.inOut",
  });
  gsap.to(element, {
    duration: 8,
    x: helpers.Randomizer(innerWidth + 100, innerWidth + 400),
    yoyo: true,
    repeat: 1,
    repeatDelay: 5,
  });

  let width = helpers.Randomizer(1, innerWidth); //0,1920
  let middle = innerWidth / 2; //980
  let height;

  if (width > middle) {
    let newwidth = width - 980;

    height = 300 - (newwidth / middle) * 200;
    console.log((newwidth / middle) * 200);
    console.log(height);
  } else {
    height = 100 + (width / middle) * 200;
    console.log((width / middle) * 200);
    console.log(height);
  }

  gsap.to(element, { duration: 0, x: width, y: innerHeight + 100, delay: 26 });
  gsap.to(element, { duration: 2, y: innerHeight - height, delay: 27 });
  gsap.to(element, { duration: 5, opacity: 0, delay: 29 });

  //var tl2 = gsap.timeline({ repeat: 2, defaults: { duration: flipTime, ease: "none" } })
  //tl2.to(element, {duration: 6, x: innerWidth + 200});
  //tl2.to(element, {duration: 6, x: -200, delay: 5});

  //tl2.resume();
}
