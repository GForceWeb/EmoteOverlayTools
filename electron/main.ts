import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as express from "express";
import { WebSocketServer } from "ws";
import * as http from "http";

// Keep a global reference of the mainWindow object
let mainWindow: BrowserWindow | null = null;
let serverPort = 3030;
const expressApp = express.default();
const server = http.createServer(expressApp);
const wss = new WebSocketServer({ server });

// Set up the Express server for serving the animation content
function setupExpressServer() {
  // Serve static files from the dist directory
  expressApp.use(express.static(path.join(__dirname, "../renderer")));

  // Serve the animation interface
  expressApp.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, "../renderer/overlay/index.html"));
  });

  // Start the server
  server.listen(serverPort, () => {
    console.log(`Animation server running at http://localhost:${serverPort}`);
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
    mainWindow.loadURL("http://localhost:3000/admin/admin.html");
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
  return `http://localhost:${serverPort}`;
});

ipcMain.handle("change-server-port", async (event, newPort) => {
  try {
    // Close existing server
    server.close();

    // Update port
    serverPort = parseInt(newPort);

    // Restart server on new port
    server.listen(serverPort, () => {
      console.log(`Animation server restarted on port ${serverPort}`);
    });

    return { success: true, port: serverPort };
  } catch (error) {
    console.error("Failed to change port:", error);
    return { success: false, error: (error as Error).message };
  }
});
