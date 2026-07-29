"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { RefreshCw, Copy, Check } from "lucide-react";
import type { Settings } from "@/shared/types";
import { useToast } from "@/admin/hooks/use-toast";

interface ConnectionStatusProps {
  settings: Settings;
  overlayUrl: string;
}

type ConnectionState = "connected" | "disconnected" | "connecting" | "error";

export function ConnectionStatus({ settings, overlayUrl }: ConnectionStatusProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [overlayConnected, setOverlayConnected] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setIsCopied(true);
      toast({
        title: "Copied",
        description: "OBS Overlay URL copied to clipboard.",
      });

      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const getWebSocketUrl = useCallback(() => {
    // Extract the WebSocket URL from the settings
    // The setting is stored as "ws://localhost:8080/" but we need to parse it
    let url = settings.streamerBotWebsocketUrl;
    
    // If it doesn't start with ws:// or wss://, assume it's just the hostname
    if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
      url = `ws://${url}`;
    }
    
    // Ensure it ends with /
    if (!url.endsWith("/")) {
      url += "/";
    }
    
    return url;
  }, [settings.streamerBotWebsocketUrl]);

  const testConnection = useCallback(async (isManualTest = false) => {
    const wsUrl = getWebSocketUrl();
    setConnectionState("connecting");

    if (isManualTest) {
      toast({
        title: "Testing connection...",
        description: `Attempting to connect to ${wsUrl}`,
      });
    }

    try {
      // Close existing connection if any
      if (ws) {
        ws.close();
      }

      const newWs = new WebSocket(wsUrl);
      setWs(newWs);

      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        if (newWs.readyState === WebSocket.CONNECTING) {
          newWs.close();
          setConnectionState("error");
          if (isManualTest) {
            toast({
              title: "Connection failed",
              description: "Connection timed out after 5 seconds",
              variant: "destructive",
            });
          }
        }
      }, 5000); // 5 second timeout

      newWs.onopen = () => {
        clearTimeout(connectionTimeout);
        setConnectionState("connected");
        
        if (isManualTest) {
          toast({
            title: "Connection successful",
            description: "Successfully connected to Streamer.Bot WebSocket server",
          });
        }
        
        // Send a test subscription message
        newWs.send(JSON.stringify({
          request: "Subscribe",
          events: {
            Twitch: ["ChatMessage"],
            General: ["Custom"]
          },
          id: "connection-test"
        }));
      };

      newWs.onclose = () => {
        clearTimeout(connectionTimeout);
        setConnectionState("disconnected");
        setWs(null);
        if (isManualTest) {
          toast({
            title: "Connection closed",
            description: "WebSocket connection was closed",
            variant: "destructive",
          });
        }
      };

      newWs.onerror = () => {
        clearTimeout(connectionTimeout);
        setConnectionState("error");
        setWs(null);
        if (isManualTest) {
          toast({
            title: "Connection error",
            description: "Failed to connect to Streamer.Bot WebSocket server",
            variant: "destructive",
          });
        }
      };

      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // If we receive any message, the connection is working
          if (data.status === "ok" || data.id === "connection-test") {
            setConnectionState("connected");
          }
        } catch (error) {
          // Even if we can't parse the message, receiving anything means connection works
          setConnectionState("connected");
        }
      };

    } catch (error) {
      console.error("WebSocket connection error:", error);
      setConnectionState("error");
      setWs(null);
      if (isManualTest) {
        toast({
          title: "Connection error",
          description: `Failed to connect: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
      }
    }
  }, [getWebSocketUrl, ws, toast]);

  // Test connection when component mounts or settings change
  useEffect(() => {
    testConnection();
  }, [testConnection]);

  // Set up automatic re-testing every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      testConnection();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [testConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  // Poll for OBS overlay presence (excludes in-app preview heartbeats)
  useEffect(() => {
    let cancelled = false;
    const OVERLAY_STALE_MS = 15000;

    const checkOverlayStatus = async () => {
      try {
        const response = await fetch(`${overlayUrl}/api/overlay/status`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (cancelled) {
          return;
        }

        const lastSeen =
          typeof data.lastSeen === "number" ? data.lastSeen : null;
        const isFresh =
          lastSeen !== null && Date.now() - lastSeen < OVERLAY_STALE_MS;

        setOverlayConnected(Boolean(data.connected) && isFresh);
      } catch {
        if (!cancelled) {
          setOverlayConnected(false);
        }
      }
    };

    void checkOverlayStatus();
    const interval = setInterval(() => {
      void checkOverlayStatus();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [overlayUrl]);

  const getStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStreamerBotStatusTitle = () => {
    switch (connectionState) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection error";
      case "disconnected":
      default:
        return "Disconnected";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <CardTitle className="text-lg">Setup & Usage Guide</CardTitle>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor()}`}
                title={getStreamerBotStatusTitle()}
              />
              <span className="text-sm font-medium">Streamer.Bot</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => testConnection(true)}
                disabled={connectionState === "connecting"}
                className="h-7 w-7 p-0"
                title="Test Streamer.Bot connection"
                aria-label="Test Streamer.Bot connection"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    connectionState === "connecting" ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  overlayConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={overlayConnected ? "Connected" : "Disconnected"}
              />
              <span className="text-sm font-medium">Browser Source</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {connectionState !== "connected" && (
          <div className="text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Step 1: Streamer.Bot Connection</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Ensure the Websocket server is enabled in Streamer.Bot settings</li>
              <li>If you're using a remote Streamer.Bot instance or a different websocket port, adjust the WebSocket URL under General Settings</li>
              <li>Click the refresh icon next to Streamer.Bot to verify the connection</li>
            </ol>
          </div>
        )}

        {!overlayConnected && (
          <div className="text-sm text-muted-foreground space-y-3">
            <div>
              <p className="mb-2 font-medium text-foreground">Step 2: Add Overlay to OBS</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Right-click in the Sources panel and select "Add" → "Browser"</li>
                <li>Give it a name (e.g., "Emote Overlay Tools")</li>
                <li>Paste the URL below</li>
                <li>Set width/height to your OBS canvas size</li>
                <li>Click "OK" to add the source</li>
              </ol>
            </div>
            <p>
              We recommend opening Streamer.Bot first, then Emote Overlay Tools,
              then OBS. If OBS was opened first, refresh the browser source once
              Emote Overlay Tools is running.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">OBS Overlay URL:</div>
          <div className="flex gap-2">
            <Input value={overlayUrl} readOnly className="font-mono" />
            <Button
              onClick={handleCopy}
              aria-label="Copy overlay URL"
              size="icon"
              variant={isCopied ? "default" : "outline"}
              className={`transition-all duration-200 ${isCopied ? "bg-green-600 hover:bg-green-700" : ""}`}
              title="Copy URL"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

