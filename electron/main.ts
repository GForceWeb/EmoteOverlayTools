import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from "electron";
import * as path from "path";
import fs from "fs";
import express from "express";
import { WebSocketServer } from "ws";
import * as http from "http";
import { defaultConfig, deepMergeSettings } from "../src/shared/defaultConfig";
import { setupAvatarCacheEndpoint } from "./avatar-cache";
import { writeLog, getLogs, getAvailableDates, cleanOldLogs, log } from "./logger";
import { registerUpdaterIpc, setupAutoUpdater } from "./updater";

// On Windows, set this as early as possible so taskbar grouping uses our identity/icon.
if (process.platform === "win32") {
  app.setAppUserModelId("com.gforce.emoteoverlaytools");
}

// Keep a global reference of the mainWindow object
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let overlayServerPort = 3030;
let isQuitting = false;
const expressApp = express();
const server = http.createServer(expressApp);
const wss = new WebSocketServer({ server });
const settingsPath = path.join(app.getPath("userData"), "settings.json");
let currentSettings = defaultConfig;

function getOverlayMediaDirectory(): string | undefined {
  const possibleMediaPaths = [
    path.join(process.cwd(), "assets/img"),
    path.join(__dirname, "../assets/img"),
    path.join(__dirname, "../../assets/img"),
    path.join(__dirname, "../renderer/overlay/img"),
    path.join(process.cwd(), "dist/renderer/overlay/img"),
    path.join(__dirname, "../renderer/img"),
    path.join(process.cwd(), "dist/renderer/img"),
  ];

  for (const testPath of possibleMediaPaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  return undefined;
}

// Helper function to get the correct icon path for tray notifications
function getTrayIconPath(): string | undefined {
  const possibleIconPaths = [
    path.join(process.cwd(), "assets/img/app-icon.png"),
    path.join(__dirname, "../assets/img/app-icon.png"),
    path.join(__dirname, "../../assets/img/app-icon.png"),
    path.join(__dirname, "../renderer/img/app-icon.png"),
    path.join(process.cwd(), "dist/renderer/img/app-icon.png"),
    path.join(process.cwd(), "assets/img/icon_draft.png"),
    path.join(__dirname, "../renderer/img/icon_draft.png"),
    path.join(process.cwd(), "dist/renderer/img/icon_draft.png"),
  ];
  
  for (const testPath of possibleIconPaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }
  return undefined; // No icon file found
}

// Helper function to get the correct icon path for the application window (taskbar/titlebar)
function getWindowIconPath(): string | undefined {
  const possibleIconPaths = [
    // Prefer PNG first — more reliable for BrowserWindow.setIcon on Windows.
    path.join(process.cwd(), "assets/img/app-icon.png"),
    path.join(__dirname, "../assets/img/app-icon.png"),
    path.join(__dirname, "../../assets/img/app-icon.png"),
    path.join(__dirname, "../renderer/img/app-icon.png"),
    path.join(process.cwd(), "dist/renderer/img/app-icon.png"),
    // ICO fallbacks (installer / shell)
    path.join(process.cwd(), "assets/img/favicon.ico"),
    path.join(__dirname, "../renderer/img/favicon.ico"),
    path.join(process.cwd(), "dist/renderer/img/favicon.ico"),
    path.join(process.cwd(), "assets/img/icon_draft.png"),
    path.join(__dirname, "../renderer/img/icon_draft.png"),
    path.join(process.cwd(), "dist/renderer/img/icon_draft.png"),
  ];

  for (const testPath of possibleIconPaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }
  return undefined;
}

function loadAppIconImage(): Electron.NativeImage | null {
  const iconPath = getWindowIconPath();
  if (!iconPath) {
    return null;
  }

  const image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    console.warn("Failed to load window icon from:", iconPath);
    return null;
  }

  console.log("Loaded window/taskbar icon from:", iconPath);
  return image;
}

// Load settings on startup with deep merge to ensure new animations are added
try {
  if (!fs.existsSync(settingsPath)) {
    // Create default settings file if it doesn't exist
    fs.writeFileSync(settingsPath, JSON.stringify(defaultConfig, null, 2));
    console.log("Created default settings file at:", settingsPath);
    currentSettings = defaultConfig;
  } else {
    // Load user settings and deep merge with defaults to add any new animations
    const userSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    currentSettings = deepMergeSettings(userSettings, defaultConfig);
    
    // Save the merged settings back to disk so new animations are persisted
    fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 2));
    console.log("Settings loaded and merged with defaults");
  }
} catch (error) {
  console.error("Failed to load settings:", error);
  currentSettings = defaultConfig;
}

