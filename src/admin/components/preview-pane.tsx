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
      // Use the actual available height instead of the padding-based height
      const availableHeight = sidebarRect.height;
      const scaleX = sidebarRect.width / 1920;
      const scaleY = availableHeight / 1080;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

      // Center the iframe in the placeholder
      const leftOffset =
        sidebarRect.left + (sidebarRect.width - 1920 * scale) / 2;
      const topOffset =
        sidebarRect.top + (availableHeight - 1080 * scale) / 2;

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

    // Watch for layout changes in the entire sidebar
    let sidebarContainer: Element | null = null;
    if (sidebarPlaceholderRef.current) {
      // Find the sidebar container (parent of the preview pane)
      sidebarContainer = sidebarPlaceholderRef.current.closest('.lg\\:col-span-2');
    }

    // Check for ResizeObserver and use it if available
    if (sidebarPlaceholderRef.current && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        positionIframeInSidebar();
      });

      resizeObserver.observe(sidebarPlaceholderRef.current);

      // Also observe the sidebar container to detect layout changes from other cards
      if (sidebarContainer && sidebarContainer !== sidebarPlaceholderRef.current) {
        resizeObserver.observe(sidebarContainer);
      }

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

  // Watch for DOM changes that might affect layout
  useEffect(() => {
    if (!iframeLoaded) return;

    let sidebarContainer: Element | null = null;
    if (sidebarPlaceholderRef.current) {
      sidebarContainer = sidebarPlaceholderRef.current.closest('.lg\\:col-span-2');
    }

    if (sidebarContainer && window.MutationObserver) {
      const mutationObserver = new MutationObserver((mutations) => {
        // Check if any mutations might affect layout
        const shouldReposition = mutations.some(mutation => {
          // Reposition if nodes were added/removed or attributes changed
          return mutation.type === 'childList' || 
                 (mutation.type === 'attributes' && 
                  (mutation.attributeName === 'class' || mutation.attributeName === 'style'));
        });

        if (shouldReposition) {
          // Small delay to allow layout to settle
          setTimeout(positionIframeInSidebar, 50);
        }
      });

      mutationObserver.observe(sidebarContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      return () => {
        mutationObserver.disconnect();
      };
    }
  }, [iframeLoaded]);

  // Additional effect to reposition iframe when URL changes (which might affect layout)
  useEffect(() => {
    if (iframeLoaded) {
      // Small delay to allow layout to settle after URL change
      setTimeout(positionIframeInSidebar, 100);
    }
  }, [url, iframeLoaded]);

  // Listen for global layout change events
  useEffect(() => {
    if (!iframeLoaded) return;

    const handleLayoutChange = () => {
      // Small delay to allow layout to settle
      setTimeout(positionIframeInSidebar, 100);
    };

    // Listen for custom layout change events
    window.addEventListener('layout-change', handleLayoutChange);
    
    // Also listen for window focus which might indicate layout changes
    window.addEventListener('focus', handleLayoutChange);

    return () => {
      window.removeEventListener('layout-change', handleLayoutChange);
      window.removeEventListener('focus', handleLayoutChange);
    };
  }, [iframeLoaded]);

  // Expose reposition function globally for manual triggering
  useEffect(() => {
    if (iframeLoaded) {
      // Make the reposition function available globally
      (window as any).repositionPreviewIframe = positionIframeInSidebar;
      
      return () => {
        delete (window as any).repositionPreviewIframe;
      };
    }
  }, [iframeLoaded]);

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
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
          {/* This is a placeholder that helps position our fixed iframe */}
          <div
            ref={sidebarPlaceholderRef}
            className="relative w-full flex-1 min-h-0"
            style={{ 
              paddingTop: "56.25%", /* 16:9 Aspect Ratio */
              maxHeight: "calc(100vh - 400px)" /* Limit maximum height */
            }}
            data-testid="sidebar-preview-placeholder"
          >
            {/* Content will be positioned here via the fixed iframe */}
          </div>
        </CardContent>
      </Card>

      {/* Fixed position iframe that moves between sidebar and modal via CSS */}
      <div
        className={`fixed top-0 left-0 w-0 h-0 pointer-events-none ${
          isModalOpen ? "z-[60] modal-active" : "z-[40]"
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
