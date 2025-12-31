import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/dialog";
import { Button } from "@/admin/components/ui/button";

export function Footer() {
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
    
    // Subscribe to updater events
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
      // Avoid noisy errors for the automatic (silent) check on launch.
      if (!lastCheckWasManualRef.current) return;
      setStatus(`Update error: ${message}`);
    });
    const unsubProgress = window.electronAPI.onUpdaterProgress((p) => {
      if (!isMounted) return;
      const pct = typeof p?.percent === 'number' ? Math.max(0, Math.min(100, p.percent)) : null;
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

    // Auto-check on launch (quiet when up-to-date).
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

      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background text-center text-muted-foreground text-xs">
        <div className="mx-auto max-w-7xl py-4 border-t px-4 md:px-8">
          <div className="flex flex-col gap-2 items-center justify-center">
            <span>
              Emote Overlay Tools {version ? `v${version}` : "(dev)"} — made by G‑Force
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {status && <span className="text-[11px] opacity-80">{status}</span>}
              <button
                className="px-2 py-1 border rounded hover:bg-accent text-[11px]"
                onClick={() => {
                  pendingCheckIsManualRef.current = true;
                  window.electronAPI.updaterCheck({ silent: false });
                }}
              >
                Check for updates
              </button>

              {hasUpdate && !isDownloading && !hasTriggeredInstallRef.current && (
                <button
                  className="px-2 py-1 border rounded hover:bg-accent text-[11px]"
                  onClick={() => {
                    setIsUpdateDialogOpen(true);
                  }}
                >
                  Update Now
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}


