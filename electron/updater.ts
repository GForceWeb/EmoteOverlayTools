import { app, type BrowserWindow, type IpcMain } from "electron";

type UpdaterCheckOptions = {
  /** When true, do not emit noisy updater:error events. */
  silent?: boolean;
};

let cachedAutoUpdater: any | null | undefined;
let wiredAutoUpdaterEvents = false;

async function getAutoUpdater(): Promise<any | null> {
  if (cachedAutoUpdater !== undefined) return cachedAutoUpdater;
  try {
    // Dynamic import to avoid type resolution errors during dev without dependency
    const mod = await import("electron-updater");
    cachedAutoUpdater = (mod as any).autoUpdater as any;
    return cachedAutoUpdater;
  } catch (error) {
    console.warn("electron-updater not available:", (error as Error)?.message);
    cachedAutoUpdater = null;
    return null;
  }
}

export async function setupAutoUpdater(getMainWindow: () => BrowserWindow | null) {
  try {
    const autoUpdater = await getAutoUpdater();
    if (!autoUpdater) return;
    if (wiredAutoUpdaterEvents) return;

    // In dev, electron-updater expects dev-app-update.yml; allow dev config usage.
    if (!app.isPackaged) {
      try {
        autoUpdater.forceDevUpdateConfig = true;
      } catch {
        // ignore
      }
    }

    autoUpdater.autoDownload = false; // we'll prompt first
    autoUpdater.autoInstallOnAppQuit = true; // install after download on quit by default

    autoUpdater.on("checking-for-update", () => {
      getMainWindow()?.webContents.send("updater:checking");
    });

    autoUpdater.on("update-available", (info: any) => {
      getMainWindow()?.webContents.send("updater:available", info);
    });

    autoUpdater.on("update-not-available", (info: any) => {
      getMainWindow()?.webContents.send("updater:not-available", info);
    });

    autoUpdater.on("error", (error: any) => {
      getMainWindow()?.webContents.send(
        "updater:error",
        error?.message || String(error)
      );
    });

    autoUpdater.on("download-progress", (progress: any) => {
      getMainWindow()?.webContents.send("updater:download-progress", progress);
    });

    autoUpdater.on("update-downloaded", (info: any) => {
      getMainWindow()?.webContents.send("updater:downloaded", info);
    });

    wiredAutoUpdaterEvents = true;
  } catch (error) {
    // Non-fatal
    console.error("Failed to initialize autoUpdater", error);
  }
}

export function registerUpdaterIpc(
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null,
  onBeforeQuitAndInstall?: () => void
) {
  ipcMain.handle("updater-check", async (_event, options?: UpdaterCheckOptions) => {
    const silent = !!options?.silent;
    try {
      getMainWindow()?.webContents.send("updater:checking");
      const autoUpdater = await getAutoUpdater();
      if (!autoUpdater) throw new Error("electron-updater not available");
      await autoUpdater.checkForUpdates();
      return { success: true };
    } catch (error) {
      if (!silent) {
        getMainWindow()?.webContents.send(
          "updater:error",
          (error as Error).message
        );
      }
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("updater-download", async () => {
    try {
      const autoUpdater = await getAutoUpdater();
      if (!autoUpdater) throw new Error("electron-updater not available");
      const result = await autoUpdater.downloadUpdate();
      return { success: true, file: result };
    } catch (error) {
      getMainWindow()?.webContents.send("updater:error", (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("updater-quit-and-install", () => {
    try {
      onBeforeQuitAndInstall?.();
      void getAutoUpdater().then((updater) => updater?.quitAndInstall());
      return { success: true };
    } catch (error) {
      getMainWindow()?.webContents.send("updater:error", (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  // Testing aid: simulate an update flow without GitHub
  ipcMain.handle("updater-simulate", async () => {
    try {
      const fakeInfo = {
        version: "0.2.0",
        releaseName: "Simulated",
        releaseNotes: "Test update",
        files: [],
      } as any;
      getMainWindow()?.webContents.send("updater:checking");
      await new Promise((r) => setTimeout(r, 600));
      getMainWindow()?.webContents.send("updater:available", fakeInfo);
      for (let p = 0; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 150));
        getMainWindow()?.webContents.send("updater:download-progress", { percent: p });
      }
      getMainWindow()?.webContents.send("updater:downloaded", fakeInfo);
      return { success: true };
    } catch (error) {
      getMainWindow()?.webContents.send("updater:error", (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });
}
