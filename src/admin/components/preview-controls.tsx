"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/admin/components/ui/button";
import { Label } from "@/admin/components/ui/label";
import { Input } from "@/admin/components/ui/input";
import { Slider } from "@/admin/components/ui/slider";
import { Switch } from "@/admin/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/admin/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { PlayIcon, RotateCcwIcon, Settings2Icon } from "lucide-react";
import type { Settings, PreviewEmote } from "@/shared/types";
import {
  previewAnimation,
  previewFeature,
} from "@/admin/utils/preview-helpers";
import { resolveAnimationConfig } from "@/admin/utils/animation-config";
import {
  BUBBLES_POPPING_BEHAVIOUR_OPTIONS,
  CHEERS_POSITION_OPTIONS,
  CHEERS_QUANTITY_OPTIONS,
  FEATURE_DESCRIPTIONS,
  FEATURE_LABELS,
  RAID_STYLE_OPTIONS,
  SHAPE_POSITION_MOVEMENT_OPTIONS,
  SPIRAL_PATH_BEHAVIOUR_OPTIONS,
  WAVE_STYLE_OPTIONS,
} from "@/admin/utils/setting-options";
import { EmotePicker } from "@/admin/components/emote-picker";
import { Separator } from "@/admin/components/ui/separator";
import {
  animationRegistry,
  getGroupAnimations,
  getGroupChildren,
  getStandaloneAnimations,
} from "@/shared/animationRegistry";

type PreviewConfig = Record<string, any>;

const ANIMATIONS_WITH_STYLE_OPTIONS = new Set([
  "bubbles",
  "spiral",
  "cube",
  "dodecahedron",
  "rightwave",
  "leftwave",
]);

function hasAnimationStyleOptions(name: string): boolean {
  return ANIMATIONS_WITH_STYLE_OPTIONS.has(name);
}

function featureHasSubSettings(feature: string): boolean {
  return feature === "raids" || feature === "cheers";
}

/** Seed a preview config for a feature from its saved settings. */
function getFeaturePreviewConfig(
  feature: string,
  settings: Settings
): PreviewConfig {
  const saved = settings.features[
    feature as keyof Settings["features"]
  ] as Record<string, any> | undefined;

  if (feature === "raids") {
    return {
      enabled: saved?.enabled ?? true,
      capEnabled: saved?.capEnabled ?? true,
      maxRaiders: saved?.maxRaiders ?? 100,
      animationStyle: saved?.animationStyle ?? "random",
      chargePasses: saved?.chargePasses ?? 1,
    };
  }

  if (feature === "cheers") {
    return {
      enabled: saved?.enabled ?? true,
      quantity: saved?.quantity ?? 1,
      position: saved?.position ?? "center",
    };
  }

  return { ...(saved ?? { enabled: true }) };
}

function OptionsPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/20 p-3">
      <div className="space-y-0.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Settings2Icon className="h-3.5 w-3.5" />
          Preview options
        </p>
        <p className="text-[11px] text-muted-foreground">
          Applies to this preview only — saved settings are untouched.
        </p>
      </div>
      {children}
    </div>
  );
}

function StyleSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PreviewActions({
  label,
  onPreview,
  onReset,
}: {
  label: string;
  onPreview: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={onReset}
        title="Reset to saved settings"
      >
        <RotateCcwIcon className="h-4 w-4" />
      </Button>
      <Button className="flex-1" onClick={onPreview}>
        <PlayIcon className="mr-2 h-4 w-4" />
        Preview {label}
      </Button>
    </div>
  );
}

interface PreviewControlsProps {
  settings: Settings;
  onSettingsChange?: (settings: Settings) => void;
}

