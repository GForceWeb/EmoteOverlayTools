import { useState, useEffect, useCallback, useRef } from "react";
import type { Settings } from "@/shared/types";
import { useToast } from "@/admin/hooks/use-toast";

export type ConnectionState =
  | "connected"
  | "disconnected"
  | "connecting"
  | "error";

export function getWebSocketUrl(streamerBotWebsocketUrl: string) {
  let url = streamerBotWebsocketUrl;

  if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
    url = `ws://${url}`;
  }

  if (!url.endsWith("/")) {
    url += "/";
  }

  return url;
}

export function useConnectionStatus(settings: Settings) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [nextAutoTest, setNextAutoTest] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const wsUrl = getWebSocketUrl(settings.streamerBotWebsocketUrl);

  const testConnection = useCallback(
    async (isManualTest = false) => {
      setConnectionState("connecting");
      setLastAttempt(new Date());

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
        if (wsRef.current) {
          wsRef.current.close();
        }

        const newWs = new WebSocket(wsUrl);
        wsRef.current = newWs;

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
        }, 5000);

        newWs.onopen = () => {
          clearTimeout(connectionTimeout);
          setConnectionState("connected");

          if (isManualTest) {
            toast({
              title: "Connection successful",
              description:
                "Successfully connected to Streamer.Bot WebSocket server",
            });
          }

          newWs.send(
            JSON.stringify({
              request: "Subscribe",
              events: {
                Twitch: ["ChatMessage"],
                General: ["Custom"],
              },
              id: "connection-test",
            })
          );
        };

        newWs.onclose = () => {
          clearTimeout(connectionTimeout);
          setConnectionState("disconnected");
          if (wsRef.current === newWs) {
            wsRef.current = null;
          }
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
          if (wsRef.current === newWs) {
            wsRef.current = null;
          }
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
            if (data.status === "ok" || data.id === "connection-test") {
              setConnectionState("connected");
            }
          } catch {
            setConnectionState("connected");
          }
        };
      } catch (error) {
        console.error("WebSocket connection error:", error);
        setConnectionState("error");
        wsRef.current = null;
        if (isManualTest) {
          toast({
            title: "Connection error",
            description: `Failed to connect: ${
              error instanceof Error ? error.message : String(error)
            }`,
            variant: "destructive",
          });
        }
      }
    },
    [wsUrl, toast]
  );

  useEffect(() => {
    testConnection();

    const nextTest = new Date();
    nextTest.setMinutes(nextTest.getMinutes() + 5);
    setNextAutoTest(nextTest);
  }, [testConnection]);

  useEffect(() => {
    const interval = setInterval(() => {
      testConnection();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [testConnection]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    connectionState,
    lastAttempt,
    nextAutoTest,
    wsUrl,
    testConnection,
  };
}
