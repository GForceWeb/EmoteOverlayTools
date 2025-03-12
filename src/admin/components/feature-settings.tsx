"use client";

import React from "react";

import { Switch } from "@/admin/components/ui/switch";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin/components/ui/card";
import type { Settings } from "@/shared/types";
import { Label } from "@/admin/components/ui/label";
import { Separator } from "@/admin/components/ui/separator";
import { Button } from "@/admin/components/ui/button";
import { WSData } from "@/shared/types";
import { previewFeature } from "@/admin/utils/preview-helpers";

interface FeatureSettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function FeatureSettings({
  settings,
  setSettings,
}: FeatureSettingsProps) {
  const handleFeatureToggle = (
    feature: keyof Settings["features"],
    enabled: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: { ...prev.features[feature], enabled },
      },
    }));
  };

  const handleEnableAllFeaturesToggle = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enableAllFeatures: enabled,
    }));
  };

  const onPreviewFeature = (feature: string) => {
    const featureConfig = settings.features[feature];
    previewFeature(feature, featureConfig, settings);
  };

  const featureDescriptions: Record<keyof Settings["features"], string> = {
    lurk: "Show animations when viewers go into lurk mode",
    welcome: "Display welcome messages for new viewers",
    kappagen: "Generate Kappa emotes on certain events",
    cheers: "Special animations for Twitch Bits cheers",
    hypetrain: "Animations during Hype Train events",
    emoterain: "Make it rain emotes on command",
    choon: "Music-related animations and effects",
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Feature Settings</CardTitle>
        <CardDescription>
          Enable or disable specific features for your stream overlay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable All Features Toggle */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
          <div className="space-y-0.5">
            <Label
              htmlFor="enableAllFeatures"
              className="text-base font-medium"
            >
              Enable All Features
            </Label>
            <p className="text-sm text-muted-foreground">
              Turn on all available features at once
            </p>
          </div>
          <Switch
            id="enableAllFeatures"
            checked={settings.enableAllFeatures}
            onCheckedChange={handleEnableAllFeaturesToggle}
          />
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          {Object.entries(settings.features).map(([feature, { enabled }]) => (
            <div key={feature} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`feature-${feature}`} className="capitalize">
                    {feature}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {featureDescriptions[feature as keyof Settings["features"]]}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreviewFeature(feature)}
                  >
                    Preview
                  </Button>
                  <Switch
                    id={`feature-${feature}`}
                    checked={settings.enableAllFeatures ? true : enabled}
                    onCheckedChange={(checked) =>
                      handleFeatureToggle(
                        feature as keyof Settings["features"],
                        checked
                      )
                    }
                    disabled={settings.enableAllFeatures}
                  />
                </div>
              </div>
              {feature !== Object.keys(settings.features).pop() && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
}
