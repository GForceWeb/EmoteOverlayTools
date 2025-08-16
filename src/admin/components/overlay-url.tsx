"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/admin/components/ui/card";
import { Input } from "@/admin/components/ui/input";
import { Button } from "@/admin/components/ui/button";
import { useToast } from "@/admin/hooks/use-toast";
import { Copy, ChevronDown, ChevronUp, Check } from "lucide-react";

interface OverlayUrlProps {
  url: string;
}

export function OverlayUrl({ url }: OverlayUrlProps) {
  const { toast } = useToast();
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast({
        title: "Copied",
        description: "Overlay URL copied to clipboard.",
      });
      
      // Reset the icon after 1.5 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
    
    // Trigger layout change event for preview iframe repositioning
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('layout-change'));
    }, 50);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Step 2: Add Overlay to OBS</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleInstructions}
            className="h-8 w-8 p-0"
          >
            {showInstructions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showInstructions && (
          <div className="text-sm text-muted-foreground mb-4">
            <p className="mb-2">In OBS Studio:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Right-click in the Sources panel and select "Add" → "Browser"</li>
              <li>Give it a name (e.g., "Emote Overlay Tools")</li>
              <li>Paste the URL below</li>
              <li>Set width/height to your canvas size</li>
              <li>Click "OK" to add the source</li>
            </ol>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Overlay URL:</div>
          <div className="flex gap-2">
            <Input value={url} readOnly className="font-mono" />
            <Button 
              onClick={handleCopy} 
              aria-label="Copy overlay URL" 
              size="icon" 
              variant={isCopied ? "default" : "outline"}
              className={`transition-all duration-200 ${isCopied ? 'bg-green-600 hover:bg-green-700' : ''}`}
              title="Copy URL"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


