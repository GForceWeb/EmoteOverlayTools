import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin/components/ui/card";
import { RefreshCwIcon, MaximizeIcon } from "lucide-react";
import { Button } from "@/admin/components/ui/button";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PreviewModal } from "@/admin/components/preview-modal";
import type { Settings } from "@/shared/types";

interface PreviewPaneProps {
  previewUrl: string;
  settings: Settings;
  onSettingsChange?: (settings: Settings) => void;
}

function withPreviewSource(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    // Load the overlay page directly so a "/" redirect can't drop ?source=preview
    if (parsed.pathname === "/" || parsed.pathname === "") {
      parsed.pathname = "/overlay/index.html";
    }
    parsed.searchParams.set("source", "preview");
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}source=preview`;
  }
}

export function PreviewPane({ previewUrl, settings, onSettingsChange }: PreviewPaneProps) {
  const [url, setUrl] = useState(() => withPreviewSource(previewUrl));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [sidebarHostElement, setSidebarHostElement] = useState<HTMLDivElement | null>(null);
  const [modalHostElement, setModalHostElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setUrl(withPreviewSource(previewUrl));
  }, [previewUrl]);

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
    iframe.src = withPreviewSource(previewUrl);

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
    const targetHost = isModalOpen ? modalHostElement : sidebarHostElement;

    if (!iframe || !targetHost || iframe.parentElement === targetHost) {
      return;
    }

    targetHost.appendChild(iframe);
  }, [isModalOpen, modalHostElement, sidebarHostElement]);

  const refreshPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    setIframeLoaded(false);

    // Admin (e.g. :3000) and overlay (:3030) are cross-origin, so
    // contentWindow.location.reload() throws. Reassign src instead.
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("_", String(Date.now()));
      iframe.src = parsed.toString();
    } catch {
      iframe.src = url;
    }
  };

  return (
    <>
      <Card className="flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>Live Preview</CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshPreview}
                title="Refresh preview"
              >
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(true)}
                title="Expand preview"
              >
                <MaximizeIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Preview your overlay animations and features
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col">
          <div
            className="relative mx-auto aspect-video w-full overflow-hidden rounded-md border bg-black"
            data-testid="sidebar-preview-host"
            ref={setSidebarHostElement}
          >
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                Loading preview...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
