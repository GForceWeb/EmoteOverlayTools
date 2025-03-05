import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';

export function emoteCyclone(images: string[], count: number = 100, interval: number = 30): void {
    let imgcount = images.length;

    for (let j = 0; j < count; j++) {
        // split the count amounst the images
        let imagenum = j % imgcount;
        setTimeout(() => {
            createEmoteCyclone(images[imagenum]);
        }, j * interval);
    }
}

function createEmoteCyclone(image: string): void {
    var Div = document.createElement('div');
    Div.id = globalVars.divnumber.toString();
    globalVars.divnumber++;

    // @ts-ignore - GSAP is included via CDN
    gsap.set(Div, { className: 'cyclone-element', x: innerWidth/2, y: innerHeight, z: helpers.Randomizer(-200, 200), backgroundImage: 'url(' + image + ')' });

    globalConst.warp.appendChild(Div);

    // Run animation
    cyclone_animation(Div);
    //Destroy element after X seconds so we don't eat up resources over time!
    setTimeout(() => {
        helpers.removeelement(Div.id);
    }, 15000);
}

// Explosion Animation
function cyclone_animation(element: HTMLElement): void {
    let centerX = innerWidth / 2;
    let startY = innerHeight;
    
    // Get random starting position on the circle
    let startAngle = helpers.Randomizer(0, 360);
    let angleRad = (startAngle * Math.PI) / 180;
    
    // Initial radius is 8% of screen width
    const initialRadius = innerWidth * 0.08;
    
    // Set initial position
    // @ts-ignore - GSAP is included via CDN
    gsap.set(element, {
        x: centerX + Math.cos(angleRad) * initialRadius,
        y: startY,
        rotation: startAngle
    });

    // Create a timeline for smoother animation
    // @ts-ignore - GSAP is included via CDN
    let tl = gsap.timeline();
    
    // Calculate single segment duration and overlap
    const segmentDuration = 0.8;
    const overlap = 0.4;
    // Total duration = (segmentDuration - overlap) * (number of segments - 1) + segmentDuration
    const totalDuration = (segmentDuration - overlap) * 7 + segmentDuration; // About 2.8 seconds

    // Add each segment to the timeline with position parameter for overlap
    tl.to(element, {
        x: centerX + Math.cos(angleRad + Math.PI/4) * (innerWidth * 0.10),
        y: startY - (innerHeight * 0.1),
        rotation: startAngle + 90,
        scale: 1.05,
        duration: segmentDuration,
        ease: "none"
    })
    .to(element, {
        x: centerX + Math.cos(angleRad + Math.PI/2) * (innerWidth * 0.14),
        y: startY - (innerHeight * 0.25),
        rotation: startAngle + 180,
        scale: 1.1,
        duration: segmentDuration,
        ease: "none"
    }, "-=0.4")  // Start 0.4s before previous tween ends
    .to(element, {
        x: centerX + Math.cos(angleRad + Math.PI*3/4) * (innerWidth * 0.18),
        y: startY - (innerHeight * 0.4),
        rotation: startAngle + 270,
        scale: 1.15,
        duration: segmentDuration,
        ease: "none"
    }, "-=0.4")
    .to(element, {
        x: centerX + Math.cos(angleRad + Math.PI) * (innerWidth * 0.22),
        y: startY - (innerHeight * 0.5),
        rotation: startAngle + 360,
        scale: 1.2,
        duration: segmentDuration,
        ease: "none"
    }, "-=0.4")
    .to(element, {
        x: centerX + Math.cos(angleRad + Math.PI*5/4) * (innerWidth * 0.24),
        y: startY - (innerHeight * 0.6),
        rotation: startAngle + 450,
        scale: 1.25,
        duration: segmentDuration,
        ease: "none"
    }, "-=0.4")
    .to(element, {
        x: centerX + Math.cos(angleRad + Math.PI*3/2) * (innerWidth * 0.26),
        y: startY - (innerHeight * 0.7),
        rotation: startAngle + 540,
        scale: 1.3,
        duration: segmentDuration,
        ease: "none"
    }, "-=0.4")
    .to(element, {
        x: centerX + Math.cos(angleRad + Math.PI*7/4) * (innerWidth * 0.28),
        y: startY - (innerHeight * 0.75),
        rotation: startAngle + 630,
        scale: 1.35,
        duration: segmentDuration,
        ease: "none"
    }, "-=0.4")
    .to(element, {
        x: centerX + Math.cos(angleRad + Math.PI*2) * (innerWidth * 0.3),
        y: startY - (innerHeight * 0.8),
        rotation: startAngle + 720,
        scale: 1.4,
        duration: segmentDuration,
        ease: "none"
    }, "-=0.4");

    // Add fade out that starts before motion completes
    // @ts-ignore - GSAP is included via CDN
    gsap.to(element, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.in",
        delay: totalDuration - 1 // Start fading 1 second before motion completes
    });
}