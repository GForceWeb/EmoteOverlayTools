"use client";

import React from "react";

import { Switch } from "@/admin/components/ui/switch";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin/components/ui/card";
import type {
  CheersPosition,
  RaidAnimationStyle,
  Settings,
} from "@/shared/types";
import { Label } from "@/admin/components/ui/label";
import { Separator } from "@/admin/components/ui/separator";
import { Button } from "@/admin/components/ui/button";
import { Slider } from "@/admin/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { previewFeature } from "@/admin/utils/preview-helpers";
import {
  CHEERS_POSITION_OPTIONS,
  CHEERS_QUANTITY_OPTIONS,
  FEATURE_DESCRIPTIONS,
  FEATURE_LABELS,
  RAID_STYLE_OPTIONS,
} from "@/admin/utils/setting-options";

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

  const handleRaidCapEnabledChange = (capEnabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        raids: {
          ...prev.features.raids,
          capEnabled,
        },
      },
    }));
  };

  const handleRaidMaxRaidersChange = (maxRaiders: number) => {
    const clampedMaxRaiders = Math.min(500, Math.max(1, maxRaiders));

    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        raids: {
          ...prev.features.raids,
          maxRaiders: clampedMaxRaiders,
        },
      },
    }));
  };

  const handleRaidChargePassesChange = (chargePasses: number) => {
    const clampedPasses = Math.min(5, Math.max(1, chargePasses));

    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        raids: {
          ...prev.features.raids,
          chargePasses: clampedPasses,
        },
      },
    }));
  };

  const handleRaidAnimationStyleChange = (style: RaidAnimationStyle) => {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        raids: {
          ...prev.features.raids,
          animationStyle: style,
        },
      },
    }));
  };

  const onPreviewFeature = (feature: keyof Settings["features"]) => {
    const featureConfig = settings.features[feature];
    previewFeature(feature, featureConfig, settings);
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
          {Object.entries(settings.features)
            .sort(([a], [b]) =>
              FEATURE_LABELS[a as keyof Settings["features"]].localeCompare(
                FEATURE_LABELS[b as keyof Settings["features"]]
              )
            )
            .map(([feature, { enabled }], index, sortedFeatures) => (
            <div key={feature} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <Label htmlFor={`feature-${feature}`}>
                    {FEATURE_LABELS[feature as keyof Settings["features"]]}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {FEATURE_DESCRIPTIONS[feature as keyof Settings["features"]]}
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
                          {CHEERS_QUANTITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
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
                          {CHEERS_POSITION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
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
              {feature === "raids" && (
                <div className="rounded-lg border border-border/60 bg-secondary/20 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="raids-animation-style">Animation style</Label>
                    <Select
                      value={settings.features.raids.animationStyle ?? "random"}
                      onValueChange={(value: RaidAnimationStyle) =>
                        handleRaidAnimationStyleChange(value)
                      }
                    >
                      <SelectTrigger id="raids-animation-style">
                        <SelectValue placeholder="Select animation style" />
                      </SelectTrigger>
                      <SelectContent>
                        {RAID_STYLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {settings.features.raids.animationStyle === "random"
                        ? "Each raid plays a random style from the overhauled animations."
                        : "Every raid plays the selected animation style."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="raids-cap-enabled">
                        Cap rendered raiders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Limit visible people for very large raids.
                      </p>
                    </div>
                    <Switch
                      id="raids-cap-enabled"
                      checked={settings.features.raids.capEnabled}
                      onCheckedChange={handleRaidCapEnabledChange}
                    />
                  </div>

                  {settings.features.raids.capEnabled && (
                    <div className="space-y-2">
                      <div className="flex justify-between gap-4">
                        <Label htmlFor="raids-max-raiders">
                          Maximum rendered raiders:{" "}
                          {settings.features.raids.maxRaiders}
                        </Label>
                      </div>
                      <Slider
                        id="raids-max-raiders"
                        min={1}
                        max={500}
                        step={1}
                        value={[settings.features.raids.maxRaiders || 100]}
                        onValueChange={(value) =>
                          handleRaidMaxRaidersChange(value[0])
                        }
                      />
                    </div>
                  )}

                  {settings.features.raids.animationStyle === "stampede" && (
                    <div className="space-y-2">
                      <div className="flex justify-between gap-4">
                        <Label htmlFor="raids-charge-passes">
                          Charge passes:{" "}
                          {settings.features.raids.chargePasses ?? 1}
                        </Label>
                      </div>
                      <Slider
                        id="raids-charge-passes"
                        min={1}
                        max={5}
                        step={1}
                        value={[settings.features.raids.chargePasses ?? 1]}
                        onValueChange={(value) =>
                          handleRaidChargePassesChange(value[0])
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        How many times the Stampede charges across the screen,
                        alternating direction each pass.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {index < sortedFeatures.length - 1 && (
                <Separator className="my-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
}
