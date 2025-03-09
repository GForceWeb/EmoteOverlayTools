import { globalVars } from "../config.ts";
import helpers from "../helpers";
import { gsap } from "gsap";

// Add user avatar to current train car
export function hypetrainprogression(userId: string): void {
  const xhttp = new XMLHttpRequest();
  console.log("created xmlhttp object");
  xhttp.onreadystatechange = function (): void {
    if (this.readyState === 4 && this.status === 200) {
      // get display image for the userId
      console.log("got a user image response back");
      const image = [xhttp.responseText];
      createhypetrainprogression(image);
    }
  };

  xhttp.open("GET", `https://decapi.me/twitch/avatar/${userId}?id=true`, true);
  xhttp.send();
}

function createhypetrainprogression(image: string[]): void {
  const HypeWrapper = document.getElementsByClassName("train-wrapper");
  const carts = document.getElementsByClassName("train-cart");
  const cartsArray = Array.from(carts);
  const currentCart = cartsArray[cartsArray.length - 1];

  const UserImage = document.createElement("img");

  gsap.set(UserImage, {
    className: "cart-image",
    z: 10,
    zIndex: 10,
    position: "absolute",
    left: "20px",
    top: "70px",
    attr: { src: image[0] },
  });

  currentCart.appendChild(UserImage);
  passenger_animation(UserImage);
}

// Fade and Clear the Hype Train
export function hypetrainfinish(): void {
  const HypeWrapper = document.getElementsByClassName(
    "train-wrapper"
  )[0] as HTMLElement;

  clearTimeout(Number(HypeWrapper.id));

  fade(HypeWrapper, 0, 4.5);

  setTimeout(() => {
    helpers.removeelement(HypeWrapper.id);
  }, 5000);
}

export function hypetrainstart(): void {
  const image = "img/trainhead.png";
  const HypeTrainWrapper = document.createElement("div");
  HypeTrainWrapper.id = String(
    setTimeout(() => {
      helpers.removeelement(HypeTrainWrapper.id);
    }, 360000)
  );

  const HypeTrainHead = document.createElement("div");

  gsap.set(HypeTrainWrapper, {
    className: "train-wrapper",
    x: 0 - window.innerWidth,
    y: 0,
    z: helpers.Randomizer(-200, 200),
    opacity: 0,
  });
  gsap.set(HypeTrainHead, {
    className: "train-head",
    float: "right",
    z: helpers.Randomizer(-200, 200),
    width: "225px",
    height: "225px",
    backgroundImage: `url(${image})`,
  });

  globalVars.warp.appendChild(HypeTrainWrapper);
  HypeTrainWrapper.appendChild(HypeTrainHead);

  fade(HypeTrainWrapper, 1, 3);
  train_animation(HypeTrainWrapper);
  hypetrainlevelup();

  let delayTime = 1000;
  if (globalVars.hypetrainCache) {
    globalVars.hypetrainCache.forEach((userId: string) => {
      delay(delayTime).then(() => hypetrainprogression(userId));
      delayTime = delayTime + 3000;
    });
  }
}

// Add additional Car to Train
export function hypetrainlevelup(): void {
  const trainWrapper = document.getElementsByClassName("train-wrapper")[0];

  console.log(trainWrapper.id);

  // Level up resets 5 minute timer
  clearTimeout(Number(trainWrapper.id));
  trainWrapper.id = String(
    setTimeout(() => {
      helpers.removeelement(trainWrapper.id);
    }, 365000)
  );

  const cartNum = Math.round(helpers.Randomizer(1, 2));
  let image: string;
  if (cartNum === 1) {
    image = "img/cart1.png";
  } else if (cartNum === 2) {
    image = "img/cart2.png";
  } else {
    image = "img/cart1.png";
  }

  const HypeCart = document.createElement("div");
  gsap.set(HypeCart, {
    className: "train-cart",
    float: "right",
    z: helpers.Randomizer(-200, 200),
    width: "225px",
    height: "225px",
    opacity: 0,
  });

  const CartImage = document.createElement("img");
  gsap.set(CartImage, {
    className: "cart-image",
    z: 100,
    zIndex: 100,
    position: "relative",
    width: "225px",
    height: "225px",
    attr: { src: image },
  });

  trainWrapper.appendChild(HypeCart);
  HypeCart.appendChild(CartImage);
  fade(HypeCart, 1, 3);
}

function fade(element: HTMLElement, opacity: number, duration: number): void {
  gsap.to(element, { opacity, duration });
}

function train_animation(element: HTMLElement): void {
  gsap
    .timeline({ repeat: -1, defaults: { duration: 3, ease: "none" } })
    .to(element, { x: window.innerWidth, duration: 10 })
    .to(element, { y: -500, duration: 0.5 })
    .to(element, { x: 0 - window.innerWidth, duration: 0.5 })
    .to(element, { y: 0, duration: 0.5 });
}

function passenger_animation(element: HTMLElement): void {
  gsap
    .timeline({ repeat: -1, defaults: { duration: 3, ease: "none" } })
    .to(element, { x: "+=120" })
    .to(element, { x: "-=120" });
  gsap.to(element, {
    duration: 1,
    repeat: -1,
    y: "-=20",
    ease: "sine.out",
    yoyo: true,
  });
}

// Helper function for delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
