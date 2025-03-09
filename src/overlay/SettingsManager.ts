import { Settings } from "../shared/types";

class SettingsManager {
  private static instance: SettingsManager;
  public settings: Settings;

  private constructor() {
    this.settings = {
      serverUrl: "ws://localhost:8080/",
      serverPort: 8080,
      twitchUsername: "G-Force",
      enableAllFeatures: false,
      enableAllAnimations: false,
      animations: {
        rain: {
          enabled: true,
        },
        rise: {
          enabled: true,
        },
        explode: {
          enabled: true,
        },
        volcano: {
          enabled: true,
        },
        firework: {
          enabled: true,
        },
        rightwave: {
          enabled: true,
        },
        leftwave: {
          enabled: true,
        },
        carousel: {
          enabled: true,
        },
        spiral: {
          enabled: true,
        },
        comets: {
          enabled: true,
        },
        dvd: {
          enabled: true,
        },
        text: {
          enabled: true,
        },
        cyclone: {
          enabled: true,
        },
        tetris: {
          enabled: true,
        },
        bounce: {
          enabled: true,
        },
        cube: {
          enabled: true,
        },
        fade: {
          enabled: true,
        },
        invaders: {
          enabled: true,
        },
      },
      features: {
        lurk: {
          enabled: true,
        },
        welcome: {
          enabled: true,
        },
        kappagen: {
          enabled: true,
        },
        cheers: {
          enabled: true,
        },
        hypetrain: {
          enabled: true,
        },
        emoterain: {
          enabled: true,
        },
        choon: {
          enabled: true,
        },
      },
      maxEmotes: 200,
      subOnly: false,
      defaultEmotes: 100,
      debug: false,
    };
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }
}

export default SettingsManager.getInstance();
