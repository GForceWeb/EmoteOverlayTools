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
  onPreview: (type: "feature" | "animation", name: string, config: any) => void;
}

export function PreviewPane({
  previewUrl,
  settings,
  onPreview,
}: PreviewPaneProps) {
  const [url, setUrl] = useState(previewUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUrl(previewUrl);
  }, [previewUrl]);

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  return (
    <>
      <Card className={`h-full ${isModalOpen ? "hidden" : "block"}`}>
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
          <div
            className="relative w-full"
            style={{ paddingTop: "56.25%" /* 16:9 Aspect Ratio */ }}
          >
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                  width: "200%",
                  height: "200%",
                }}
              >
                <iframe
                  id="overlay-iframe"
                  ref={iframeRef}
                  src={url}
                  className="absolute top-0 left-0 border-0 rounded-md bg-black"
                  title="Twitch Overlay Preview"
                  style={{
                    width: "1920px",
                    height: "1080px",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Preview URL: {url}
          </p>
        </CardContent>
      </Card>

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        previewUrl={url}
        onRefresh={refreshPreview}
        iframeRef={iframeRef}
        settings={settings}
        onPreview={onPreview}
      />
    </>
  );
}
