import React from "react";
import { useState } from "react";
import { Switch } from "@/admin/components/ui/switch";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin/components/ui/card";
import type { Settings, AnimationSettings as AnimationSettingsType } from "@/shared/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/admin/components/ui/accordion";
import { Slider } from "@/admin/components/ui/slider";
import { Button } from "@/admin/components/ui/button";
import { previewAnimation } from "@/admin/utils/preview-helpers";
import { Play, RotateCcw } from "lucide-react";
import {
  animationRegistry,
  getTopLevelAnimations,
  getGroupChildren,
  AnimationDefinition,
} from "@/shared/animationRegistry";

interface AnimationSettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function AnimationSettings({
  settings,
  setSettings,
}: AnimationSettingsProps) {
  const [expandedAnimations, setExpandedAnimations] = useState<string[]>([]);

  // Get default animation config from registry
  const getDefaultConfig = (animationName: string): AnimationSettingsType => {
    const def = animationRegistry[animationName];
    return {
      enabled: def?.defaultEnabledManual || def?.defaultEnabledKappagen || true,
      enabledManual: def?.defaultEnabledManual ?? true,
      enabledKappagen: def?.defaultEnabledKappagen ?? true,
      count: def?.defaultCount ?? 50,
      interval: def?.defaultInterval ?? 50,
      text: def?.requiresText ? "Hype" : undefined,
    };
  };

  // Get animation config from settings, with proper defaults from registry
  const getAnimationConfig = (animationName: string): AnimationSettingsType => {
    const def = animationRegistry[animationName];
    const existing = settings.animations[animationName];
    const defaults = getDefaultConfig(animationName);
    
    // If no existing settings, return defaults
    if (!existing) {
      return defaults;
    }
    
    return {
      enabled: existing.enabled ?? defaults.enabled,
      enabledManual: existing.enabledManual ?? existing.enabled ?? defaults.enabledManual,
      // Use enabledKappagen, fallback to legacy enabledRandom, then to defaults
      enabledKappagen: existing.enabledKappagen ?? (existing as any).enabledRandom ?? defaults.enabledKappagen,
      count: existing.count ?? defaults.count,
      interval: existing.interval ?? defaults.interval,
      text: existing.text ?? defaults.text,
    };
  };

  const handleManualToggle = (animation: string, enabled: boolean) => {
    const currentConfig = getAnimationConfig(animation);
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: {
          ...currentConfig,
          enabledManual: enabled,
          enabled: enabled || currentConfig.enabledKappagen,
        },
      },
    }));
  };

  const handleKappagenToggle = (animation: string, enabled: boolean) => {
    const currentConfig = getAnimationConfig(animation);
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: {
          ...currentConfig,
          enabledKappagen: enabled,
          enabled: enabled || currentConfig.enabledManual,
        },
      },
    }));
  };

  const handleEnableAllAnimationsToggle = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enableAllAnimations: enabled,
    }));
  };

  const handleAnimationCountChange = (animation: string, count: number) => {
    const currentConfig = getAnimationConfig(animation);
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: {
          ...currentConfig,
          count,
        },
      },
    }));
  };

  const handleAnimationIntervalChange = (animation: string, interval: number) => {
    const currentConfig = getAnimationConfig(animation);
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: {
          ...currentConfig,
          interval,
        },
      },
    }));
  };

  const handleAnimationTextChange = (animation: string, text: string) => {
    const currentConfig = getAnimationConfig(animation);
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: {
          ...currentConfig,
          text,
        },
      },
    }));
  };

  const handleResetToDefaults = (animation: string) => {
    const defaults = getDefaultConfig(animation);
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: defaults,
      },
    }));
  };

  const onPreviewAnimation = (animation: string) => {
    const config = getAnimationConfig(animation);
    previewAnimation(animation, config, settings);
  };

  // Render a single animation item
  const renderAnimationItem = (
    def: AnimationDefinition,
    isChild: boolean = false
  ) => {
    const config = getAnimationConfig(def.name);
    const isManualEnabled = settings.enableAllAnimations || config.enabledManual;
    const isKappagenEnabled = settings.enableAllAnimations || config.enabledKappagen;

    // Get custom labels or defaults
    const countLabel = def.countLabel || "Count";
    const intervalLabel = def.intervalLabel || "Interval";

    return (
      <AccordionItem
        key={def.name}
        value={def.name}
        className={isChild ? "ml-6 border-l-2 border-muted pl-4" : ""}
      >
        <div className="flex items-center justify-between w-full">
          <AccordionTrigger className="py-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="capitalize">{def.displayName}</span>
              {isChild && (
                <span className="text-xs text-muted-foreground">(child)</span>
              )}
              {def.isGroup && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                  Group
                </span>
              )}
            </div>
          </AccordionTrigger>
          <div className="flex items-center space-x-2 pr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreviewAnimation(def.name);
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleResetToDefaults(def.name);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
        <AccordionContent className="space-y-4 px-1 pb-4">
          <p className="text-sm text-muted-foreground mb-4">
            {def.description}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column: enable toggles */}
            <div className="space-y-3 rounded-lg bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable for !er</Label>
                  <p className="text-xs text-muted-foreground">Manual trigger</p>
                </div>
                <Switch
                  checked={isManualEnabled}
                  onCheckedChange={(checked) =>
                    handleManualToggle(def.name, checked)
                  }
                  disabled={settings.enableAllAnimations}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Include in !k</Label>
                  <p className="text-xs text-muted-foreground">Kappagen pool</p>
                </div>
                <Switch
                  checked={isKappagenEnabled}
                  onCheckedChange={(checked) =>
                    handleKappagenToggle(def.name, checked)
                  }
                  disabled={settings.enableAllAnimations}
                />
              </div>
            </div>

            {/* Right column: sliders / text */}
            <div className="space-y-4">
              {def.requiresText ? (
                <div className="space-y-2">
                  <Label htmlFor={`${def.name}-text`}>Default Text</Label>
                  <Input
                    id={`${def.name}-text`}
                    value={config.text || ""}
                    onChange={(e) =>
                      handleAnimationTextChange(def.name, e.target.value)
                    }
                    placeholder="Enter text to display"
                  />
                </div>
              ) : !def.isGroup ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${def.name}-count`}>{countLabel}</Label>
                      <span className="text-sm text-muted-foreground">
                        {config.count}
                      </span>
                    </div>
                    <Slider
                      id={`${def.name}-count`}
                      min={1}
                      max={settings.maxEmotes || 500}
                      step={1}
                      value={[config.count || 10]}
                      onValueChange={(value) =>
                        handleAnimationCountChange(def.name, value[0])
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${def.name}-interval`}>
                        {intervalLabel}
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {config.interval}ms
                      </span>
                    </div>
                    <Slider
                      id={`${def.name}-interval`}
                      min={10}
                      max={1000}
                      step={10}
                      value={[config.interval || 100]}
                      onValueChange={(value) =>
                        handleAnimationIntervalChange(def.name, value[0])
                      }
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Group children */}
          {def.isGroup && def.children && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                Child Animations (selected randomly when group is triggered)
              </h4>
              <Accordion
                type="multiple"
                value={expandedAnimations}
                onValueChange={setExpandedAnimations}
                className="w-full"
              >
                {getGroupChildren(def.name).map((childDef) => renderAnimationItem(childDef, true))}
              </Accordion>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  // Get all top-level animations (excludes group children)
  const topLevelAnimations = getTopLevelAnimations();

  return (
    <>
      <CardHeader>
        <CardTitle>Animation Settings</CardTitle>
        <CardDescription>
          Configure which animations are available for manual (!er) and kappagen (!k) triggers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Enable All Animations Toggle */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg mb-6">
          <div className="space-y-0.5">
            <Label htmlFor="enableAllAnimations" className="text-base font-medium">
              Enable All Animations
            </Label>
            <p className="text-sm text-muted-foreground">
              Override individual settings and enable all animations for both !er and !k
            </p>
          </div>
          <Switch
            id="enableAllAnimations"
            checked={settings.enableAllAnimations}
            onCheckedChange={handleEnableAllAnimationsToggle}
          />
        </div>

        {/* All Animations in a single list */}
        <Accordion
          type="multiple"
          value={expandedAnimations}
          onValueChange={setExpandedAnimations}
          className="w-full"
        >
          {topLevelAnimations.map((def) => renderAnimationItem(def))}
        </Accordion>
      </CardContent>
    </>
  );
}