// Set up the Express server for serving the animation content
async function setupExpressServer() {
  // Middleware to add CORS headers
  expressApp.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  expressApp.use(express.json());

  const overlayMediaDirectory = getOverlayMediaDirectory();
  if (overlayMediaDirectory) {
    expressApp.use("/overlay/img", express.static(overlayMediaDirectory));
    expressApp.use("/img", express.static(overlayMediaDirectory));
  }

  expressApp.get(
    "/api/settings",
    (req: express.Request, res: express.Response) => {
      try {
        if (fs.existsSync(settingsPath)) {
          // Load and merge with defaults to ensure new animations are included
          const userSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
          const mergedSettings = deepMergeSettings(userSettings, defaultConfig);
          res.setHeader("Content-Type", "application/json");
          res.json(mergedSettings);
        } else {
          // If file doesn't exist yet, return default config
          res.json(defaultConfig);
        }
      } catch (error) {
        console.error("Error reading settings file:", error);
        res.status(500).json({
          error: "Failed to read settings file",
          fallback: defaultConfig,
        });
      }
    }
  );

  // API endpoint to get Twitch avatar with caching
  setupAvatarCacheEndpoint(expressApp);

  // Overlay presence: OBS browser sources heartbeat here so the admin UI
  // can tell when a real overlay (not the in-app preview) is connected.
  const OVERLAY_HEARTBEAT_TTL_MS = 15000;
  const overlayClients = new Map<string, number>();

  const pruneOverlayClients = () => {
    const cutoff = Date.now() - OVERLAY_HEARTBEAT_TTL_MS;
    for (const [clientId, lastSeen] of overlayClients) {
      if (lastSeen < cutoff) {
        overlayClients.delete(clientId);
      }
    }
  };

  const getOverlayStatus = () => {
    pruneOverlayClients();
    const clientCount = overlayClients.size;
    let lastSeen: number | null = null;
    for (const timestamp of overlayClients.values()) {
      if (lastSeen === null || timestamp > lastSeen) {
        lastSeen = timestamp;
      }
    }
    return {
      connected: clientCount > 0,
      clientCount,
      lastSeen,
    };
  };

  expressApp.post(
    "/api/overlay/heartbeat",
    (req: express.Request, res: express.Response) => {
      try {
        const { clientId, source } = req.body ?? {};

        // Preview iframe heartbeats are ignored so Step 2 can track OBS only
        if (source === "preview") {
          res.json({ success: true, ignored: true });
          return;
        }

        if (!clientId || typeof clientId !== "string") {
          res.status(400).json({ error: "Missing required field: clientId" });
          return;
        }

        overlayClients.set(clientId, Date.now());
        res.json({ success: true, ...getOverlayStatus() });
      } catch (error) {
        console.error("Error recording overlay heartbeat:", error);
        res.status(500).json({ error: "Failed to record overlay heartbeat" });
      }
    }
  );

  expressApp.get(
    "/api/overlay/status",
    (_req: express.Request, res: express.Response) => {
      try {
        res.json(getOverlayStatus());
      } catch (error) {
        console.error("Error getting overlay status:", error);
        res.status(500).json({ error: "Failed to get overlay status" });
      }
    }
  );

  // Logging API endpoints
  expressApp.post("/api/log", (req: express.Request, res: express.Response) => {
    try {
      const { type, message, source } = req.body;
      
      // Validate required fields
      if (!type || !message || !source) {
        res.status(400).json({ error: "Missing required fields: type, message, source" });
        return;
      }
      
      // Validate type
      if (!["info", "warning", "error"].includes(type)) {
        res.status(400).json({ error: "Invalid type. Must be: info, warning, or error" });
        return;
      }
      
      // Validate source
      if (!["main", "overlay", "admin"].includes(source)) {
        res.status(400).json({ error: "Invalid source. Must be: main, overlay, or admin" });
        return;
      }
      
      writeLog(type, message, source);
      res.json({ success: true });
    } catch (error) {
      console.error("Error writing log:", error);
      res.status(500).json({ error: "Failed to write log" });
    }
  });

  expressApp.get("/api/logs", (req: express.Request, res: express.Response) => {
    try {
      const dates = getAvailableDates();
      res.json({ dates });
    } catch (error) {
      console.error("Error getting log dates:", error);
      res.status(500).json({ error: "Failed to get log dates" });
    }
  });

  expressApp.get("/api/logs/:date", (req: express.Request, res: express.Response) => {
    try {
      const { date } = req.params;
      
      // Basic date format validation (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
        return;
      }
      
      const logs = getLogs(date);
      res.json({ logs });
    } catch (error) {
      console.error("Error getting logs:", error);
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  if (process.env.NODE_ENV === "development") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      cacheDir: path.resolve(process.cwd(), "node_modules/.vite-overlay"),
      server: {
        middlewareMode: true,
      },
    });
    expressApp.get("/", (req: express.Request, res: express.Response) => {
      const queryIndex = req.url.indexOf("?");
      const query = queryIndex >= 0 ? req.url.slice(queryIndex) : "";
      res.redirect(`/overlay/index.html${query}`);
    });
    expressApp.use(vite.middlewares);
  } else {
    // Serve static files from the dist directory
    expressApp.use(express.static(path.join(__dirname, "../renderer")));

    // Serve the animation interface
    expressApp.get("/", (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(__dirname, "../renderer/overlay/index.html"));
    });
  }

  // Start the server
  server.listen(overlayServerPort, () => {
    console.log(
      `Animation server running at http://localhost:${overlayServerPort}`
    );
  });
}

