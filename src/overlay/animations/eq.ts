import { globalVars } from "../config.ts";
import helpers from "../helpers.ts";

interface EQBar {
  column: HTMLDivElement;
  emotes: HTMLDivElement[];
  image: string;
  // Randomized parameters for this bar's waveform
  phases: number[];
  frequencies: number[];
  amplitudes: number[];
  // Per-bar timing offset for independent movement
  timeOffset: number;
  // Current smoothed value (for interpolation)
  currentValue: number;
  // Target value we're moving toward
  targetValue: number;
}

const ANIMATION_DURATION = 15000; // 15 seconds
const MAX_BARS = 50;
const REFRESH_RATE = 50; // 20fps - smoother than per-beat but not chaotic

export function eq(
  images: string[],
  count: number = 20,
  interval: number = 375 // Default ~160 BPM (60000/160 = 375ms per beat)
): void {
  const barCount = Math.min(Math.max(count, 1), MAX_BARS);
  const imgCount = images.length;
  
  // Calculate emote size and max stack height
  // Use smaller emotes (half standard size) for better resolution in the visualizer
  const emoteSize = window.innerHeight / 28; // Half of standard emote size
  const maxHeight = window.innerHeight * 0.5; // 50% of screen height
  const maxEmotesPerBar = Math.floor(maxHeight / emoteSize); // ~14 emotes at max height
  
  // Calculate bar positioning - centered at bottom
  const totalWidth = barCount * emoteSize;
  const startX = (window.innerWidth - totalWidth) / 2;
  
  // Beat period in milliseconds (interval = time per beat)
  const beatPeriod = interval;
  
  // Create container for all EQ elements
  const container = document.createElement("div");
  container.id = `eq-container-${globalVars.divnumber++}`;
  container.className = "eq-container";
  container.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    pointer-events: none;
  `;
  globalVars.warp.appendChild(container);
  
  // Initialize bars with randomized waveform parameters
  const bars: EQBar[] = [];
  
  for (let i = 0; i < barCount; i++) {
    const column = document.createElement("div");
    column.className = "eq-column";
    column.style.cssText = `
      position: absolute;
      bottom: 0;
      left: ${startX + i * emoteSize}px;
      width: ${emoteSize}px;
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
    `;
    container.appendChild(column);
    
    // Determine which image this bar uses (alternating through provided images)
    const image = images[i % imgCount];
    
    // Calculate bar's position ratio (0 = leftmost/bass, 1 = rightmost/treble)
    const barRatio = i / Math.max(1, barCount - 1);
    
    // Bass bars (first ~20%), mid bars (20-60%), high bars (60-100%)
    const isBassBar = barRatio < 0.2;
    const isMidBar = barRatio >= 0.2 && barRatio < 0.6;
    
    // Generate frequency-appropriate waveform parameters
    // Lower frequencies = slower, more consistent movement
    // Higher frequencies = faster, more variable movement
    let frequencies: number[];
    let amplitudes: number[];
    
    if (isBassBar) {
      // Sub-bass and kick: very slow underlying movement, strong beat sync
      frequencies = [0.25, 0.5, 0.125]; // Very slow oscillations (4+ beats per cycle)
      amplitudes = [0.15, 0.1, 0.05];
    } else if (isMidBar) {
      // Mids: moderate movement, some beat sync
      frequencies = [
        0.25 + Math.random() * 0.25,  // 0.25-0.5 (2-4 beats per cycle)
        0.5 + Math.random() * 0.5,    // 0.5-1.0 (1-2 beats per cycle)
        0.125 + Math.random() * 0.125 // Very slow undertone
      ];
      amplitudes = [0.35, 0.25, 0.15];
    } else {
      // Highs: can move faster but still musical
      frequencies = [
        0.5 + Math.random() * 0.5,    // 0.5-1.0 (1-2 beats per cycle)
        1.0 + Math.random() * 0.5,    // 1.0-1.5 (per beat to 1.5 beats)
        0.25 + Math.random() * 0.25   // Slow undertone for body
      ];
      amplitudes = [0.3, 0.25, 0.2];
    }
    
    const bar: EQBar = {
      column,
      emotes: [],
      image,
      phases: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ],
      frequencies,
      amplitudes,
      // Small time offset per bar for slight desync (not full beat offset)
      timeOffset: Math.random() * beatPeriod * 0.3,
      currentValue: 0.3,
      targetValue: 0.3,
    };
    
    bars.push(bar);
  }
  
  // Animation state
  const startTime = Date.now();
  
  // Main update loop
  const animInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - startTime;
    
    // Stop after duration
    if (elapsed >= ANIMATION_DURATION) {
      clearInterval(animInterval);
      cleanup();
      return;
    }
    
    // Update each bar
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const barRatio = i / Math.max(1, barCount - 1);
      const isBassBar = barRatio < 0.2;
      const isMidBar = barRatio >= 0.2 && barRatio < 0.6;
      
      // Use real time with bar's offset for waveform calculation
      const barTime = elapsed + bar.timeOffset;
      // Convert time to beat position (0 to 1 = one beat cycle)
      const beatPosition = (barTime % beatPeriod) / beatPeriod;
      // Total beats elapsed for wave oscillations
      const totalBeats = barTime / beatPeriod;
      
      // Calculate target height based on waveform
      let value: number;
      
      if (isBassBar) {
        // Bass kick pattern: SHARP attack, FAST decay for dramatic punch
        // Use steeper exponential for snappier response
        const kickEnvelope = Math.exp(-beatPosition * 8); // Much faster decay
        
        // Kick goes from 1.0 (on beat) down to near 0 quickly
        // Add slight variation between bass bars
        const barVariation = 0.9 + (i / barCount) * 0.1;
        const kick = kickEnvelope * barVariation;
        
        // Add a slower sub-bass swell that varies over time
        let subBass = 0;
        for (let w = 0; w < 3; w++) {
          subBass += Math.sin(totalBeats * bar.frequencies[w] * Math.PI * 2 + bar.phases[w]) * bar.amplitudes[w];
        }
        subBass = (subBass + 0.3) / 0.6; // Normalize to 0-1 range
        
        // Combine: kick is dominant, sub adds variation
        value = kick * 0.85 + subBass * 0.15;
        
        // Scale to use FULL range - bass should swing from low to high
        value = 0.15 + value * 0.85; // Range: 0.15 to 1.0
        
      } else if (isMidBar) {
        // Mids: larger amplitude waves with beat sync
        value = 0;
        for (let w = 0; w < 3; w++) {
          value += Math.sin(totalBeats * bar.frequencies[w] * Math.PI * 2 + bar.phases[w]) * bar.amplitudes[w];
        }
        // Normalize to -1 to 1, then scale
        const waveValue = value / 0.75; // Roughly -1 to 1
        
        // Beat pulse - mids respond to kick but less dramatically
        const beatPulse = Math.exp(-beatPosition * 5) * 0.5;
        
        // Combine wave movement with beat pulse
        // Wave provides base movement, beat adds punch
        const baseValue = (waveValue + 1) / 2; // 0 to 1
        value = baseValue * 0.5 + beatPulse * 0.5;
        
        // Apply position-based scaling (closer to bass = louder)
        const midPosition = (barRatio - 0.2) / 0.4; // 0 to 1 within mid range
        const midScale = 0.8 - midPosition * 0.3; // 0.8 at bass end, 0.5 at high end
        
        value = value * midScale;
        value = Math.max(0.05, Math.min(0.85, value));
        
      } else {
        // Highs: more erratic movement, respond to hi-hats
        value = 0;
        for (let w = 0; w < 3; w++) {
          value += Math.sin(totalBeats * bar.frequencies[w] * Math.PI * 2 + bar.phases[w]) * bar.amplitudes[w];
        }
        const waveValue = (value / 0.75 + 1) / 2; // Normalize to 0-1
        
        // Hi-hat pulse on beat
        const beatPulse = Math.exp(-beatPosition * 6) * 0.4;
        // Off-beat hi-hat (eighth notes)
        const offBeatPosition = ((barTime + beatPeriod / 2) % beatPeriod) / beatPeriod;
        const offBeatPulse = Math.exp(-offBeatPosition * 6) * 0.3;
        
        // Combine - highs are more pulse-driven
        value = waveValue * 0.3 + beatPulse + offBeatPulse;
        
        // Apply position-based scaling (further right = quieter average)
        const highPosition = (barRatio - 0.6) / 0.4; // 0 to 1 within high range
        const highScale = 0.6 - highPosition * 0.3; // 0.6 at mid end, 0.3 at far right
        
        value = value * highScale;
        value = Math.max(0.03, Math.min(0.65, value));
      }
      
      // Smooth interpolation toward target (fast response for punchy feel)
      bar.targetValue = value;
      bar.currentValue += (bar.targetValue - bar.currentValue) * 0.7; // Fast interpolation
      
      // Convert smoothed value to emote count
      const targetEmotes = Math.round(bar.currentValue * maxEmotesPerBar);
      
      // Update bar to match target
      setBarEmoteCount(bar, targetEmotes, emoteSize);
    }
  }, REFRESH_RATE);
  
  // Cleanup function
  function cleanup() {
    // Remove all bar elements
    for (const bar of bars) {
      for (const emote of bar.emotes) {
        if (emote.parentNode) {
          emote.parentNode.removeChild(emote);
        }
      }
      if (bar.column.parentNode) {
        bar.column.parentNode.removeChild(bar.column);
      }
    }
    // Remove container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Set the number of emotes in a bar to match the target count
 * Instantly adds or removes emotes for authentic EQ look
 */
function setBarEmoteCount(bar: EQBar, targetCount: number, emoteSize: number): void {
  const currentCount = bar.emotes.length;
  
  if (targetCount > currentCount) {
    // Add emotes
    for (let i = currentCount; i < targetCount; i++) {
      const emote = document.createElement("div");
      emote.className = "eq-emote";
      emote.style.cssText = `
        width: ${emoteSize}px;
        height: ${emoteSize}px;
        background-image: url(${bar.image});
        background-size: 100% 100%;
        flex-shrink: 0;
      `;
      bar.column.appendChild(emote);
      bar.emotes.push(emote);
    }
  } else if (targetCount < currentCount) {
    // Remove emotes from top of stack
    for (let i = currentCount - 1; i >= targetCount; i--) {
      const emote = bar.emotes.pop();
      if (emote && emote.parentNode) {
        emote.parentNode.removeChild(emote);
      }
    }
  }
}
