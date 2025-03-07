import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Define the ElectronAPI type for TypeScript
interface ElectronAPI {
  testAnimation: (
    animationType: string,
    params: any
  ) => Promise<{ success: boolean }>;
  getOBSUrl: () => Promise<string>;
  changeServerPort: (
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

const AdminApp: React.FC = () => {
  // State variables
  const [activeTab, setActiveTab] = useState("settings");
  const [connected, setConnected] = useState(false);
  const [obsUrl, setObsUrl] = useState("");
  const [serverPort, setServerPort] = useState(3030);
  const [allFeatures, setAllFeatures] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [maxEmotes, setMaxEmotes] = useState(200);
  const [subOnly, setSubOnly] = useState(false);
  const [animationType, setAnimationType] = useState("rain");
  const [emoteCount, setEmoteCount] = useState(20);
  const [username, setUsername] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  // Initialize the admin interface
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get the OBS URL
        const url = await window.electronAPI.getOBSUrl();
        setObsUrl(url);
        
        // Extract port from URL
        const match = url.match(/:(\d+)/);
        if (match && match[1]) {
          setServerPort(parseInt(match[1]));
        }

        // Update preview frame with parameters
        if (previewFrameRef.current) {
          previewFrameRef.current.src = `${url}?all=true&debug=true&maxemotes=50`;
        }

        // Update connection status
        setConnected(true);
        
        // Log initialization
        logMessage(`System initialized. Server running at ${url}`);
      } catch (error) {
        logMessage(`Error initializing: ${(error as Error).message}`);
      }
    };

    // Set up WebSocket listeners
    const setupWebSocketListeners = () => {
      const unsubscribe = window.electronAPI.onWebSocketMessage((data) => {
        logMessage(`WebSocket message received: ${JSON.stringify(data)}`);
      });

      // Clean up on unmount
      return unsubscribe;
    };

    initializeApp();
    const unsubscribe = setupWebSocketListeners();
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Function to add a log message
  const logMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs((prevLogs) => [...prevLogs, logEntry]);
  };

  // Function to run an animation test
  const runAnimation = async () => {
    logMessage("Run animation button clicked");

    try {
      // Create params based on animation type
      const params: any = {
        count: emoteCount,
      };

      // Add username if provided
      if (username) {
        params.username = username;
      }

      // Log the test
      logMessage(
        `Testing animation: ${animationType} with ${emoteCount} emotes${
          username ? " for user " + username : ""
        }`
      );

      // Send to electron main process
      const result = await window.electronAPI.testAnimation(
        animationType,
        params
      );

      if (result.success) {
        logMessage(`Animation test sent successfully`);
      } else {
        logMessage(`Failed to send animation test`);
      }
    } catch (error) {
      logMessage(`Error running animation: ${(error as Error).message}`);
    }
  };


  // Function to save settings
  const saveSettings = async () => {
    try {
      // Update server port if changed
      if (serverPort) {
        const result = await window.electronAPI.changeServerPort(serverPort);
        if (result.success) {
          logMessage(`Server port changed to ${result.port}`);
          setObsUrl(`http://localhost:${result.port}`);
        } else {
          logMessage(`Failed to change server port`);
        }
      }

      // Build URL parameters for the animation settings
      const params = new URLSearchParams();

      if (allFeatures) {
        params.set("all", "true");
      } else {
        // Add selected features
        selectedFeatures.forEach((feature) => {
          params.set(feature, "true");
        });
      }

      params.set("maxemotes", maxEmotes.toString());
      params.set("subonly", subOnly ? "true" : "false");

      // Reload the preview frame with the new settings
      if (previewFrameRef.current) {
        previewFrameRef.current.src = `${obsUrl}?${params.toString()}`;
      }

      logMessage("Settings saved and applied");
    } catch (error) {
      logMessage(`Error saving settings: ${(error as Error).message}`);
    }
  };

  // Function to copy URL to clipboard
  const copyUrlToClipboard = () => {
    if (obsUrl) {
      navigator.clipboard
        .writeText(obsUrl)
        .then(() => {
          logMessage("URL copied to clipboard");
        })
        .catch((err) => {
          logMessage(`Error copying URL: ${err}`);
        });
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">G-Force's Emote Overlay Tools</h1>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <span
                className={`w-3 h-3 ${connected ? "bg-green-500" : "bg-red-500"} rounded-full mr-2`}
              ></span>
              <span>{connected ? "Connected" : "Disconnected"}</span>
            </div>
            <div className="text-sm text-gray-400">{obsUrl}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={copyUrlToClipboard}
            >
              Copy URL
            </Button>
          </div>
        </header>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 border-b border-gray-700 w-full bg-transparent">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="animations">Test Animations</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Server Port</label>
                <Input
                  type="number"
                  value={serverPort}
                  onChange={(e) => setServerPort(parseInt(e.target.value))}
                  min={1024}
                  max={65535}
                />
                <p className="text-xs text-gray-500">
                  Port for the local server that OBS will connect to
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enable All Features</label>
                <Select 
                  value={allFeatures ? "true" : "false"} 
                  onValueChange={(value) => setAllFeatures(value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!allFeatures && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specific Features to Enable</label>
                  <div className="border border-input rounded-md p-2 h-40 overflow-y-auto">
                    {["lurk", "welcome", "emoterain", "kappagen", "choon", "cheers", "hypetrain"].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2 mb-2">
                        <input 
                          type="checkbox"
                          id={`feature-${feature}`}
                          checked={selectedFeatures.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeatures([...selectedFeatures, feature]);
                            } else {
                              setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
                            }
                          }}
                          className="rounded border-gray-400" 
                        />
                        <label htmlFor={`feature-${feature}`} className="text-sm">{feature}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Emotes Per Action</label>
                <Input
                  type="number"
                  value={maxEmotes}
                  onChange={(e) => setMaxEmotes(parseInt(e.target.value))}
                  min={1}
                  max={1000}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Restrict Commands to Subscribers Only</label>
                <Select 
                  value={subOnly ? "true" : "false"} 
                  onValueChange={(value) => setSubOnly(value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">False</SelectItem>
                    <SelectItem value="true">True</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings}>Save Settings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animations" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl mb-4">Animation Controls</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Animation Type</label>
                  <Select value={animationType} onValueChange={setAnimationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select animation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rain">Rain</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                      <SelectItem value="spiral">Spiral</SelectItem>
                      <SelectItem value="explode">Explode</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="choon">Choon</SelectItem>
                      <SelectItem value="lurking">Lurk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Emotes</label>
                  <Input
                    type="number"
                    value={emoteCount}
                    onChange={(e) => setEmoteCount(parseInt(e.target.value))}
                    min={1}
                    max={200}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Username (for avatar-based animations)
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Twitch username"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl mb-4">Preview</h3>
              <div className="animation-preview">
                <iframe
                  ref={previewFrameRef}
                  id="preview-frame"
                  src="about:blank"
                  title="Animation Preview"
                ></iframe>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Logs</label>
              <div className="border border-input rounded-md p-2 h-80 overflow-y-auto bg-black/30">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminApp;