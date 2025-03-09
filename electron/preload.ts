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

  // Change the server port
  changeoverlayServerPort: (port: number) => {
    return ipcRenderer.invoke("change-server-port", port);
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
