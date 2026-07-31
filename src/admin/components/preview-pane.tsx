import React from "react";
import { MaximizeIcon, Minimize2, RefreshCwIcon, Eye } from "lucide-react";
import { Button } from "@/admin/components/ui/button";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PreviewModal } from "@/admin/components/preview-modal";
import type { Settings } from "@/shared/types";
import { cn } from "@/admin/lib/utils";

type PreviewPosition = { x: number; y: number };

const PREVIEW_POSITION_KEY = "eot-preview-position";
const PANEL_WIDTH = 340;
const PANEL_MARGIN = 16;
const FOOTER_CLEARANCE = 56;
const HEADER_CLEARANCE = 56;
const MINIMIZED_WIDTH = 140;
const MINIMIZED_HEIGHT = 40;
const DEFAULT_PANEL_HEIGHT = 260;

function toPreviewUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("preview", "1");
    return url.toString();
  } catch {
    const join = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${join}preview=1`;
  }
}

function clampPosition(
  pos: PreviewPosition,
  size: { width: number; height: number }
): PreviewPosition {
  const maxX = Math.max(PANEL_MARGIN, window.innerWidth - size.width - PANEL_MARGIN);
  const maxY = Math.max(
    HEADER_CLEARANCE,
    window.innerHeight - size.height - FOOTER_CLEARANCE
  );

  return {
    x: Math.min(Math.max(PANEL_MARGIN, pos.x), maxX),
    y: Math.min(Math.max(HEADER_CLEARANCE, pos.y), maxY),
  };
}

function defaultPosition(size: { width: number; height: number }): PreviewPosition {
  return clampPosition(
    {
      x: window.innerWidth - size.width - PANEL_MARGIN,
      y: window.innerHeight - size.height - FOOTER_CLEARANCE,
    },
    size
  );
}

function loadPosition(size: { width: number; height: number }): PreviewPosition {
  try {
    const stored = localStorage.getItem(PREVIEW_POSITION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PreviewPosition;
      if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
        return clampPosition(parsed, size);
      }
    }
  } catch {
    // ignore
  }
  return defaultPosition(size);
}

interface PreviewPaneProps {
  previewUrl: string;
  settings: Settings;
  onSettingsChange?: (settings: Settings) => void;
  visible?: boolean;
}

export function PreviewPane({
  previewUrl,
  settings,
  onSettingsChange,
  visible = true,
}: PreviewPaneProps) {
  const [url, setUrl] = useState(() => toPreviewUrl(previewUrl));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [position, setPosition] = useState<PreviewPosition>(() =>
    typeof window === "undefined"
      ? { x: PANEL_MARGIN, y: HEADER_CLEARANCE }
      : loadPosition({ width: PANEL_WIDTH, height: DEFAULT_PANEL_HEIGHT })
  );
  const [isDragging, setIsDragging] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const didDragRef = useRef(false);
  const [floatHostElement, setFloatHostElement] =
    useState<HTMLDivElement | null>(null);
  const [modalHostElement, setModalHostElement] =
    useState<HTMLDivElement | null>(null);
  const [hiddenHostElement, setHiddenHostElement] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    setUrl(toPreviewUrl(previewUrl));
  }, [previewUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_POSITION_KEY, JSON.stringify(position));
    } catch {
      // ignore
    }
  }, [position]);

  const getCurrentSize = useCallback(() => {
    if (isMinimized) {
      return { width: MINIMIZED_WIDTH, height: MINIMIZED_HEIGHT };
    }
    const rect = panelRef.current?.getBoundingClientRect();
    return {
      width: rect?.width || PANEL_WIDTH,
      height: rect?.height || DEFAULT_PANEL_HEIGHT,
    };
  }, [isMinimized]);

  useEffect(() => {
    const onResize = () => {
      setPosition((current) => clampPosition(current, getCurrentSize()));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getCurrentSize]);

  useEffect(() => {
    const iframe = document.createElement("iframe");

    iframe.id = "overlay-iframe";
    iframe.title = "Twitch Overlay Preview";
    iframe.className = "size-full border-0 bg-black";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const handleLoad = () => {
      setIframeLoaded(true);
    };

    iframe.addEventListener("load", handleLoad);
    iframeRef.current = iframe;
    setIframeLoaded(false);
    iframe.src = toPreviewUrl(previewUrl);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.remove();
      iframeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return;
    }

    if (iframe.getAttribute("src") !== url) {
      setIframeLoaded(false);
      iframe.src = url;
    }
  }, [url]);

  useLayoutEffect(() => {
    const iframe = iframeRef.current;
    const showFloat = visible && !isMinimized && !isModalOpen;

    let targetHost: HTMLDivElement | null = null;
    if (isModalOpen) {
      targetHost = modalHostElement;
    } else if (showFloat) {
      targetHost = floatHostElement;
    } else {
      targetHost = hiddenHostElement;
    }

    if (!iframe || !targetHost || iframe.parentElement === targetHost) {
      return;
    }

    targetHost.appendChild(iframe);
  }, [
    visible,
    isMinimized,
    isModalOpen,
    floatHostElement,
    modalHostElement,
    hiddenHostElement,
  ]);

  const refreshPreview = () => {
    if (!iframeRef.current) {
      return;
    }

    setIframeLoaded(false);
    // Reassign src instead of location.reload() — admin (e.g. :3000) and
    // overlay iframe (e.g. :3030) are cross-origin in dev.
    iframeRef.current.src = url;
  };

  const onDragStart = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest("button:not([data-preview-drag-handle])")) return;

    event.preventDefault();
    const handle = event.currentTarget;
    const pointerId = event.pointerId;

    didDragRef.current = false;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: event.clientX - positionRef.current.x,
      y: event.clientY - positionRef.current.y,
    };

    const size = getCurrentSize();
    const startX = event.clientX;
    const startY = event.clientY;

    // Keep receiving events even when the cursor leaves the header
    // (e.g. clamped against the window edge).
    try {
      handle.setPointerCapture(pointerId);
    } catch {
      // Some environments may reject capture; window listeners still help.
    }

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      if (
        Math.abs(moveEvent.clientX - startX) > 3 ||
        Math.abs(moveEvent.clientY - startY) > 3
      ) {
        didDragRef.current = true;
      }

      setPosition(
        clampPosition(
          {
            x: moveEvent.clientX - dragOffsetRef.current.x,
            y: moveEvent.clientY - dragOffsetRef.current.y,
          },
          size
        )
      );
    };

    let ended = false;

    const endDrag = (endEvent?: Event) => {
      if (ended) return;
      if (
        endEvent &&
        "pointerId" in endEvent &&
        (endEvent as PointerEvent).pointerId !== pointerId
      ) {
        return;
      }

      ended = true;
      setIsDragging(false);

      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", endDrag);
      handle.removeEventListener("pointercancel", endDrag);
      handle.removeEventListener("lostpointercapture", endDrag);
      window.removeEventListener("pointerup", endDrag, true);
      window.removeEventListener("pointercancel", endDrag, true);
      window.removeEventListener("blur", endDrag);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      try {
        if (handle.hasPointerCapture?.(pointerId)) {
          handle.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        endDrag();
      }
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
    handle.addEventListener("lostpointercapture", endDrag);
    // Capture-phase window listeners as a safety net when the cursor
    // leaves the Electron window or the original target.
    window.addEventListener("pointerup", endDrag, true);
    window.addEventListener("pointercancel", endDrag, true);
    window.addEventListener("blur", endDrag);
    document.addEventListener("visibilitychange", onVisibilityChange);
  };

  const floatingStyle: React.CSSProperties = {
    left: position.x,
    top: position.y,
    right: "auto",
    bottom: "auto",
  };

  return (
    <>
      <div
        ref={setHiddenHostElement}
        className="pointer-events-none fixed -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      />

      {visible && isMinimized && (
        <button
          type="button"
          data-preview-drag-handle
          onPointerDown={onDragStart}
          onClick={() => {
            if (didDragRef.current) return;
            setIsMinimized(false);
          }}
          style={floatingStyle}
          className={cn(
            "panel-surface fixed z-30 flex cursor-grab items-center gap-2 px-3 py-2 text-xs font-medium text-foreground shadow-xl transition-colors hover:border-primary/50 hover:bg-accent/40 active:cursor-grabbing",
            isDragging && "cursor-grabbing select-none"
          )}
          title="Drag to move · Click to expand"
        >
          <Eye className="h-3.5 w-3.5 text-primary" />
          Live Preview
        </button>
      )}

      {visible && !isMinimized && (
        <div
          ref={panelRef}
          style={floatingStyle}
          className={cn(
            "panel-surface fixed z-30 w-[min(100%-2rem,340px)] overflow-hidden shadow-2xl shadow-black/50",
            isDragging && "select-none"
          )}
        >
          <div
            onPointerDown={onDragStart}
            className={cn(
              "flex cursor-grab items-center justify-between border-b border-border/70 px-3 py-2 active:cursor-grabbing",
              isDragging && "cursor-grabbing"
            )}
            title="Drag to move preview"
          >
            <div className="min-w-0">
              <p className="font-display text-xs font-semibold tracking-tight">
                Live Preview
              </p>
              <p className="text-[10px] text-muted-foreground">
                Drag header to reposition
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={refreshPreview}
                title="Refresh preview"
              >
                <RefreshCwIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsModalOpen(true)}
                title="Expand preview"
              >
                <MaximizeIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsMinimized(true)}
                title="Minimize preview"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="p-2">
            <div
              className="relative aspect-video w-full overflow-hidden rounded-md border border-border/60 bg-black"
              data-testid="sidebar-preview-host"
              ref={setFloatHostElement}
            >
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  Loading preview...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={refreshPreview}
        previewHostRef={setModalHostElement}
        settings={settings}
        onSettingsChange={onSettingsChange}
        isPreviewReady={iframeLoaded}
      />
    </>
  );
}
