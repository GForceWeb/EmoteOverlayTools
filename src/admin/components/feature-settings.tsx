"use client";

import React from "react";

import { Switch } from "@/admin/components/ui/switch";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin/components/ui/card";
import type { CheersPosition, Settings } from "@/shared/types";
import { Label } from "@/admin/components/ui/label";
import { Separator } from "@/admin/components/ui/separator";
import { Button } from "@/admin/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { previewFeature } from "@/admin/utils/preview-helpers";

interface FeatureSettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function FeatureSettings({
  settings,
  setSettings,
}: FeatureSettingsProps) {
  const cheersPositionLabels: Record<CheersPosition, string> = {
    center: "Center",
    left: "Left Side",
    right: "Right Side",
  };

  const featureLabels: Record<keyof Settings["features"], string> = {
    lurk: "Lurk",
    welcome: "Welcome",
    kappagen: "Kappagen",
    cheers: "Cheers",
    hypetrain: "Hype Train",
    emoterain: "Emote Rain",
    choon: "Choon",
    gigantifyredeem: "Gigantify Emote Redeems",
  };

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

  const handleCheersQuantityChange = (value: "1" | "2") => {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        cheers: {
          ...prev.features.cheers,
          quantity: value === "2" ? 2 : 1,
        },
      },
    }));
  };

  const handleCheersPositionChange = (position: CheersPosition) => {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        cheers: {
          ...prev.features.cheers,
          position,
        },
      },
    }));
  };

  const onPreviewFeature = (feature: keyof Settings["features"]) => {
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
    gigantifyredeem:
      "Animate Twitch Gigantify an Emote power-up redemptions",
  };

  return (
    <>
      <CardHeader className="space-y-1 px-5 py-4">
        <CardTitle className="font-display text-base">Feature Settings</CardTitle>
        <CardDescription>
          Enable or disable overlay features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        {/* Enable All Features Toggle */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="enableAllFeatures"
              className="text-sm font-medium"
            >
              Enable All Features
            </Label>
            <p className="text-xs text-muted-foreground">
              Turn on all available features at once
            </p>
          </div>
          <Switch
            id="enableAllFeatures"
            checked={settings.enableAllFeatures}
            onCheckedChange={handleEnableAllFeaturesToggle}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          {Object.entries(settings.features).map(([feature, { enabled }]) => (
            <div key={feature} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <Label htmlFor={`feature-${feature}`}>
                    {featureLabels[feature as keyof Settings["features"]]}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {featureDescriptions[feature as keyof Settings["features"]]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onPreviewFeature(feature as keyof Settings["features"])
                    }
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
              {feature === "cheers" && (
                <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/20 p-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cheers-quantity">Quantity</Label>
                      <Select
                        value={settings.features.cheers.quantity.toString()}
                        onValueChange={(value: "1" | "2") =>
                          handleCheersQuantityChange(value)
                        }
                      >
                        <SelectTrigger id="cheers-quantity">
                          <SelectValue placeholder="Select quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 animation</SelectItem>
                          <SelectItem value="2">2 animations</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Use one cheers animation or mirror it on both sides.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cheers-position">Position</Label>
                      <Select
                        value={settings.features.cheers.position}
                        onValueChange={(value: CheersPosition) =>
                          handleCheersPositionChange(value)
                        }
                        disabled={settings.features.cheers.quantity === 2}
                      >
                        <SelectTrigger id="cheers-position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(cheersPositionLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {settings.features.cheers.quantity === 2
                          ? "Two cheers animations always render near the left and right edges."
                          : "Choose where the cheers animation appears when only one is shown."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {feature !== Object.keys(settings.features).pop() && (
                <Separator className="my-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
}
