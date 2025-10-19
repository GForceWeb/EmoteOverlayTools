import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Send test commands to animations
  testAnimation: (animationType: string, params: any) => {
    return ipcRenderer.invoke("test-animation", animationType, params);
  },

  // Get the URL for OBS to use
  getOBSUrl: () => {
    return ipcRenderer.invoke("get-obs-url");
  },

  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),

  // Change the server port
  changeoverlayServerPort: (port: number) => {
    return ipcRenderer.invoke("change-server-port", port);
  },

  // Confirm quit action
  confirmQuit: () => {
    return ipcRenderer.invoke("confirm-quit");
  },

  // Minimize to tray
  minimizeToTray: () => {
    return ipcRenderer.invoke("minimize-to-tray");
  },

  // Show window
  showWindow: () => {
    return ipcRenderer.invoke("show-window");
  },

  // Listen for close confirmation request
  onCloseConfirmation: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("show-close-confirmation", subscription);

    // Return a function to unsubscribe
    return () => {
      ipcRenderer.removeListener("show-close-confirmation", subscription);
    };
  },

  // Listen for WebSocket messages from the server
  onWebSocketMessage: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on("ws-message", subscription);

    // Return a function to unsubscribe
    return () => {
      ipcRenderer.removeListener("ws-message", subscription);
    };
  },

  // Open external URLs in the user's default browser
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),

  // Get app version
  getVersion: () => ipcRenderer.invoke("get-version"),

  // Updater controls
  updaterCheck: () => ipcRenderer.invoke("updater-check"),
  updaterDownload: () => ipcRenderer.invoke("updater-download"),
  updaterQuitAndInstall: () => ipcRenderer.invoke("updater-quit-and-install"),
  updaterSimulate: () => ipcRenderer.invoke("updater-simulate"),

  // Updater events
  onUpdaterChecking: (cb: () => void) => {
    const sub = () => cb();
    ipcRenderer.on("updater:checking", sub);
    return () => ipcRenderer.removeListener("updater:checking", sub);
  },
  onUpdaterAvailable: (cb: (info: any) => void) => {
    const sub = (_e: any, info: any) => cb(info);
    ipcRenderer.on("updater:available", sub);
    return () => ipcRenderer.removeListener("updater:available", sub);
  },
  onUpdaterNotAvailable: (cb: (info: any) => void) => {
    const sub = (_e: any, info: any) => cb(info);
    ipcRenderer.on("updater:not-available", sub);
    return () => ipcRenderer.removeListener("updater:not-available", sub);
  },
  onUpdaterError: (cb: (message: string) => void) => {
    const sub = (_e: any, msg: string) => cb(msg);
    ipcRenderer.on("updater:error", sub);
    return () => ipcRenderer.removeListener("updater:error", sub);
  },
  onUpdaterProgress: (cb: (progress: any) => void) => {
    const sub = (_e: any, progress: any) => cb(progress);
    ipcRenderer.on("updater:download-progress", sub);
    return () => ipcRenderer.removeListener("updater:download-progress", sub);
  },
  onUpdaterDownloaded: (cb: (info: any) => void) => {
    const sub = (_e: any, info: any) => cb(info);
    ipcRenderer.on("updater:downloaded", sub);
    return () => ipcRenderer.removeListener("updater:downloaded", sub);
  },
});
