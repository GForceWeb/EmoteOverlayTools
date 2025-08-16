import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from "electron";
import * as path from "path";
import fs from "fs";
import express from "express";
import { WebSocketServer } from "ws";
import * as http from "http";
import { defaultConfig } from "../src/shared/defaultConfig";

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

// Helper function to get the correct icon path for tray notifications
function getTrayIconPath(): string | undefined {
  const possibleIconPaths = [
    path.join(__dirname, "../renderer/img/icon_draft.png"),       // Production: dist/renderer/img/
    path.join(__dirname, "../assets/img/icon_draft.png"),         // Development: assets/img/
    path.join(__dirname, "../../assets/img/icon_draft.png"),      // Alternative path
    path.join(process.cwd(), "assets/img/icon_draft.png"),        // From project root
    path.join(process.cwd(), "dist/renderer/img/icon_draft.png")  // From dist
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
    // Prefer ICO when available
    path.join(__dirname, "../renderer/img/favicon.ico"),
    path.join(process.cwd(), "dist/renderer/img/favicon.ico"),
    path.join(process.cwd(), "assets/img/favicon.ico"),
    // Fallback to PNG
    path.join(__dirname, "../renderer/img/icon_draft.png"),
    path.join(process.cwd(), "dist/renderer/img/icon_draft.png"),
    path.join(process.cwd(), "assets/img/icon_draft.png"),
  ];

  for (const testPath of possibleIconPaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }
  return undefined;
}

// Load settings on startup
try {
  if (!fs.existsSync(settingsPath)) {
    // Create default settings file if it doesn't exist from DEFAULT_SETTINGS

    fs.writeFileSync(settingsPath, JSON.stringify(defaultConfig, null, 2));
    console.log("Created default settings file at:", settingsPath);
  }
  if (fs.existsSync(settingsPath)) {
    currentSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  }
} catch (error) {
  console.error("Failed to load settings:", error);
}

// Set up the Express server for serving the animation content
function setupExpressServer() {
  // Middleware to add CORS headers
  expressApp.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // Serve static files from the dist directory
  expressApp.use(express.static(path.join(__dirname, "../renderer")));

  // Serve the animation interface
  expressApp.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, "../renderer/overlay/index.html"));
  });

  expressApp.get(
    "/api/settings",
    (req: express.Request, res: express.Response) => {
      try {
        if (fs.existsSync(settingsPath)) {
          const fileSettings = fs.readFileSync(settingsPath, "utf8");
          res.setHeader("Content-Type", "application/json");
          res.send(fileSettings); // Send the raw file contents
        } else {
          // If file doesn't exist yet, fall back to current settings
          res.json(currentSettings);
        }
      } catch (error) {
        console.error("Error reading settings file:", error);
        res.status(500).json({
          error: "Failed to read settings file",
          fallback: currentSettings,
        });
      }
    }
  );

  // Add API endpoint to save settings
  expressApp.use(express.json()); // Add this to parse JSON request bodies

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
    // Try to load from assets if available - check multiple possible paths
    const possibleIconPaths = [
      path.join(__dirname, "../renderer/img/icon_draft.png"),       // Production: dist/renderer/img/
      path.join(__dirname, "../assets/img/icon_draft.png"),         // Development: assets/img/
      path.join(__dirname, "../../assets/img/icon_draft.png"),      // Alternative path
      path.join(process.cwd(), "assets/img/icon_draft.png"),        // From project root
      path.join(process.cwd(), "dist/renderer/img/icon_draft.png")  // From dist
    ];
    
    let iconPath: string | null = null;
    for (const testPath of possibleIconPaths) {
      if (fs.existsSync(testPath)) {
        iconPath = testPath;
        break;
      }
    }
    
    if (iconPath) {
      icon = nativeImage.createFromPath(iconPath);
      console.log("Loaded tray icon from:", iconPath);
    } else {
      // Fallback to a simple icon
      console.log("No icon file found, using fallback. Checked paths:", possibleIconPaths);
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
  const windowIconPath = getWindowIconPath();

  const browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  };

  if (windowIconPath) {
    browserWindowOptions.icon = windowIconPath;
  }

  mainWindow = new BrowserWindow(browserWindowOptions);

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
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.webContents.send('show-close-confirmation');
    }
  });

  // Handle window being closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.whenReady().then(() => {
  // Ensure proper taskbar grouping and icon usage on Windows during development
  if (process.platform === 'win32') {
    try {
      app.setAppUserModelId('com.gforce.emoteoverlaytools');
    } catch (err) {
      console.warn('Failed to set AppUserModelId:', err);
    }
  }
  setupExpressServer();
  setupWebSocketServer();
  createWindow();
  createTray(); // Call createTray here

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
    // Merge new settings with default config to ensure new fields aren't lost
    const mergedSettings = { ...defaultConfig, ...newSettings };
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
