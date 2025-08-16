// Define the ElectronAPI type for TypeScript
interface ElectronAPI {
  testAnimation: (
    animationType: string,
    params: any
  ) => Promise<{ success: boolean }>;
  updateSettings: (
    settings: any
  ) => Promise<{ success: boolean; settings: any }>;
  getOBSUrl: () => Promise<string>;
  changeoverlayServerPort: (
    port: number
  ) => Promise<{ success: boolean; port: number }>;
  onWebSocketMessage: (callback: (data: any) => void) => () => void;
  saveSettings: (
    settings: any
  ) => Promise<{ success: boolean; error?: string }>;
  confirmQuit: () => Promise<void>;
  minimizeToTray: () => Promise<void>;
  showWindow: () => Promise<void>;
  onCloseConfirmation: (callback: () => void) => () => void;
}

// Extend the window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
