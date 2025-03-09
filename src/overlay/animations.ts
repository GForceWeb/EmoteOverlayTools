import { globalVars } from "./config.ts";
import helpers from "./helpers.ts";

// Dynamically import all animation modules
// @ts-ignore
const modules = import.meta.glob("./animations/*.ts");

interface AnimationsCollection {
  [key: string]: any;
}

const animations: AnimationsCollection = {};

// Load and flatten all animation functions
async function loadAnimations() {
  for (const path in modules) {
    const module = await modules[path]();
    Object.assign(animations, module);
  }
}

// Initialize animations
loadAnimations();

export default animations;
