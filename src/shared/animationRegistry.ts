/**
 * Animation Registry
 * 
 * Central source of truth for all animation metadata.
 * This replaces the hardcoded animationMap in handlers.ts
 */

export interface AnimationDefinition {
  name: string;
  displayName: string;
  description: string;
  defaultCount: number;
  defaultInterval: number;
  // Optional custom labels for count/interval in the admin UI
  countLabel?: string;      // e.g., "Maximum Food" for snake
  intervalLabel?: string;   // e.g., "Speed" for some animations
  // Special requirements
  requiresAvatar?: boolean;
  requiresText?: boolean;
  // Grouping
  group?: string;           // Parent group name (e.g., "shapes")
  isGroup?: boolean;        // True if this is a group parent
  children?: string[];      // Child animation names if isGroup
  // Default enablement
  defaultEnabledManual: boolean;  // !er command
  defaultEnabledKappagen: boolean;  // !k kappagen random pool
}

/**
 * All available animations with their metadata
 */
export const animationRegistry: Record<string, AnimationDefinition> = {
  // Standard animations - enabled for both manual and random by default
  rain: {
    name: "rain",
    displayName: "Rain",
    description: "Emotes fall from top to bottom",
    defaultCount: 50,
    defaultInterval: 50,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  rise: {
    name: "rise",
    displayName: "Rise",
    description: "Emotes rise from bottom to top",
    defaultCount: 100,
    defaultInterval: 50,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  explode: {
    name: "explode",
    displayName: "Explode",
    description: "Emotes explode from the center",
    defaultCount: 100,
    defaultInterval: 20,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  volcano: {
    name: "volcano",
    displayName: "Volcano",
    description: "Emotes erupt like a volcano",
    defaultCount: 100,
    defaultInterval: 20,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  firework: {
    name: "firework",
    displayName: "Firework",
    description: "Emotes burst like fireworks",
    defaultCount: 100,
    defaultInterval: 20,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  rightwave: {
    name: "rightwave",
    displayName: "Right Wave",
    description: "Emotes wave from right to left",
    defaultCount: 100,
    defaultInterval: 20,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  leftwave: {
    name: "leftwave",
    displayName: "Left Wave",
    description: "Emotes wave from left to right",
    defaultCount: 100,
    defaultInterval: 20,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  carousel: {
    name: "carousel",
    displayName: "Carousel",
    description: "Emotes rotate in a carousel",
    defaultCount: 100,
    defaultInterval: 150,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  spiral: {
    name: "spiral",
    displayName: "Spiral",
    description: "Emotes move in a spiral pattern",
    defaultCount: 100,
    defaultInterval: 170,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  comets: {
    name: "comets",
    displayName: "Comets",
    description: "Emotes streak across like comets",
    defaultCount: 100,
    defaultInterval: 50,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  dvd: {
    name: "dvd",
    displayName: "DVD",
    description: "Emotes bounce around like the DVD logo",
    defaultCount: 8,
    defaultInterval: 50,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  cyclone: {
    name: "cyclone",
    displayName: "Cyclone",
    description: "Emotes swirl in a cyclone pattern",
    defaultCount: 100,
    defaultInterval: 30,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  tetris: {
    name: "tetris",
    displayName: "Tetris",
    description: "Emotes fall and stack like Tetris",
    defaultCount: 50,
    defaultInterval: 40,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  traffic: {
    name: "traffic",
    displayName: "Traffic",
    description: "Emotes move like traffic",
    defaultCount: 100,
    defaultInterval: 250,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },
  solitaire: {
    name: "solitaire",
    displayName: "Solitaire",
    description: "Emotes cascade like winning solitaire",
    defaultCount: 50,
    defaultInterval: 50,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },

  // Special animations - require avatar
  snake: {
    name: "snake",
    displayName: "Snake",
    description: "Emotes follow like a snake with user's avatar as head",
    defaultCount: 20,
    defaultInterval: 150,
    countLabel: "Maximum Food",
    intervalLabel: "Speed (ms)",
    requiresAvatar: true,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },

  // Special animations - require text
  text: {
    name: "text",
    displayName: "Text",
    description: "Display text with emotes",
    defaultCount: 1,
    defaultInterval: 25,
    requiresText: true,
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },

  // Animations that should be manual only by default (not in !k random pool)
  bounce: {
    name: "bounce",
    displayName: "Bounce",
    description: "Emotes bounce around the screen",
    defaultCount: 10,
    defaultInterval: 50,
    defaultEnabledManual: true,
    defaultEnabledKappagen: false,  // Not in random pool by default
  },
  fade: {
    name: "fade",
    displayName: "Fade",
    description: "Emotes fade in and out",
    defaultCount: 10,
    defaultInterval: 50,
    defaultEnabledManual: true,
    defaultEnabledKappagen: false,  // Not in random pool by default
  },

  // Group parent: shapes
  shapes: {
    name: "shapes",
    displayName: "3D Shapes",
    description: "Randomly selects between 3D shape animations",
    defaultCount: 100,
    defaultInterval: 50,
    isGroup: true,
    children: ["cube", "dodecahedron"],
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,
  },

  // Group children: shapes
  cube: {
    name: "cube",
    displayName: "Cube",
    description: "Emotes form a 3D cube",
    defaultCount: 100,
    defaultInterval: 50,
    group: "shapes",
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,  // Enabled within the shapes group
  },
  dodecahedron: {
    name: "dodecahedron",
    displayName: "Dodecahedron",
    description: "Emotes form a 3D dodecahedron",
    defaultCount: 100,
    defaultInterval: 50,
    group: "shapes",
    defaultEnabledManual: true,
    defaultEnabledKappagen: true,  // Enabled within the shapes group
  },
};

/**
 * Get all top-level animations (excludes group children for random pool)
 */
export function getTopLevelAnimations(): AnimationDefinition[] {
  return Object.values(animationRegistry).filter(
    (anim) => !anim.group // Exclude children that belong to a group
  );
}

/**
 * Get all animations that belong to a specific group
 */
export function getGroupChildren(groupName: string): AnimationDefinition[] {
  return Object.values(animationRegistry).filter(
    (anim) => anim.group === groupName
  );
}

/**
 * Get animation definition by name
 */
export function getAnimationDefinition(name: string): AnimationDefinition | undefined {
  return animationRegistry[name];
}

/**
 * Get all group parent animations
 */
export function getGroupAnimations(): AnimationDefinition[] {
  return Object.values(animationRegistry).filter((anim) => anim.isGroup);
}

/**
 * Get all standalone animations (not groups and not group children)
 */
export function getStandaloneAnimations(): AnimationDefinition[] {
  return Object.values(animationRegistry).filter(
    (anim) => !anim.isGroup && !anim.group
  );
}

/**
 * Get all animation names
 */
export function getAllAnimationNames(): string[] {
  return Object.keys(animationRegistry);
}

