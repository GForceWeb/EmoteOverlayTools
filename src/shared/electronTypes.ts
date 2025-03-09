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
}

// Extend the window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
