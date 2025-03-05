import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';

export function createCoins(count: number = 1, result: string = "Heads"): void {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createCoinFlip(result);
    }, i * 150);
  }
}

interface CoinElement {
  el: HTMLElement;
  heads: HTMLImageElement;
  edge: HTMLImageElement;
  line: HTMLImageElement;
  tails: HTMLImageElement;
  angle: number;
  rotateY: number;
  rotateX: number;
  finalState: string;
}

function createCoinFlip(result: string): void {
  // Create wrapper element
  const wrapper = document.createElement("div");
  wrapper.className = "coin";
  wrapper.id = globalVars.divnumber.toString();
  globalVars.divnumber++;
  
  // Position in the center of screen
  // @ts-ignore - GSAP is included via CDN
  gsap.set(wrapper, {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 10
  });
  
  // Add to DOM
  document.body.appendChild(wrapper);
  
  // Create coin elements
  const heads = document.querySelector(".coinHeads")?.cloneNode(true) as HTMLImageElement;
  const edge = document.querySelector(".coinEdge")?.cloneNode(true) as HTMLImageElement;
  const line = document.querySelector(".coinLine")?.cloneNode(true) as HTMLImageElement;
  const tails = document.querySelector(".coinTails")?.cloneNode(true) as HTMLImageElement;
  
  if (!heads || !edge || !line || !tails) {
    console.error("Coin elements not found!");
    return;
  }
  
  // Append all elements to wrapper
  wrapper.appendChild(heads);
  wrapper.appendChild(edge);
  wrapper.appendChild(line);
  wrapper.appendChild(tails);
  
  // Create coin object
  const coin: CoinElement = {
    el: wrapper,
    heads: heads,
    edge: edge,
    line: line,
    tails: tails,
    angle: 0,
    rotateY: 0,
    rotateX: 0,
    finalState: result
  };
  
  // Set initial state
  updateCoinState(coin);
  
  // Start animation
  flipCoin(coin);
  
  // Remove after animation
  setTimeout(() => {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }, 5000);
}

function updateCoinState(coin: CoinElement): void {
  const angle = coin.angle;
  
  // Calculate visibility based on angle
  const headsVisible = Math.abs(((angle + 180) % 360) - 180) < 90;
  const tailsVisible = Math.abs((angle % 360) - 180) < 90;
  
  // Set visibility
  coin.heads.style.visibility = headsVisible ? "visible" : "hidden";
  coin.tails.style.visibility = tailsVisible ? "visible" : "hidden";
  
  // Calculate edge visibility
  const isEdgeVisible = Math.abs(((angle + 90) % 180) - 90) < 15;
  
  // Set edge visibility
  coin.edge.style.visibility = isEdgeVisible ? "visible" : "hidden";
  coin.line.style.visibility = isEdgeVisible ? "visible" : "hidden";
  
  // Apply rotation
  // @ts-ignore - GSAP is included via CDN
  gsap.set(coin.el, {
    rotationY: coin.rotateY,
    rotationX: coin.rotateX
  });
}

function flipCoin(coin: CoinElement): void {
  // Random number of flips (5-10)
  const flips = Math.floor(Math.random() * 5) + 5;
  const flipDuration = 0.2; // seconds per flip
  
  // Final rotation based on result
  const finalRotation = coin.finalState === "Heads" ? 0 : 180;
  
  // Create timeline for flipping animation
  // @ts-ignore - GSAP is included via CDN
  const timeline = gsap.timeline({
    onUpdate: function() {
      updateCoinState(coin);
    },
    onComplete: function() {
      // Final state
      coin.angle = finalRotation;
      updateCoinState(coin);
    }
  });
  
  // Initial toss
  timeline.to(coin, {
    rotateX: 720,
    duration: 1,
    ease: "power1.out"
  }, 0);
  
  // Add flips
  for (let i = 0; i < flips; i++) {
    timeline.to(coin, {
      rotateY: "+=180",
      angle: "+=" + 180,
      duration: flipDuration,
      ease: i === flips - 1 ? "power1.inOut" : "linear"
    }, 1 + (i * flipDuration));
  }
  
  // Final landing
  timeline.to(coin, {
    rotateY: Math.floor(coin.rotateY / 180) * 180 + finalRotation,
    angle: finalRotation,
    duration: 0.5,
    ease: "bounce.out"
  }, 1 + (flips * flipDuration));
}