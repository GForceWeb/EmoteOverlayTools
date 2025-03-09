import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import express from "express";
import { WebSocketServer } from "ws";
import * as http from "http";
import fs from "fs";
import { defaultConfig } from "../src/shared/defaultConfig";

// Keep a global reference of the mainWindow object
let mainWindow: BrowserWindow | null = null;
let overlayServerPort = 3030;
const expressApp = express();
const server = http.createServer(expressApp);
const wss = new WebSocketServer({ server });
const settingsPath = path.join(app.getPath("userData"), "settings.json");
let currentSettings = defaultConfig;

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

  expressApp.post(
    "/api/settings",
    (req: express.Request, res: express.Response) => {
      try {
        const newSettings = req.body;
        // Update current settings in memory
        currentSettings = newSettings;

        // Save to the settings file
        fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));

        console.log("Settings saved to:", settingsPath);
        res.json({ success: true });
      } catch (error) {
        console.error("Error saving settings:", error);
        res.status(500).json({
          error: "Failed to save settings file",
          message: (error as Error).message,
        });
      }
    }
  );

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

// Create the Electron application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the admin interface in development or production
  if (process.env.NODE_ENV === "development") {
    const devURL = "http://localhost:3000/admin/admin.html";
    console.log("Loading URL in development mode:", devURL);
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/admin/admin.html"));
  }

  // Handle window being closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.whenReady().then(() => {
  setupExpressServer();
  setupWebSocketServer();
  createWindow();

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
