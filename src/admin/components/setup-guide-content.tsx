"use client";

import React from "react";
import { ConnectionStatus } from "@/admin/components/connection-status";
import { OverlayUrl } from "@/admin/components/overlay-url";

export interface SetupGuideContentProps {
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
      <ConnectionStatus
        embedded
        websocketUrl={websocketUrl}
        onWebsocketUrlChange={onWebsocketUrlChange}
        defaultInstructionsOpen={defaultInstructionsOpen}
      />
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
