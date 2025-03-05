import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';

export function emoteDVD(images: string[], count: number = 8, interval: number = 50): void {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteDVD(images[imagenum]);
        }, j * interval);
    }
}

function createEmoteDVD(image: string): void {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber.toString();
    globalVars.divnumber++;

    // @ts-ignore - GSAP is included via CDN
    gsap.set(Div, { className: 'dvd-element', x: helpers.Randomizer(0, innerWidth), y: helpers.Randomizer(0, innerHeight), z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    dvd_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 25000);
}

// DVD Bounce animation
function dvd_animation(element: HTMLElement): void {
    // X and Y speeds
    const xSpeed = helpers.Randomizer(1, 5) * helpers.randomSign();
    const ySpeed = helpers.Randomizer(1, 5) * helpers.randomSign();
    
    // Initial position
    let posX = parseFloat(element.style.left || "0");
    let posY = parseFloat(element.style.top || "0");
    
    // Width and height of element
    const elemWidth = 75; // width of your element
    const elemHeight = 75; // height of your element
    
    // Create an update function
    function updatePosition(): void {
        // @ts-ignore - GSAP is included via CDN
        posX = gsap.getProperty(element, "x");
        // @ts-ignore - GSAP is included via CDN
        posY = gsap.getProperty(element, "y");
        
        // Calculate new position
        posX += xSpeed;
        posY += ySpeed;
        
        // Check for collisions with viewport boundaries
        if (posX <= 0 || posX + elemWidth >= innerWidth) {
            // Choose a random color on bounce
            const newColor = getRandomColor();
            // @ts-ignore - GSAP is included via CDN
            gsap.to(element, {backgroundColor: newColor, duration: 0.5});
            
            // Reverse X direction
            if (posX <= 0) {
                posX = 0;
            } else {
                posX = innerWidth - elemWidth;
            }
        }
        
        if (posY <= 0 || posY + elemHeight >= innerHeight) {
            // Choose a random color on bounce
            const newColor = getRandomColor();
            // @ts-ignore - GSAP is included via CDN
            gsap.to(element, {backgroundColor: newColor, duration: 0.5});
            
            // Reverse Y direction
            if (posY <= 0) {
                posY = 0;
            } else {
                posY = innerHeight - elemHeight;
            }
        }
        
        // @ts-ignore - GSAP is included via CDN
        gsap.set(element, {x: posX, y: posY});
        requestAnimationFrame(updatePosition);
    }
    
    // Start the animation
    updatePosition();
}

// Helper function to generate random color
function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}