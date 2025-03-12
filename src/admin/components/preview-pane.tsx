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
import { useState, useRef, useEffect } from "react";
import { PreviewModal } from "@/admin/components/preview-modal";
import type { Settings } from "@/shared/types";

interface PreviewPaneProps {
  previewUrl: string;
  settings: Settings;
}

export function PreviewPane({ previewUrl, settings }: PreviewPaneProps) {
  const [url, setUrl] = useState(previewUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sidebarPlaceholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(previewUrl);
  }, [previewUrl]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    // Position iframe after it's loaded
    positionIframeInSidebar();
  };

  // Position iframe function - extracted to be called from multiple places
  const positionIframeInSidebar = () => {
    const iframe = document.getElementById("overlay-iframe");
    const container = document.getElementById("floating-preview-container");

    if (!sidebarPlaceholderRef.current || !iframe || !container) return;

    try {
      const sidebarRect = sidebarPlaceholderRef.current.getBoundingClientRect();

      if (sidebarRect.width === 0 || sidebarRect.height === 0) {
        console.warn(
          "Sidebar placeholder has zero dimensions, delaying positioning"
        );
        setTimeout(positionIframeInSidebar, 300);
        return;
      }

      // Calculate scale to fit 1920x1080 into the sidebar placeholder
      const scaleX = sidebarRect.width / 1920;
      const scaleY = sidebarRect.height / 1080;
      const scale = Math.min(scaleX, scaleY);

      // Center the iframe in the placeholder
      const leftOffset =
        sidebarRect.left + (sidebarRect.width - 1920 * scale) / 2;
      const topOffset =
        sidebarRect.top + (sidebarRect.height - 1080 * scale) / 2;

      // Apply the transformation - make sure to set explicit initial values
      iframe.style.transform = `translate(${leftOffset}px, ${topOffset}px) scale(${scale})`;
      iframe.style.opacity = "1"; // Ensure visibility

      // Update data attributes
      container.dataset.currentScale = String(scale);
      container.dataset.leftOffset = String(leftOffset);
      container.dataset.topOffset = String(topOffset);
    } catch (error) {
      console.error("Error positioning iframe:", error);
    }
  };

  // Enhanced effect to position the iframe on load, scroll, and window resize
  useEffect(() => {
    if (!iframeLoaded) return; // Only run after iframe has loaded

    // Position immediately when component mounts
    positionIframeInSidebar();

    // Add event listeners for scroll and resize
    window.addEventListener("resize", positionIframeInSidebar);
    window.addEventListener("scroll", positionIframeInSidebar);

    // Check for ResizeObserver and use it if available
    if (sidebarPlaceholderRef.current && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        positionIframeInSidebar();
      });

      resizeObserver.observe(sidebarPlaceholderRef.current);

      return () => {
        window.removeEventListener("resize", positionIframeInSidebar);
        window.removeEventListener("scroll", positionIframeInSidebar);
        resizeObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener("resize", positionIframeInSidebar);
      window.removeEventListener("scroll", positionIframeInSidebar);
    };
  }, [iframeLoaded]);

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
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
        <CardContent>
          {/* This is a placeholder that helps position our fixed iframe */}
          <div
            ref={sidebarPlaceholderRef}
            className="relative w-full"
            style={{ paddingTop: "56.25%" /* 16:9 Aspect Ratio */ }}
            data-testid="sidebar-preview-placeholder"
          >
            {/* Content will be positioned here via the fixed iframe */}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Preview URL: {url}
          </p>
        </CardContent>
      </Card>

      {/* Fixed position iframe that moves between sidebar and modal via CSS */}
      <div
        className={`fixed top-0 left-0 w-0 h-0 z-[9999] pointer-events-none ${
          isModalOpen ? "modal-active" : ""
        }`}
        id="floating-preview-container"
      >
        <iframe
          id="overlay-iframe"
          ref={iframeRef}
          src={url}
          className="absolute border-0 rounded-md bg-black pointer-events-auto"
          title="Twitch Overlay Preview"
          style={{
            width: "1920px",
            height: "1080px",
            opacity: "0", // Start hidden, will be shown once positioned
            transformOrigin: "top left",
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      </div>

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        previewUrl={url}
        onRefresh={refreshPreview}
        sidebarPlaceholderRef={sidebarPlaceholderRef}
        settings={settings}
      />
    </>
  );
}
