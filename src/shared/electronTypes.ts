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
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  getVersion: () => Promise<string>;

  // Updater
  updaterCheck: (options?: { silent?: boolean }) => Promise<{ success: boolean; error?: string }>;
  updaterDownload: () => Promise<{ success: boolean; file?: string; error?: string }>;
  updaterQuitAndInstall: () => Promise<{ success: boolean; error?: string }>;
  updaterSimulate: () => Promise<{ success: boolean; error?: string }>;

  onUpdaterChecking: (callback: () => void) => () => void;
  onUpdaterAvailable: (callback: (info: any) => void) => () => void;
  onUpdaterNotAvailable: (callback: (info: any) => void) => () => void;
  onUpdaterError: (callback: (message: string) => void) => () => void;
  onUpdaterProgress: (callback: (progress: { percent?: number }) => void) => () => void;
  onUpdaterDownloaded: (callback: (info: any) => void) => () => void;

  // Main process logging
  onMainLog: (callback: (log: { type: "info" | "warning" | "error"; message: string; timestamp: string }) => void) => () => void;
}

// Extend the window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
