"use client";

import React from "react";
import { ConnectionStatus } from "@/admin/components/connection-status";
import { OverlayUrl } from "@/admin/components/overlay-url";
import { TwitchConnection, type TwitchConnectionProps } from "@/admin/components/twitch-connection";
import type { ConnectionMode } from "@/shared/twitch";
import { cn } from "@/admin/lib/utils";

export interface SetupGuideContentProps {
  connectionMode?: ConnectionMode;
  onConnectionModeChange?: (mode: ConnectionMode) => void;
  twitch?: TwitchConnectionProps;
  overlayUrl: string;
  websocketUrl: string;
  onWebsocketUrlChange: (value: string) => void;
  overlayServerPort: number;
  onOverlayServerPortChange: (port: number) => void;
  /** Open instruction lists by default (first-run). */
  defaultInstructionsOpen?: boolean;
  className?: string;
}

export function SetupGuideContent({
  connectionMode = "streamerbot",
  onConnectionModeChange,
  twitch,
  overlayUrl,
  websocketUrl,
  onWebsocketUrlChange,
  overlayServerPort,
  onOverlayServerPortChange,
  defaultInstructionsOpen = false,
  className,
}: SetupGuideContentProps) {
  return (
    <div className={className}>
      {onConnectionModeChange && (
        <div className="mb-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="Event connection mode">
          {([
            { mode: "twitch", title: "Twitch login", description: "Emote Reactor authenticates directly with your Twitch account." },
            { mode: "streamerbot", title: "Streamer.Bot", description: "Skip Twitch Login if you already use Streamer.Bot" },
          ] as const).map(option => (
            <button type="button" key={option.mode} aria-pressed={connectionMode === option.mode}
              onClick={() => onConnectionModeChange(option.mode)}
              className={cn("rounded-lg border p-3 text-left transition-colors", connectionMode === option.mode ? "border-primary bg-primary/10" : "border-border hover:bg-accent/50")}>
              <span className="block font-display text-sm font-semibold">{option.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      )}
      {connectionMode === "twitch" && twitch ? <TwitchConnection {...twitch} /> : <ConnectionStatus
        embedded
        websocketUrl={websocketUrl}
        onWebsocketUrlChange={onWebsocketUrlChange}
        defaultInstructionsOpen={defaultInstructionsOpen}
      />}
      <div className="my-4 h-px bg-border/70" />
      <OverlayUrl
        embedded
        url={overlayUrl}
        overlayServerPort={overlayServerPort}
        onOverlayServerPortChange={onOverlayServerPortChange}
        defaultInstructionsOpen={defaultInstructionsOpen}
      />
    </div>
  );
}