export function PreviewControls({
  settings,
  onSettingsChange,
}: PreviewControlsProps) {
  const [activeTab, setActiveTab] = useState<"feature" | "animation">(
    "animation"
  );
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [selectedAnimation, setSelectedAnimation] = useState<string>("");
  const [featureConfig, setFeatureConfig] = useState<PreviewConfig | null>(
    null
  );
  const [animationConfig, setAnimationConfig] = useState<PreviewConfig | null>(
    null
  );
  const [raidViewers, setRaidViewers] = useState(100);

  const standaloneAnimations = useMemo(() => getStandaloneAnimations(), []);
  const groupAnimations = useMemo(() => getGroupAnimations(), []);

  const previewableFeatures = useMemo(
    () =>
      (Object.keys(settings.features) as (keyof Settings["features"])[])
        .filter((feature) => feature !== "emoterain" && feature !== "kappagen")
        .sort((a, b) => FEATURE_LABELS[a].localeCompare(FEATURE_LABELS[b])),
    [settings.features]
  );

  // Track latest settings without re-seeding preview configs when unrelated
  // settings change (e.g. picking preview emotes).
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Seed the preview config whenever a feature is picked
  useEffect(() => {
    if (!selectedFeature) {
      setFeatureConfig(null);
      return;
    }
    setFeatureConfig(
      getFeaturePreviewConfig(selectedFeature, settingsRef.current)
    );
  }, [selectedFeature]);

  // Seed the preview config whenever an animation is picked
  useEffect(() => {
    if (!selectedAnimation) {
      setAnimationConfig(null);
      return;
    }
    setAnimationConfig(
      resolveAnimationConfig(settingsRef.current, selectedAnimation)
    );
  }, [selectedAnimation]);

  const handleEmotesChange = (emotes: PreviewEmote[]) => {
    onSettingsChange?.({
      ...settings,
      previewEmotes: emotes,
    });
  };

  const updateFeatureConfig = (key: string, value: any) => {
    setFeatureConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateAnimationConfig = (key: string, value: any) => {
    setAnimationConfig((prev) => ({ ...prev, [key]: value }));
  };

  const resetFeatureConfig = () => {
    if (selectedFeature) {
      setFeatureConfig(getFeaturePreviewConfig(selectedFeature, settings));
    }
  };

  const resetAnimationConfig = () => {
    if (selectedAnimation) {
      setAnimationConfig(resolveAnimationConfig(settings, selectedAnimation));
    }
  };

  const handlePreview = () => {
    if (activeTab === "animation" && selectedAnimation && animationConfig) {
      previewAnimation(selectedAnimation, animationConfig, settings);
    } else if (activeTab === "feature" && selectedFeature && featureConfig) {
      previewFeature(
        selectedFeature,
        featureConfig,
        settings,
        selectedFeature === "raids" ? { viewers: raidViewers } : undefined
      );
    }
  };

  const featureLabel = selectedFeature
    ? FEATURE_LABELS[selectedFeature as keyof Settings["features"]] ??
      selectedFeature
    : "";

  const animationDef = selectedAnimation
    ? animationRegistry[selectedAnimation]
    : undefined;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Preview Controls</h3>
        <p className="text-sm text-muted-foreground">
          Fire a test trigger at the live overlay and tune its options per
          preview.
        </p>
      </div>

      {/* Emote Picker Section */}
      <EmotePicker
        selectedEmotes={settings.previewEmotes || []}
        onEmotesChange={handleEmotesChange}
        maxEmotes={10}
      />

      <Separator className="my-4" />

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

        <TabsContent value="feature" className="mt-2 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="preview-feature-select">Feature</Label>
            <Select value={selectedFeature} onValueChange={setSelectedFeature}>
              <SelectTrigger id="preview-feature-select">
                <SelectValue placeholder="Select a feature" />
              </SelectTrigger>
              <SelectContent>
                {previewableFeatures.map((feature) => (
                  <SelectItem key={feature} value={feature}>
                    {FEATURE_LABELS[feature]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFeature && (
              <p className="text-xs text-muted-foreground">
                {FEATURE_DESCRIPTIONS[selectedFeature]}
              </p>
            )}
          </div>

          {selectedFeature === "raids" && featureConfig && (
            <OptionsPanel>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preview-raid-size">Raid size</Label>
                  <span className="text-xs text-muted-foreground">
                    {raidViewers} viewers
                  </span>
                </div>
                <Slider
                  id="preview-raid-size"
                  min={1}
                  max={500}
                  step={1}
                  value={[raidViewers]}
                  onValueChange={(value) => setRaidViewers(value[0])}
                />
                <p className="text-[11px] text-muted-foreground">
                  Incoming raider count for the preview — useful for testing
                  the raider cap.
                </p>
              </div>

              <StyleSelect
                id="preview-raid-style"
                label="Raid animation"
                value={featureConfig.animationStyle ?? "random"}
                options={RAID_STYLE_OPTIONS}
                onChange={(value) => updateFeatureConfig("animationStyle", value)}
              />
              <p className="-mt-1 text-[11px] text-muted-foreground">
                {(featureConfig.animationStyle ?? "random") === "random"
                  ? "Each preview plays a random style, just like a live raid."
                  : "Every preview plays exactly this style."}
              </p>

              {(featureConfig.animationStyle ?? "random") === "stampede" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preview-charge-passes">Charge passes</Label>
                    <span className="text-xs text-muted-foreground">
                      {featureConfig.chargePasses ?? 1}
                    </span>
                  </div>
                  <Slider
                    id="preview-charge-passes"
                    min={1}
                    max={5}
                    step={1}
                    value={[featureConfig.chargePasses ?? 1]}
                    onValueChange={(value) =>
                      updateFeatureConfig("chargePasses", value[0])
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    How many times the Stampede charges across, alternating
                    direction.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="preview-raid-cap" className="text-sm font-medium">
                    Cap rendered raiders
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Limit visible people for very large raids.
                  </p>
                </div>
                <Switch
                  id="preview-raid-cap"
                  checked={featureConfig.capEnabled ?? true}
                  onCheckedChange={(checked) =>
                    updateFeatureConfig("capEnabled", checked)
                  }
                />
              </div>

              {(featureConfig.capEnabled ?? true) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preview-max-raiders">
                      Max rendered raiders
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {featureConfig.maxRaiders ?? 100}
                    </span>
                  </div>
                  <Slider
                    id="preview-max-raiders"
                    min={1}
                    max={500}
                    step={1}
                    value={[featureConfig.maxRaiders ?? 100]}
                    onValueChange={(value) =>
                      updateFeatureConfig("maxRaiders", value[0])
                    }
                  />
                </div>
              )}
            </OptionsPanel>
          )}

          {selectedFeature === "cheers" && featureConfig && (
            <OptionsPanel>
              <StyleSelect
                id="preview-cheers-quantity"
                label="Quantity"
                value={String(featureConfig.quantity ?? 1)}
                options={CHEERS_QUANTITY_OPTIONS}
                onChange={(value) =>
                  updateFeatureConfig("quantity", value === "2" ? 2 : 1)
                }
              />
              <StyleSelect
                id="preview-cheers-position"
                label="Position"
                value={featureConfig.position ?? "center"}
                options={CHEERS_POSITION_OPTIONS}
                onChange={(value) => updateFeatureConfig("position", value)}
              />
              <p className="-mt-1 text-[11px] text-muted-foreground">
                {(featureConfig.quantity ?? 1) === 2
                  ? "Two cheers animations always render near the left and right edges."
                  : "Choose where the cheers animation appears when only one is shown."}
              </p>
            </OptionsPanel>
          )}

          {selectedFeature && featureConfig && !featureHasSubSettings(selectedFeature) && (
            <p className="rounded-lg bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              No style options — this preview uses your saved settings.
            </p>
          )}

          {selectedFeature && featureConfig && (
            <PreviewActions
              label={featureLabel}
              onPreview={handlePreview}
              onReset={resetFeatureConfig}
            />
          )}
        </TabsContent>

        <TabsContent value="animation" className="mt-2 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="preview-animation-select">Animation</Label>
            <Select
              value={selectedAnimation}
              onValueChange={setSelectedAnimation}
            >
              <SelectTrigger id="preview-animation-select">
                <SelectValue placeholder="Select an animation" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Standalone</SelectLabel>
                  {standaloneAnimations.map((def) => (
                    <SelectItem key={def.name} value={def.name}>
                      {def.displayName}
                    </SelectItem>
                  ))}
                </SelectGroup>
                {groupAnimations.map((group) => (
                  <SelectGroup key={group.name}>
                    <SelectLabel>{group.displayName}</SelectLabel>
                    <SelectItem value={group.name}>
                      {group.displayName} — random child
                    </SelectItem>
                    {getGroupChildren(group.name).map((child) => (
                      <SelectItem key={child.name} value={child.name}>
                        {child.displayName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {animationDef && (
              <p className="text-xs text-muted-foreground">
                {animationDef.description}
              </p>
            )}
          </div>

          {selectedAnimation && animationConfig && animationDef?.isGroup && (
            <p className="rounded-lg bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              Groups pick a random enabled child each time they&apos;re
              triggered — the preview does the same.
            </p>
          )}

          {selectedAnimation && animationConfig && !animationDef?.isGroup && (
            <>
              {animationDef?.requiresText ? (
                <div className="space-y-2">
                  <Label htmlFor="preview-text">Text</Label>
                  <Input
                    id="preview-text"
                    value={animationConfig.text || ""}
                    onChange={(e) => updateAnimationConfig("text", e.target.value)}
                    placeholder="Enter text to display"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="preview-count">
                        {animationDef?.countLabel || "Count"}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {animationConfig.count}
                      </span>
                    </div>
                    <Slider
                      id="preview-count"
                      min={1}
                      max={settings.maxEmotes || 500}
                      step={1}
                      value={[animationConfig.count || 10]}
                      onValueChange={(value) =>
                        updateAnimationConfig("count", value[0])
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="preview-interval">
                        {animationDef?.intervalLabel || "Interval"}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {animationConfig.interval}ms
                      </span>
                    </div>
                    <Slider
                      id="preview-interval"
                      min={10}
                      max={1000}
                      step={10}
                      value={[animationConfig.interval || 100]}
                      onValueChange={(value) =>
                        updateAnimationConfig("interval", value[0])
                      }
                    />
                  </div>
                </>
              )}
            </>
          )}

          {selectedAnimation &&
            animationConfig &&
            hasAnimationStyleOptions(selectedAnimation) && (
              <OptionsPanel>
                {selectedAnimation === "bubbles" && (
                  <StyleSelect
                    id="preview-bubbles-popping"
                    label="Popping Behaviour"
                    value={animationConfig.poppingBehaviour ?? "randomPerActivation"}
                    options={BUBBLES_POPPING_BEHAVIOUR_OPTIONS}
                    onChange={(value) =>
                      updateAnimationConfig("poppingBehaviour", value)
                    }
                  />
                )}
                {selectedAnimation === "spiral" && (
                  <StyleSelect
                    id="preview-spiral-path"
                    label="Spiral Behaviour"
                    value={animationConfig.pathBehaviour ?? "unified"}
                    options={SPIRAL_PATH_BEHAVIOUR_OPTIONS}
                    onChange={(value) =>
                      updateAnimationConfig("pathBehaviour", value)
                    }
                  />
                )}
                {(selectedAnimation === "cube" ||
                  selectedAnimation === "dodecahedron") && (
                  <StyleSelect
                    id="preview-shape-movement"
                    label="Position/Movement"
                    value={animationConfig.positionMovement ?? "centered"}
                    options={SHAPE_POSITION_MOVEMENT_OPTIONS}
                    onChange={(value) =>
                      updateAnimationConfig("positionMovement", value)
                    }
                  />
                )}
                {(selectedAnimation === "rightwave" ||
                  selectedAnimation === "leftwave") && (
                  <StyleSelect
                    id="preview-wave-style"
                    label="Wave Type"
                    value={animationConfig.waveStyle ?? "sway"}
                    options={WAVE_STYLE_OPTIONS}
                    onChange={(value) =>
                      updateAnimationConfig("waveStyle", value)
                    }
                  />
                )}
              </OptionsPanel>
            )}

          {selectedAnimation && animationConfig && (
            <PreviewActions
              label={animationDef?.displayName ?? selectedAnimation}
              onPreview={handlePreview}
              onReset={resetAnimationConfig}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
