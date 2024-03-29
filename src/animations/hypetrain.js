import Variables from '../config.js';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.js';



//Add user avatar to current train car
export function hypetrainprogression(userId){

    var xhttp = new XMLHttpRequest();
    console.log("created xmlhttp object");
    xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        // get display image for the userId
        console.log("got a user image response back");
        // console.log(xhttp.responseText);
        
        let image = [xhttp.responseText];
        createhypetrainprogression(image);

        }
    };

    xhttp.open("GET", "https://decapi.me/twitch/avatar/" + userId + "?id=true", true);
    xhttp.send();
}

function createhypetrainprogression(image){

    let HypeWrapper = document.getElementsByClassName('train-wrapper');
    let carts = document.getElementsByClassName('train-cart');
    let cartsArray = Array.from(carts);
    let currentCart = cartsArray[cartsArray.length - 1];

    let UserImage = document.createElement('img');

    //image = "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_2758558107d148c9b1e73c56cb2d9e06/default/dark/2.0";

    gsap.set(UserImage, { className: 'cart-image', z: 10, zIndex: 10, position: "absolute", left: "20px;", top: "70px", attr: { src: image } });

    currentCart.appendChild(UserImage);
    passenger_animation(UserImage)

}

//Fade and Clear the Hype Train
export function hypetrainfinish(){

    //console.log(HypeTrainWrapper.id);
    let HypeWrapper = document.getElementsByClassName('train-wrapper')[0];

    clearTimeout(HypeWrapper.id);

    fade(HypeWrapper, 0, 4.5);

    setTimeout(() => {
        helpers.removeelement(HypeWrapper.id);
    }, 5000);

}

export function hypetrainstart(){

    let image = "../assets/img/trainhead.png";
    let HypeTrainWrapper = document.createElement('div');
    HypeTrainWrapper.id = setTimeout(() => {
        helpers.removeelement(HypeTrainWrapper.id);
    }, 360000);

    let HypeTrainHead = document.createElement('div');

    gsap.set(HypeTrainWrapper, { className: 'train-wrapper', x: 0 - innerWidth, y: 0, z: helpers.Randomizer(-200, 200), opacity: 0 });
    gsap.set(HypeTrainHead, { className: 'train-head', float: "right", z: helpers.Randomizer(-200, 200), width: "225px", height: "225px", backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(HypeTrainWrapper);
    HypeTrainWrapper.appendChild(HypeTrainHead); 

    
    // console.log("Timeout:");
    // console.log(hypetimer);

    fade(HypeTrainWrapper, 1, 3);
    train_animation(HypeTrainWrapper);
    hypetrainlevelup();

    let delayTime = 1000;
    if(globalVars.hypetrainCache){
        globalVars.hypetrainCache.forEach(async (userId) => {
            delay(delayTime).then(() => hypetrainprogression(userId));
            delayTime = delayTime + 3000;
        });
    }
}

//Add additional Car to Train
export function hypetrainlevelup(){

    //reset the timeout on LevelUp
    let trainWrapper = document.getElementsByClassName('train-wrapper')[0];

    console.log(trainWrapper.id);

    //Level up resets 5 minute timer
    clearTimeout(trainWrapper.id);
    trainWrapper.id = setTimeout(() => {
        helpers.removeelement(trainWrapper.id);
    }, 365000);

    let cartNum = Math.round(helpers.Randomizer(1,2));
    let image;
    if(cartNum == 1){
        image = "../assets/img/cart1.png";
    }
    if(cartNum == 2){
        image = "../assets/img/cart2.png";
    }
    else {
        image = "../assets/img/cart1.png";
    }

    let HypeCart = document.createElement('div');
    gsap.set(HypeCart, { className: 'train-cart', float: "right", z: helpers.Randomizer(-200, 200), width: "225px", height: "225px", opacity: 0 });


    let CartImage = document.createElement('img');
    gsap.set(CartImage, { className: 'cart-image', z: 100, zIndex: 100, position: "relative", width: "225px", height: "225px", attr: { src: image }  });

    trainWrapper.appendChild(HypeCart);
    HypeCart.appendChild(CartImage);
    fade(HypeCart, 1, 3);

}


function fade(element, opacity, duration){
    gsap.to(element, {opacity: opacity, duration: duration});
}

function train_animation(element){
    gsap.timeline({ repeat: -1, defaults: { duration: 3, ease: "none" } })
    .to(element, { x: innerWidth, duration: 10 })
    .to(element, { y: -500, duration: 0.5 })
    .to(element, { x: 0 - innerWidth, duration: 0.5 })
    .to(element, { y: 0, duration: 0.5 });
}

function passenger_animation(element) {
    gsap.timeline({ repeat: -1, defaults: { duration: 3, ease: "none" } })
    .to(element, { x: "+=120" })
    .to(element, { x: "-=120" });
    gsap.to(element, {duration: 1, repeat: -1, y: "-=20", ease: "sine.out", yoyo: true });
}