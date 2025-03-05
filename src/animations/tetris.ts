import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';
import { tetrominos } from '../lib/emotetetris.js';

interface Position {
  x: number;
  y: number;
}

export function emoteTetris(images: string[], count: number = 50, interval: number = 40): void {
  // Use at most 7 emotes for the 7 tetromino types
  const emoteCount = Math.min(images.length, 7);
  
  // Only create the number of tetrominos requested or max 50
  const tetrominoCount = Math.min(count, 50); 
  
  // Create tetris pieces with staggered timing
  for (let i = 0; i < tetrominoCount; i++) {
    setTimeout(() => {
      const randomTetrominoIndex = Math.floor(Math.random() * 7); // 0-6 for the 7 tetromino types
      const emoteIndex = randomTetrominoIndex % emoteCount;
      
      createTetromino(
        images[emoteIndex], 
        randomTetrominoIndex,
        Math.random() * (innerWidth - 150)  // Random starting X position
      );
    }, i * interval);
  }
}

function createTetromino(image: string, tetrominoType: number, startX: number): void {
  // Get the shape from our tetrominos array in emotetetris.js
  const shape = tetrominos[tetrominoType].shape;
  
  // Create a wrapper div to hold all blocks
  const wrapper = document.createElement('div');
  wrapper.className = 'tetromino-wrapper';
  wrapper.id = "tetromino-" + globalVars.divnumber;
  globalVars.divnumber++;
  
  // @ts-ignore - GSAP is included via CDN
  gsap.set(wrapper, {
    position: 'absolute',
    x: startX,
    y: -100, // Start above the screen
    transformOrigin: '50% 50%'
  });
  
  globalConst.warp.appendChild(wrapper);
  
  // Default block size
  const blockSize = 40;
  const padding = 2; // Space between blocks
  
  // Create the tetromino using the shape array
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const block = document.createElement('div');
        block.className = 'tetromino-block';
        
        // @ts-ignore - GSAP is included via CDN
        gsap.set(block, {
          position: 'absolute',
          width: blockSize,
          height: blockSize,
          x: x * (blockSize + padding),
          y: y * (blockSize + padding),
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '5px'
        });
        
        wrapper.appendChild(block);
      }
    }
  }
  
  // Animate the tetromino falling
  animateTetromino(wrapper);
  
  // Remove after animation
  setTimeout(() => {
    helpers.removeelement(wrapper.id);
  }, 20000);
}

function animateTetromino(element: HTMLElement): void {
  // Calculate random landing position
  const landingY = innerHeight - element.offsetHeight - 20 - (Math.random() * 400);
  
  // Falling animation
  // @ts-ignore - GSAP is included via CDN
  gsap.to(element, {
    y: landingY,
    duration: 4 + Math.random() * 4,
    ease: "power1.in",
    onComplete: () => {
      landTetromino(element);
    }
  });
  
  // Add some gentle rotation as it falls
  // @ts-ignore - GSAP is included via CDN
  gsap.to(element, {
    rotation: -15 + Math.random() * 30,
    duration: 2,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });
}

function landTetromino(element: HTMLElement): void {
  // Small bounce effect when landing
  // @ts-ignore - GSAP is included via CDN
  gsap.fromTo(element, 
    {y: element.getBoundingClientRect().top},
    {
      y: "+=10",
      duration: 0.2,
      ease: "bounce.out",
      onComplete: () => {
        // Fade out after landing and staying a bit
        // @ts-ignore - GSAP is included via CDN
        gsap.to(element, {
          opacity: 0,
          duration: 1,
          delay: 3 + Math.random() * 2
        });
      }
    }
  );
  
  // Stop the rotation
  // @ts-ignore - GSAP is included via CDN
  gsap.killTweensOf(element, "rotation");
}