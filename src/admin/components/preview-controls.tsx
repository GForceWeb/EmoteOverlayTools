"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/admin/components/ui/button";
import { Label } from "@/admin/components/ui/label";
import { Input } from "@/admin/components/ui/input";
import { Slider } from "@/admin/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/admin/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { PlayIcon } from "lucide-react";
import type { Settings } from "@/shared/types";
import {
  previewAnimation,
  previewFeature,
} from "@/admin/utils/preview-helpers";

interface PreviewControlsProps {
  settings: Settings;
}

export function PreviewControls({ settings }: PreviewControlsProps) {
  const [activeTab, setActiveTab] = useState<"feature" | "animation">(
    "animation"
  );
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [tempConfig, setTempConfig] = useState<any>(null);

  // Reset selected item when tab changes
  useEffect(() => {
    setSelectedItem("");
    setTempConfig(null);
  }, [activeTab]);

  // Update temp config when selected item changes
  useEffect(() => {
    if (!selectedItem) {
      setTempConfig(null);
      return;
    }

    if (activeTab === "feature" && selectedItem in settings.features) {
      setTempConfig({
        ...settings.features[selectedItem as keyof Settings["features"]],
      });
    } else if (
      activeTab === "animation" &&
      selectedItem in settings.animations
    ) {
      setTempConfig({
        ...settings.animations[selectedItem as keyof Settings["animations"]],
      });
    }
  }, [selectedItem, activeTab, settings]);

  const handlePreview = () => {
    if (!selectedItem || !tempConfig) return;

    if (activeTab === "animation") {
      previewAnimation(selectedItem, tempConfig, settings);
    } else if (activeTab === "feature") {
      previewFeature(selectedItem, tempConfig, settings);
    }
  };

  const updateTempConfig = (key: string, value: any) => {
    setTempConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Preview Controls</h3>
      <p className="text-sm text-muted-foreground">
        Select and customize a feature or animation to preview
      </p>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "feature" | "animation")
        }
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="feature">Features</TabsTrigger>
          <TabsTrigger value="animation">Animations</TabsTrigger>
        </TabsList>

        <TabsContent value="feature" className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="feature-select">Select Feature</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger id="feature-select">
                <SelectValue placeholder="Select a feature" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(settings.features)
                  .filter(
                    (feature) =>
                      feature !== "emoterain" && feature !== "kappagen"
                  )
                  .map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {tempConfig && (
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={handlePreview}
                disabled={!selectedItem}
              >
                <PlayIcon className="mr-2 h-4 w-4" />
                Preview{" "}
                {selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1)}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="animation" className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="animation-select">Select Animation</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger id="animation-select">
                <SelectValue placeholder="Select an animation" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(settings.animations).map((animation) => (
                  <SelectItem key={animation} value={animation}>
                    {animation.charAt(0).toUpperCase() + animation.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tempConfig && selectedItem === "text" && (
            <div className="space-y-2">
              <Label htmlFor="text-value">Text</Label>
              <Input
                id="text-value"
                value={tempConfig.text || ""}
                onChange={(e) => updateTempConfig("text", e.target.value)}
                placeholder="Enter text to display"
              />
            </div>
          )}

          {tempConfig && selectedItem !== "text" && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="count-value">Count: {tempConfig.count}</Label>
                </div>
                <Slider
                  id="count-value"
                  min={1}
                  max={500}
                  step={1}
                  value={[tempConfig.count || 10]}
                  onValueChange={(value) => updateTempConfig("count", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="interval-value">
                    Interval: {tempConfig.interval}ms
                  </Label>
                </div>
                <Slider
                  id="interval-value"
                  min={5}
                  max={settings.maxEmotes || 500}
                  step={5}
                  value={[tempConfig.interval || 50]}
                  onValueChange={(value) =>
                    updateTempConfig("interval", value[0])
                  }
                />
              </div>
            </>
          )}

          {tempConfig && (
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={handlePreview}
                disabled={!selectedItem}
              >
                <PlayIcon className="mr-2 h-4 w-4" />
                Preview{" "}
                {selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1)}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
