"use client";

import React from "react";
import {
  getStatusColor,
  getStatusHsl,
  getStatusText,
} from "@/admin/components/connection-status";
import type { ConnectionState } from "@/admin/hooks/use-connection-status";
import { RefreshCw } from "lucide-react";
import { cn } from "@/admin/lib/utils";

export type AppTab =
  | "features"
  | "animations"
  | "setup"
  | "logs"
  | "support";

const PRIMARY_TABS: { value: AppTab; label: string }[] = [
  { value: "features", label: "Features" },
  { value: "animations", label: "Animations" },
];

const SECONDARY_TABS: { value: AppTab; label: string }[] = [
  { value: "setup", label: "Setup" },
  { value: "logs", label: "Logs" },
  { value: "support", label: "Support" },
];

interface AppHeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  sbConnectionState: ConnectionState;
  overlayConnectionState: ConnectionState;
  onRetestSb: () => void;
  onRetestOverlay: () => void;
}

export function AppHeader({
  activeTab,
  onTabChange,
  sbConnectionState,
  overlayConnectionState,
  onRetestSb,
  onRetestOverlay,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-2.5 md:px-5">
        <div className="flex shrink-0 items-center gap-2.5">
          <img
            src="/img/app-icon.png"
            alt="Emote Overlay Tools"
            className="h-8 w-8 rounded-lg object-contain"
            draggable={false}
          />
        </div>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          <div className="flex items-center gap-0.5 rounded-lg bg-secondary/60 p-0.5">
            {PRIMARY_TABS.map((tab) => (
              <TabButton
                key={tab.value}
                label={tab.label}
                active={activeTab === tab.value}
                onClick={() => onTabChange(tab.value)}
                primary
              />
            ))}
          </div>

          <div
            className="mx-1.5 hidden h-5 w-px bg-border sm:block"
            aria-hidden
          />

          <div className="flex items-center gap-0.5">
            {SECONDARY_TABS.map((tab) => (
              <TabButton
                key={tab.value}
                label={tab.label}
                active={activeTab === tab.value}
                onClick={() => onTabChange(tab.value)}
              />
            ))}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <StatusPill
            label="SB"
            fullLabel="Streamer.Bot"
            state={sbConnectionState}
            onClick={onRetestSb}
            title="Click to retest Streamer.Bot connection"
            showRefresh
          />
          <StatusPill
            label="Overlay"
            fullLabel="Overlay"
            state={overlayConnectionState}
            onClick={onRetestOverlay}
            title="OBS/browser-source overlay presence (Live Preview does not count)"
          />
        </div>
      </div>
    </header>
  );
}

function StatusPill({
  label,
  fullLabel,
  state,
  onClick,
  title,
  showRefresh = false,
}: {
  label: string;
  fullLabel: string;
  state: ConnectionState;
  onClick: () => void;
  title: string;
  showRefresh?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-1.5 rounded-full border border-border/80 bg-card/70 px-2 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-accent/50 sm:gap-2 sm:px-2.5"
      title={title}
      aria-label={`${fullLabel}: ${getStatusText(state)}. ${title}`}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          getStatusColor(state),
          state === "connected" && "status-dot-pulse",
          state === "connecting" && "animate-pulse"
        )}
        style={
          {
            "--status-color": getStatusHsl(state),
          } as React.CSSProperties
        }
      />
      <span className="hidden font-medium text-foreground/90 lg:inline">
        {getStatusText(state)}
      </span>
      <span className="text-muted-foreground">{label}</span>
      {(showRefresh || state === "connecting") && (
        <RefreshCw
          className={cn(
            "h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground",
            state === "connecting" && "animate-spin"
          )}
        />
      )}
    </button>
  );
}

function TabButton({
  label,
  active,
  onClick,
  primary = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 font-display text-xs font-semibold tracking-wide transition-colors",
        primary ? "px-3.5" : "px-2.5 text-[11px] font-medium",
        active
          ? primary
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
            : "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
