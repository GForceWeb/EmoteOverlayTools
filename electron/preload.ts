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
});
