import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/admin/components/ui/dialog"
import { Button } from "@/admin/components/ui/button"
import { RefreshCwIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState, type RefObject } from "react"
import { PreviewControls } from "@/admin/components/preview-controls"
import type { Settings } from "@/shared/types"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewUrl: string
  onRefresh: () => void
  iframeRef: RefObject<HTMLIFrameElement>
  settings: Settings
  onPreview: (type: "feature" | "animation", name: string, config: any) => void
}

export function PreviewModal({
  isOpen,
  onClose,
  previewUrl,
  onRefresh,
  iframeRef,
  settings,
  onPreview,
}: PreviewModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null)
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(true)

  // This effect handles moving the iframe between containers
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return

    // Store the original parent to move the iframe back later
    const iframe = iframeRef.current
    const originalParent = iframe.parentElement

    // Only move the iframe if the container is ready
    if (iframeContainerRef.current) {
      iframeContainerRef.current.appendChild(iframe)
    }

    // Cleanup function to move iframe back when modal closes
    return () => {
      // Check if the iframe is still in the modal container before moving it back
      if (iframe.parentElement === iframeContainerRef.current && originalParent) {
        originalParent.appendChild(iframe)
      }
    }
  }, [isOpen, iframeRef])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalContentRef}
        className="max-w-[90vw] w-[1200px] max-h-[90vh] flex flex-col p-0 gap-0 rounded-lg overflow-hidden"
      >
        <DialogHeader className="px-4 py-2 flex flex-row items-center justify-between border-b bg-background">
          <DialogTitle className="text-foreground">Expanded Preview</DialogTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => setShowControls(!showControls)} className="mr-2">
              {showControls ? "Hide Controls" : "Show Controls"}
            </Button>
            <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh preview">
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} title="Close preview">
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
          <div
            ref={iframeContainerRef}
            className="relative w-full flex-grow bg-black"
            style={{ height: showControls ? "calc(90vh - 60px)" : "calc(90vh - 60px)" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