// Set up WebSocket communication
function setupWebSocketServer() {
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    // Handle messages from clients
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received message:", data);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
          }
        });

        // Send message back to Electron UI if needed
        if (mainWindow) {
          mainWindow.webContents.send("ws-message", data);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
}

// Create the system tray
function createTray() {
  // Try to use an icon file, fallback to a simple icon if not available
  let icon: Electron.NativeImage;
  
  try {
    const iconPath = getTrayIconPath();
    
    if (iconPath) {
      // Windows tray looks best at ~16–32px; oversized PNGs can fall back to Electron's default.
      const source = nativeImage.createFromPath(iconPath);
      icon = source.isEmpty()
        ? source
        : source.resize({ width: 32, height: 32, quality: "best" });
      console.log("Loaded tray icon from:", iconPath);
    } else {
      // Fallback to a simple icon
      console.log("No icon file found, using fallback.");
      icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMUMxMS44NjYgMSAxNSA0LjEzNCAxNSA4QzE1IDExLjg2NiAxMS44NjYgMTUgOCAxNUM0LjEzNCAxNSAxIDExLjg2NiAxIDhDMSA0LjEzNCA0LjEzNCAxIDggMVoiIGZpbGw9IiM2NDY0NjQiLz4KPHBhdGggZD0iTTggM0M5LjY1Njg1IDMgMTEgNC4zNDMxNSAxMSA2QzExIDcuNjU2ODUgOS42NTY4NSA5IDggOUM2LjM0MzE1IDkgNSA3LjY1Njg1IDUgNkM1IDQuMzQzMTUgNi4zNDMxNSAzIDggM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=');
    }
  } catch (error) {
    // Fallback to a simple icon if anything fails
    console.error("Error loading tray icon:", error);
    icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggM0M5LjY1Njg1IDMgMTEgNC4zNDMxNSAxMSA2QzExIDcuNjU2ODUgOS42NTY4NSA5IDggOUM2LjM0MzE1IDkgNSA3LjY1Njg1IDUgNkM1IDQuMzQzMTUgNi4zNDMxNSAzIDggM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=');
  }
  
  tray = new Tray(icon);
  tray.setToolTip('Emote Overlay Tools');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Minimize to Tray',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
          
          // Show notification that app is in tray
          tray?.displayBalloon({
            title: 'Emote Overlay Tools',
            content: 'Application minimized to system tray. Double-click the tray icon to restore.',
            icon: getTrayIconPath()
          });
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  // Double click on tray icon to show the window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Create the Electron application window
function createWindow() {
  const windowIcon = loadAppIconImage();

  const browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 1200,
    autoHideMenuBar: process.platform !== "darwin",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  };

  if (windowIcon) {
    browserWindowOptions.icon = windowIcon;
  }

  mainWindow = new BrowserWindow(browserWindowOptions);

  // Re-apply after creation — Windows taskbar can ignore constructor icon in dev.
  if (windowIcon) {
    mainWindow.setIcon(windowIcon);
  }

  // Hide menu bar (File/Edit/View/...) for end users on Windows/Linux.
  // Note: macOS uses the system menu bar; we leave it alone.
  if (process.platform !== "darwin") {
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenuBarVisibility(false);
  }

  // Load the admin interface in development or production
  if (process.env.NODE_ENV === "development") {
    const devURL = "http://localhost:3000/admin/admin.html";
    console.log("Loading URL in development mode:", devURL);
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/admin/admin.html"));
  }

  // Handle window minimize - hide to tray instead
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow?.hide();
    
    // Show notification that app is in tray
    if (tray) {
      tray.displayBalloon({
        title: 'Emote Overlay Tools',
        content: 'Application minimized to system tray. Double-click the tray icon to restore.',
        icon: getTrayIconPath()
      });
    }
  });

  // Handle window close - show confirmation dialog
  mainWindow.on('close', (event) => {
    if (isQuitting) return;

    // Only prompt when the user is actively closing the focused window.
    // This bypasses confirmation for taskbar/system-tray context-menu closes.
    if (!mainWindow?.isFocused()) return;

    event.preventDefault();
    mainWindow?.webContents.send('show-close-confirmation');
  });

  // Handle window being closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.whenReady().then(async () => {
  // Remove default application menu (File/Edit/View/...) on Windows/Linux.
  // This prevents the menu from being shown via Alt and removes unused items.
  if (process.platform !== "darwin") {
    Menu.setApplicationMenu(null);
  }
  
  // Clean up old log files on startup
  cleanOldLogs();
  log("info", "Application started");
  
  await setupExpressServer();
  setupWebSocketServer();
  createWindow();
  createTray(); // Call createTray here

  // Set up auto-updater + IPC (works in packaged and dev when configured)
  void setupAutoUpdater(() => mainWindow);
  registerUpdaterIpc(ipcMain, () => mainWindow, () => {
    isQuitting = true;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handlers for communication between renderer and main process
ipcMain.handle("test-animation", async (event, animType, params) => {
  // Send test command to the WebSocket server
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({
          type: "test-animation",
          animationType: animType,
          params: params,
        })
      );
    }
  });
  return { success: true };
});

