import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';
import { gsap } from 'gsap';

export function emoteInvaders(images: string[], count: number = 56, interval: number = 50): void {
    let imgcount = images.length;
    if(count > 256){
      count = 256;
    }
  
    const containerWidth = innerWidth - 800; // Replace with the actual width of the container element
    const containerHeight = innerHeight - 400; 
  
    const numRows = Math.ceil(Math.sqrt(count));
    const numCols = Math.ceil(count / numRows);
  
    console.log(numRows);
    console.log(numCols);
  
    const cellWidth = containerWidth / numCols;
    const cellHeight = containerHeight / numRows;
  
    for (let j = 0; j < count; j++) {
      // split the count amounst the different emote images
      let imagenum = j % imgcount;
  
      const row = Math.floor(j / numCols);
      const col = j % numCols;
      const x = col * cellWidth;
      const y = row * cellHeight;
  
      let Div = document.createElement('div');
      Div.id = globalVars.divnumber.toString();
      globalVars.divnumber++;
  
      console.log(x);
      console.log(y);
      console.log(cellWidth);
      console.log(cellHeight);
  
      gsap.set(Div, { x: x+50, y, width: cellWidth, height: cellHeight, className: 'invader-element', backgroundSize: cellHeight - 20, backgroundImage: 'url(' + images[imagenum] + ')' });
      globalConst.warp.appendChild(Div);
      //var createcommand = 'createemoteInvaders("' + images[imagenum] + '")';
      //setTimeout(createcommand, (j * interval));
      setTimeout(() => {
        helpers.removeelement(Div.id);
      }, 70000);
    }
  
    invaders_animation();
  }
  
function invaders_animation(): void {
    const invaders = document.querySelectorAll('.invader-element');
  
    // create a timeline for the animation
    const tl = gsap.timeline({ repeat: 50, repeatRefresh: true });
  
    // set the initial duration
    const initialDuration = 1;
  
    // add tweens to the timeline to create the space invaders movement
    tl.to(invaders, { x: '+=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { x: '+=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { x: '+=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { x: '+=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { y: '+=75', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { x: '-=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { x: '-=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { x: '-=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { x: '-=200', duration: initialDuration, onComplete: shortenDuration })
      .to(invaders, { y: '+=75', duration: initialDuration, onComplete: shortenDuration });
  
    function shortenDuration(): void {
        // get the current duration
        const currentDuration = tl.getChildren()[0].duration();
  
        // calculate the new duration
        const newDuration = currentDuration * 0.80;
  
        // set the new duration
        tl.getChildren().forEach(child => child.duration(newDuration));
    }
    
    // start the animation
    tl.play();
}