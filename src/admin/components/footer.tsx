import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/dialog";
import { Button } from "@/admin/components/ui/button";

interface FooterProps {
  saveAction?: ReactNode;
}

export function Footer({ saveAction }: FooterProps) {
  const [version, setVersion] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number | null>(null);
  const [hasUpdate, setHasUpdate] = useState<any | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);
  const pendingCheckIsManualRef = useRef<boolean>(false);
  const lastCheckWasManualRef = useRef<boolean>(false);
  const hasTriggeredInstallRef = useRef<boolean>(false);

  const updateVersionLabel = useMemo(() => {
    const v = hasUpdate?.version;
    return typeof v === "string" && v.trim().length ? `v${v}` : "an update";
  }, [hasUpdate]);

  useEffect(() => {
    let isMounted = true;
    const fetchVersion = async () => {
      try {
        const v = await window.electronAPI.getVersion();
        if (isMounted) setVersion(v);
      } catch (_err) {
        if (isMounted) setVersion("");
      }
    };
    fetchVersion();

    const unsubChecking = window.electronAPI.onUpdaterChecking(() => {
      if (!isMounted) return;
      lastCheckWasManualRef.current = pendingCheckIsManualRef.current;
      pendingCheckIsManualRef.current = false;
      setStatus(lastCheckWasManualRef.current ? "Checking for updates…" : "");
      setHasUpdate(null);
      setProgress(null);
    });
    const unsubAvailable = window.electronAPI.onUpdaterAvailable((info) => {
      if (!isMounted) return;
      setStatus(`Update available: v${info?.version ?? "?"}`);
      setHasUpdate(info);
      setIsUpdateDialogOpen(true);
    });
    const unsubNotAvailable = window.electronAPI.onUpdaterNotAvailable(() => {
      if (!isMounted) return;
      setStatus(lastCheckWasManualRef.current ? "You're up to date" : "");
      setHasUpdate(null);
    });
    const unsubError = window.electronAPI.onUpdaterError((message) => {
      if (!isMounted) return;
      if (!lastCheckWasManualRef.current) return;
      setStatus(`Update error: ${message}`);
    });
    const unsubProgress = window.electronAPI.onUpdaterProgress((p) => {
      if (!isMounted) return;
      const pct =
        typeof p?.percent === "number"
          ? Math.max(0, Math.min(100, p.percent))
          : null;
      setProgress(pct);
      if (pct != null) setStatus(`Downloading… ${pct.toFixed(0)}%`);
    });
    const unsubDownloaded = window.electronAPI.onUpdaterDownloaded(() => {
      if (!isMounted) return;
      setStatus("Installing update…");
      if (!hasTriggeredInstallRef.current) {
        hasTriggeredInstallRef.current = true;
        window.electronAPI.updaterQuitAndInstall();
      }
    });

    pendingCheckIsManualRef.current = false;
    window.electronAPI.updaterCheck({ silent: true });

    return () => {
      isMounted = false;
      unsubChecking?.();
      unsubAvailable?.();
      unsubNotAvailable?.();
      unsubError?.();
      unsubProgress?.();
      unsubDownloaded?.();
    };
  }, []);

  const isDownloading = progress !== null && progress < 100;

  const startUpdateNow = () => {
    setIsUpdateDialogOpen(false);
    setStatus("Starting download…");
    setProgress(0);
    window.electronAPI.updaterDownload();
  };

  return (
    <>
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Available</DialogTitle>
            <DialogDescription>
              A new version is available ({updateVersionLabel}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              disabled={isDownloading}
            >
              Not now
            </Button>
            <Button onClick={startUpdateNow} disabled={isDownloading}>
              Update Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="z-40 border-t border-border/70 bg-background/80 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="font-display font-medium text-foreground/80">
              Emote Overlay Tools {version ? `v${version}` : "(dev)"}
            </span>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <span className="hidden sm:inline">made by G‑Force</span>
            {status && (
              <span className="opacity-80">{status}</span>
            )}
            <button
              type="button"
              className="rounded border border-border/80 px-2 py-0.5 transition-colors hover:bg-accent"
              onClick={() => {
                pendingCheckIsManualRef.current = true;
                window.electronAPI.updaterCheck({ silent: false });
              }}
            >
              Check for updates
            </button>
            {hasUpdate && !isDownloading && !hasTriggeredInstallRef.current && (
              <button
                type="button"
                className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary transition-colors hover:bg-primary/20"
                onClick={() => {
                  setIsUpdateDialogOpen(true);
                }}
              >
                Update Now
              </button>
            )}
          </div>

          {saveAction ? <div className="shrink-0">{saveAction}</div> : null}
        </div>
      </footer>
    </>
  );
}
