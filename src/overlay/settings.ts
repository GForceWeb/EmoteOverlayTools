import { Settings } from "../shared/types";
import { defaultConfig } from "../shared/defaultConfig";

class OverlaySettings {
  private static instance: OverlaySettings;
  public settings: Settings;

  // Move settings properties to class level
  private constructor() {
    // Copy all properties from defaultConfig to this instance
    this.settings = { ...defaultConfig };

    // Synchronously apply limited URL parameter overrides for GitHub-hosted usage
    // Supported params: streamerBotWebsocketUrl, overlayServerPort, twitchUsername, debug
    try {
      const urlParams = new URLSearchParams(window.location.search);

      const streamerBotWSUrl = urlParams.get("server");
      if (streamerBotWSUrl) {
        this.settings.streamerBotWebsocketUrl = streamerBotWSUrl;
      }

      const twitchUser = urlParams.get("user");
      if (twitchUser) {
        this.settings.twitchUsername = twitchUser;
      }

      if (urlParams.get("debug") !== null) {
        this.settings.debug = true;
      }
    } catch (e) {
      // No-op: if URL parsing fails, continue with defaults
    }

    // Load settings from server
    this.fetchSettings()
      .then(() => {
        console.log("Settings loaded successfully");
      })
      .catch((error) => {
        console.error("Error loading settings:", error);
      });
  }

  public static getInstance(): OverlaySettings {
    if (!OverlaySettings.instance) {
      OverlaySettings.instance = new OverlaySettings();
    }
    return OverlaySettings.instance;
  }

  // Update settings with new values
  public updateSettings(newSettings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Method to fetch settings from server
  public async fetchSettings(): Promise<void> {
    try {
      const response = await fetch(`${window.location.origin}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        console.log("Settings loaded from HTTP API:", data);
        this.updateSettings(data);
      } else {
        console.error("Failed to load settings via HTTP:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }
}

// Export the singleton instance
export default OverlaySettings.getInstance();
