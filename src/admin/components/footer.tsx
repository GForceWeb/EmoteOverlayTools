import React, { useEffect, useState } from "react";

export function Footer() {
  const [version, setVersion] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number | null>(null);
  const [hasUpdate, setHasUpdate] = useState<any | null>(null);

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
      setStatus("Checking for updates…");
      setHasUpdate(null);
      setProgress(null);
    });
    const unsubAvailable = window.electronAPI.onUpdaterAvailable((info) => {
      if (!isMounted) return;
      setStatus(`Update available: v${info?.version ?? "?"}`);
      setHasUpdate(info);
    });
    const unsubNotAvailable = window.electronAPI.onUpdaterNotAvailable(() => {
      if (!isMounted) return;
      setStatus("You're up to date");
      setHasUpdate(null);
    });
    const unsubError = window.electronAPI.onUpdaterError((message) => {
      if (!isMounted) return;
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
      setStatus("Ready to install");
    });
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

  return (
    <footer className="mt-8 text-center text-muted-foreground text-xs">
      <div className="container mx-auto max-w-7xl py-4 border-t">
        <div className="flex flex-col gap-2 items-center justify-center">
          <span>
            Emote Overlay Tools {version ? `v${version}` : "(dev)"} — made by G‑Force
          </span>
          <div className="flex flex-wrap gap-2 items-center">
            {status && <span className="text-[11px] opacity-80">{status}</span>}
            <button
              className="px-2 py-1 border rounded hover:bg-accent text-[11px]"
              onClick={() => window.electronAPI.updaterCheck()}
            >
              Check for updates
            </button>
            {hasUpdate && (
              <>
                <button
                  className="px-2 py-1 border rounded hover:bg-accent text-[11px]"
                  onClick={() => window.electronAPI.updaterDownload()}
                >
                  Download update
                </button>
                <button
                  className="px-2 py-1 border rounded hover:bg-accent text-[11px]"
                  onClick={() => window.electronAPI.updaterQuitAndInstall()}
                  disabled={progress !== null && progress < 100}
                >
                  Install & Restart
                </button>
              </>
            )}
            {/* Testing aid visible in dev and packaged: */}
            <button
              className="px-2 py-1 border rounded hover:bg-accent text-[11px]"
              onClick={() => window.electronAPI.updaterSimulate()}
            >
              Simulate update
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


