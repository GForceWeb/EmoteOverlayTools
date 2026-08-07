"use client";

import React, { useState } from "react";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { InfoHint } from "@/admin/components/info-hint";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/admin/lib/utils";
import type { ConnectionState } from "@/admin/hooks/use-connection-status";

interface ConnectionStatusProps {
  websocketUrl: string;
  onWebsocketUrlChange: (value: string) => void;
  embedded?: boolean;
  defaultInstructionsOpen?: boolean;
}

export function getStatusColor(connectionState: ConnectionState) {
  switch (connectionState) {
    case "connected":
      return "bg-emerald-500";
    case "connecting":
      return "bg-amber-400";
    case "error":
    case "disconnected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export function getStatusText(connectionState: ConnectionState) {
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
}

export function getStatusHsl(connectionState: ConnectionState) {
  switch (connectionState) {
    case "connected":
      return "142 71% 45%";
    case "connecting":
      return "45 93% 47%";
    case "error":
    case "disconnected":
      return "0 72% 51%";
    default:
      return "0 0% 50%";
  }
}

export function ConnectionStatus({
  websocketUrl,
  onWebsocketUrlChange,
  embedded = false,
  defaultInstructionsOpen = false,
}: ConnectionStatusProps) {
  const [showInstructions, setShowInstructions] = useState(
    defaultInstructionsOpen
  );

  return (
    <div className={cn(!embedded && "rounded-xl border bg-card p-4")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Streamer.Bot Websocket Connection
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstructions((open) => !open)}
          className="h-7 w-7 p-0 md:hidden"
          aria-label={showInstructions ? "Hide instructions" : "Show instructions"}
        >
          {showInstructions ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="streamerBotWebsocketUrl" className="text-xs">
              Streamer.Bot Websocket URL
            </Label>
            <InfoHint text="ws://localhost:8080/ is the default and should be correct unless you've customized Streamer.Bot or are running it on a separate computer." />
          </div>
          <Input
            id="streamerBotWebsocketUrl"
            name="streamerBotWebsocketUrl"
            value={websocketUrl}
            onChange={(e) => onWebsocketUrlChange(e.target.value)}
            placeholder="ws://localhost:8080/"
            className="font-mono text-xs"
          />
        </div>

        <div
          className={cn(
            "rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground",
            !showInstructions && "hidden md:block"
          )}
        >
          <p className="mb-2 font-medium text-foreground/80">In Streamer.Bot:</p>
          <ol className="ml-2 list-inside list-decimal space-y-1">
            <li>
              Ensure the Websocket server is enabled in Streamer.Bot settings
            </li>
            <li>
              Confirm the WebSocket URL matches your Streamer.Bot server
              (default is usually fine)
            </li>
            <li>
              Check the SB status in the app header — click the refresh icon to
              retest the connection
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
