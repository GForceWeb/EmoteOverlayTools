"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import type { Settings } from "@/shared/types";
import { useToast } from "@/admin/hooks/use-toast";

interface ConnectionStatusProps {
  settings: Settings;
}

type ConnectionState = "connected" | "disconnected" | "connecting" | "error";

export function ConnectionStatus({ settings }: ConnectionStatusProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [nextAutoTest, setNextAutoTest] = useState<Date | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { toast } = useToast();

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
    setLastAttempt(new Date());
    
    // Set next auto test time (5 minutes from now)
    const nextTest = new Date();
    nextTest.setMinutes(nextTest.getMinutes() + 5);
    setNextAutoTest(nextTest);

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
    
    // Initialize next auto test time
    const nextTest = new Date();
    nextTest.setMinutes(nextTest.getMinutes() + 5);
    setNextAutoTest(nextTest);
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

  const getStatusText = () => {
    switch (connectionState) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case "connected":
        return <Wifi className="h-4 w-4" />;
      case "connecting":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "error":
      case "disconnected":
        return <WifiOff className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Streamer.Bot Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>WebSocket</span>
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Server: {getWebSocketUrl()}</p>
          {lastAttempt && (
            <p>Last attempt: {lastAttempt.toLocaleTimeString()}</p>
          )}
          {nextAutoTest && (
            <p>Next auto-test: {nextAutoTest.toLocaleTimeString()}</p>
          )}
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => testConnection(true)}
            disabled={connectionState === "connecting"}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 