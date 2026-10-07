import React from "react";
import { Button } from "@/admin/components/ui/button";
import type { TwitchStatus } from "@/shared/twitch";

export interface TwitchConnectionProps {
  status: TwitchStatus;
  onLogin: () => void;
  onDisconnect: () => void;
}

export function TwitchConnection({ status, onLogin, onDisconnect }: TwitchConnectionProps) {
  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div>
        <h3 className="font-display text-sm font-semibold">Connect your Twitch channel</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Log in as the broadcaster. Twitch sends chat, raids, rewards, and Hype Train events directly to this app.
        </p>
      </div>
      {!status.configured && (
        <p className="text-sm text-muted-foreground">Twitch login is not configured in this build. The app developer needs to add a Twitch Client ID.</p>
      )}
      {status.username && <p className="text-sm">Channel: <span className="font-semibold">{status.username}</span></p>}
      {status.state === "connected" && <p role="status" className="text-sm text-emerald-500">Connected to Twitch</p>}
      {status.state === "connecting" && !status.userCode && <p role="status" className="text-sm">Connecting to Twitch...</p>}
      {status.userCode && (
        <div role="status" className="space-y-2">
          <p className="text-sm">Finish logging in in your browser. Enter this code if Twitch asks:</p>
          <p className="font-mono text-xl font-semibold tracking-widest">{status.userCode}</p>
          <Button variant="outline" size="sm" onClick={() => window.electronAPI.openExternal(status.verificationUri!)}>Open Twitch login again</Button>
        </div>
      )}
      {status.error && <p role="alert" className="text-sm text-destructive">{status.error}</p>}
      {status.warnings.length > 0 && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Some events are unavailable for this channel. Chat can still work. Subscriptions, rewards, and Hype Trains require access to those Twitch features.</p>
          <ul className="list-disc space-y-1 pl-4">{status.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onLogin} disabled={!status.configured || status.state === "connecting"}>
          {status.username ? "Log in with another Twitch account" : "Log in with Twitch"}
        </Button>
        {(status.username || status.state === "connecting") && (
          <Button size="sm" variant="outline" onClick={onDisconnect}>{status.state === "connecting" ? "Cancel" : "Disconnect Twitch"}</Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Keep Emote Overlay Tools running while streaming. Your OBS URL stays the same when you switch modes.</p>
    </div>
  );
}