ipcMain.handle("get-obs-url", () => {
  return `http://localhost:${overlayServerPort}`;
});

ipcMain.handle("save-settings", async (event, newSettings) => {
  try {
    // Deep merge to ensure new animations from registry are preserved
    const mergedSettings = deepMergeSettings(newSettings, defaultConfig);
    fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2));
    currentSettings = mergedSettings;
    return { success: true };
  } catch (error) {
    console.error("Failed to save settings:", error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle("change-server-port", async (event, newPort) => {
  try {
    // Close existing server
    server.close();

    // Update port
    overlayServerPort = parseInt(newPort);

    // Restart server on new port
    server.listen(overlayServerPort, () => {
      console.log(`Animation server restarted on port ${overlayServerPort}`);
    });

    return { success: true, port: overlayServerPort };
  } catch (error) {
    console.error("Failed to change port:", error);
    return { success: false, error: (error as Error).message };
  }
});

// Add this to your existing IPC handlers
ipcMain.handle("get-settings-path", () => {
  return settingsPath;
});

// Handle quit confirmation
ipcMain.handle("confirm-quit", () => {
  isQuitting = true;
  app.quit();
});

// Handle tray quit
ipcMain.handle("tray-quit", () => {
  isQuitting = true;
  app.quit();
});

// Handle minimize to tray
ipcMain.handle("minimize-to-tray", () => {
  if (mainWindow) {
    mainWindow.hide();
    
    // Show notification that app is in tray
    if (tray) {
      tray.displayBalloon({
        title: 'Emote Overlay Tools',
        content: 'Application minimized to system tray. Double-click the tray icon to restore.',
        icon: getTrayIconPath()
      });
    }
  }
});

// Handle show window
ipcMain.handle("show-window", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// Open external URLs in user's default browser
ipcMain.handle("open-external", async (_event, url: string) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error("Failed to open external URL:", url, error);
    return { success: false, error: (error as Error).message };
  }
});

// Provide application version to renderer
ipcMain.handle("get-version", () => {
  return app.getVersion();
});
