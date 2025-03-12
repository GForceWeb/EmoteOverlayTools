import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import { Button } from "@/admin/components/ui/button";
import { RefreshCwIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { PreviewControls } from "@/admin/components/preview-controls";
import type { Settings } from "@/shared/types";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string;
  onRefresh: () => void;
  sidebarPlaceholderRef: RefObject<HTMLDivElement>;
  settings: Settings;
  onPreview: (type: "feature" | "animation", name: string, config: any) => void;
}

export function PreviewModal({
  isOpen,
  onClose,
  previewUrl,
  onRefresh,
  sidebarPlaceholderRef,
  settings,
  onPreview,
}: PreviewModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const modalPlaceholderRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);

  // Enhanced effect for modal position handling
  useEffect(() => {
    // Enhanced positioning for modal view
    const positionIframeInModal = () => {
      const iframe = document.getElementById("overlay-iframe");
      const container = document.getElementById("floating-preview-container");

      if (!isOpen || !iframe || !container || !modalPlaceholderRef.current)
        return;

      try {
        // Set modal active class
        container.classList.add("modal-active");

        // Get modal placeholder dimensions
        const modalRect = modalPlaceholderRef.current.getBoundingClientRect();

        if (modalRect.width === 0 || modalRect.height === 0) {
          console.warn("Modal placeholder has zero dimensions, retrying...");
          setTimeout(positionIframeInModal, 50);
          return;
        }

        // Calculate scale to fit the iframe (1920x1080) into the modal placeholder
        const scaleX = modalRect.width / 1920;
        const scaleY = modalRect.height / 1080;
        const scale = Math.min(scaleX, scaleY);

        // Center the iframe in the modal placeholder
        const leftOffset =
          modalRect.left + (modalRect.width - 1920 * scale) / 2;
        const topOffset = modalRect.top + (modalRect.height - 1080 * scale) / 2;

        // Apply the transformation with a slight delay to ensure smooth transition
        setTimeout(() => {
          iframe.style.transform = `translate(${leftOffset}px, ${topOffset}px) scale(${scale})`;
          iframe.style.opacity = "1";

          // Store positioning data
          container.dataset.modalScale = String(scale);
          container.dataset.modalLeft = String(leftOffset);
          container.dataset.modalTop = String(topOffset);
        }, 10);
      } catch (error) {
        console.error("Error positioning iframe in modal:", error);
      }
    };

    // If modal is open, position the iframe
    if (isOpen) {
      // Small delay to ensure modal is fully rendered
      setTimeout(positionIframeInModal, 50);

      // Add event listeners for resizing and scrolling
      window.addEventListener("resize", positionIframeInModal);
      window.addEventListener("scroll", positionIframeInModal);

      // Use ResizeObserver if available
      if (modalPlaceholderRef.current && window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
          positionIframeInModal();
        });

        resizeObserver.observe(modalPlaceholderRef.current);

        return () => {
          returnIframeToSidebar();
          window.removeEventListener("resize", positionIframeInModal);
          window.removeEventListener("scroll", positionIframeInModal);
          resizeObserver.disconnect();
        };
      }

      return () => {
        returnIframeToSidebar();
        window.removeEventListener("resize", positionIframeInModal);
        window.removeEventListener("scroll", positionIframeInModal);
      };
    }
  }, [isOpen, sidebarPlaceholderRef]);

  // Function to return the iframe to sidebar position
  const returnIframeToSidebar = () => {
    const iframe = document.getElementById("overlay-iframe");
    const container = document.getElementById("floating-preview-container");

    if (!iframe || !container || !sidebarPlaceholderRef.current) return;

    try {
      // Remove modal active class
      container.classList.remove("modal-active");

      const sidebarRect = sidebarPlaceholderRef.current.getBoundingClientRect();

      // Calculate scale for sidebar view
      const scaleX = sidebarRect.width / 1920;
      const scaleY = sidebarRect.height / 1080;
      const scale = Math.min(scaleX, scaleY);

      // Center in sidebar
      const leftOffset =
        sidebarRect.left + (sidebarRect.width - 1920 * scale) / 2;
      const topOffset =
        sidebarRect.top + (sidebarRect.height - 1080 * scale) / 2;

      // Apply the transformation
      iframe.style.transform = `translate(${leftOffset}px, ${topOffset}px) scale(${scale})`;
    } catch (error) {
      console.error("Error returning iframe to sidebar:", error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        ref={modalContentRef}
        className="max-w-[90vw] w-[1200px] max-h-[90vh] flex flex-col p-0 gap-0 rounded-lg overflow-hidden"
      >
        <DialogHeader className="px-4 py-2 flex flex-row items-center justify-between border-b bg-background">
          <DialogTitle className="text-foreground">
            Expanded Preview
          </DialogTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="mr-2"
            >
              {showControls ? "Hide Controls" : "Show Controls"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              title="Refresh preview"
            >
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Close preview"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row w-full h-full">
          {showControls && (
            <div className="w-full md:w-64 border-r border-border bg-card p-4 overflow-y-auto">
              <PreviewControls settings={settings} onPreview={onPreview} />
            </div>
          )}
          {/* This is a placeholder that helps position our fixed iframe */}
          <div
            ref={modalPlaceholderRef}
            className="relative w-full flex-grow bg-black overflow-hidden"
            style={{ height: "calc(90vh - 60px)" }}
            data-testid="modal-preview-placeholder"
          >
            {/* Content will be positioned here via the fixed iframe */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
