import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import { Button } from "@/admin/components/ui/button";
import { RefreshCwIcon, XIcon } from "lucide-react";
import { useRef, useState, type RefCallback } from "react";
import { PreviewControls } from "@/admin/components/preview-controls";
import type { Settings } from "@/shared/types";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  previewHostRef: RefCallback<HTMLDivElement>;
  settings: Settings;
  onSettingsChange?: (settings: Settings) => void;
  isPreviewReady: boolean;
}

export function PreviewModal({
  isOpen,
  onClose,
  onRefresh,
  previewHostRef,
  settings,
  onSettingsChange,
  isPreviewReady,
}: PreviewModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);

  const handleToggleControls = () => {
    setShowControls(!showControls);
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
        hideCloseButton={true}
      >
        <DialogHeader className="px-4 py-2 flex flex-row items-center justify-between border-b bg-background">
          <DialogTitle className="text-foreground">
            Expanded Preview
          </DialogTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleControls}
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

        <div className="flex flex-1 flex-col md:flex-row w-full min-h-0">
          {showControls && (
            <div className="w-full md:w-64 border-r border-border bg-card p-4 overflow-y-auto">
              <PreviewControls settings={settings} onSettingsChange={onSettingsChange} />
            </div>
          )}
          <div
            className="flex flex-1 min-h-[320px] items-center justify-center overflow-auto bg-muted/20 p-4 md:p-6"
          >
            <div
              className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-md border bg-black"
              data-testid="modal-preview-host"
              ref={previewHostRef}
            >
              {!isPreviewReady && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Loading preview...
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
