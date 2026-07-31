"use client";

import React, { useState } from "react";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Button } from "@/admin/components/ui/button";
import { InfoHint } from "@/admin/components/info-hint";
import { useToast } from "@/admin/hooks/use-toast";
import { Copy, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/admin/lib/utils";

interface OverlayUrlProps {
  url: string;
  overlayServerPort: number;
  onOverlayServerPortChange: (port: number) => void;
  embedded?: boolean;
  defaultInstructionsOpen?: boolean;
}

export function OverlayUrl({
  url,
  overlayServerPort,
  onOverlayServerPortChange,
  embedded = false,
  defaultInstructionsOpen = false,
}: OverlayUrlProps) {
  const { toast } = useToast();
  const [showInstructions, setShowInstructions] = useState(
    defaultInstructionsOpen
  );
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast({
        title: "Copied",
        description: "Overlay URL copied to clipboard.",
      });

      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn(!embedded && "rounded-xl border bg-card p-4")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          OBS Browser Source Overlay
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full space-y-2 sm:w-[120px] sm:shrink-0">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="overlayServerPort" className="text-xs">
                Port
              </Label>
              <InfoHint text="Default is fine in most cases. Only change if you have a port usage conflict with another application." />
            </div>
            <Input
              id="overlayServerPort"
              name="overlayServerPort"
              type="number"
              value={overlayServerPort}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(next)) {
                  onOverlayServerPortChange(next);
                }
              }}
              placeholder="3030"
              className="font-mono text-xs"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <Label className="text-xs">Overlay URL</Label>
            <div className="flex gap-2">
              <Input value={url} readOnly className="min-w-0 flex-1 font-mono text-xs" />
              <Button
                onClick={handleCopy}
                aria-label="Copy overlay URL"
                size="icon"
                variant={isCopied ? "default" : "outline"}
                className={cn(
                  "shrink-0 transition-all duration-200",
                  isCopied && "bg-emerald-600 hover:bg-emerald-700"
                )}
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
        </div>

        <div
          className={cn(
            "rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground",
            !showInstructions && "hidden md:block"
          )}
        >
          <p className="mb-2 font-medium text-foreground/80">In OBS Studio:</p>
          <ol className="ml-2 list-inside list-decimal space-y-1">
            <li>
              Right-click in the Sources panel and select &quot;Add&quot; →
              &quot;Browser&quot;
            </li>
            <li>Give it a name (e.g., &quot;Emote Overlay Tools&quot;)</li>
            <li>Paste the Overlay URL</li>
            <li>Set width/height to your canvas size</li>
            <li>Click &quot;OK&quot; to add the source</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
