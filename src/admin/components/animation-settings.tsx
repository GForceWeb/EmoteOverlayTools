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
import type { Settings } from "@/shared/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/admin/components/ui/accordion";
import { Slider } from "@/admin/components/ui/slider";
import { Button } from "@/admin/components/ui/button";
import { previewAnimation } from "@/admin/utils/preview-helpers";

interface AnimationSettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function AnimationSettings({
  settings,
  setSettings,
}: AnimationSettingsProps) {
  const [expandedAnimations, setExpandedAnimations] = useState<string[]>([]);

  const handleAnimationToggle = (
    animation: keyof Settings["animations"],
    enabled: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: { ...prev.animations[animation], enabled },
      },
    }));
  };

  const handleEnableAllAnimationsToggle = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enableAllAnimations: enabled,
    }));
  };

  const handleAnimationCountChange = (
    animation: keyof Settings["animations"],
    count: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: { ...prev.animations[animation], count },
      },
    }));
  };

  const handleAnimationIntervalChange = (
    animation: keyof Settings["animations"],
    interval: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: { ...prev.animations[animation], interval },
      },
    }));
  };

  const handleAnimationTextChange = (
    animation: keyof Settings["animations"],
    text: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animation]: { ...prev.animations[animation], text },
      },
    }));
  };

  const onPreviewAnimation = (animation: string) => {
    const animationConfig = settings.animations[animation];
    previewAnimation(animation, animationConfig, settings);
  };

  const animationDescriptions: Record<string, string> = {
    rain: "Emotes fall from top to bottom",
    rise: "Emotes rise from bottom to top",
    explode: "Emotes explode from the center",
    volcano: "Emotes erupt like a volcano",
    firework: "Emotes burst like fireworks",
    rightwave: "Emotes wave from right to left",
    leftwave: "Emotes wave from left to right",
    carousel: "Emotes rotate in a carousel",
    spiral: "Emotes move in a spiral pattern",
    comets: "Emotes streak across like comets",
    dvd: "Emotes bounce around like the DVD logo",
    text: "Display text with emotes",
    cyclone: "Emotes swirl in a cyclone pattern",
    tetris: "Emotes fall and stack like Tetris",
    bounce: "Emotes bounce around the screen",
    cube: "Emotes form a 3D cube",
    fade: "Emotes fade in and out",
    invaders: "Emotes move like Space Invaders",
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Animation Settings</CardTitle>
        <CardDescription>
          Configure the behavior of each animation type
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Enable All Animations Toggle */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg mb-6">
          <div className="space-y-0.5">
            <Label
              htmlFor="enableAllAnimations"
              className="text-base font-medium"
            >
              Enable All Animations
            </Label>
            <p className="text-sm text-muted-foreground">
              Turn on all available animations at once
            </p>
          </div>
          <Switch
            id="enableAllAnimations"
            checked={settings.enableAllAnimations}
            onCheckedChange={handleEnableAllAnimationsToggle}
          />
        </div>

        <Accordion
          type="multiple"
          value={expandedAnimations}
          onValueChange={setExpandedAnimations}
          className="w-full"
        >
          {Object.entries(settings.animations).map(([animation, config]) => (
            <AccordionItem key={animation} value={animation}>
              <div className="flex items-center justify-between w-full">
                <AccordionTrigger className="py-4 flex-1">
                  <span className="capitalize">{animation}</span>
                </AccordionTrigger>
                <div className="flex items-center space-x-2 pr-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreviewAnimation(animation)}
                  >
                    Preview
                  </Button>
                  <Switch
                    checked={
                      settings.enableAllAnimations ? true : config.enabled
                    }
                    onCheckedChange={(checked) =>
                      handleAnimationToggle(
                        animation as keyof Settings["animations"],
                        checked
                      )
                    }
                    disabled={settings.enableAllAnimations}
                  />
                </div>
              </div>
              <AccordionContent className="space-y-4 px-1 pb-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {animationDescriptions[animation] ||
                    `Configure ${animation} animation settings`}
                </p>

                {animation === "text" ? (
                  <div className="space-y-2">
                    <Label htmlFor={`${animation}-text`}>Display Text</Label>
                    <Input
                      id={`${animation}-text`}
                      value={config.text || ""}
                      onChange={(e) =>
                        handleAnimationTextChange(
                          animation as keyof Settings["animations"],
                          e.target.value
                        )
                      }
                      placeholder="Enter text to display"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`${animation}-count`}>
                          Count: {config.count}
                        </Label>
                      </div>
                      <Slider
                        id={`${animation}-count`}
                        min={1}
                        max={settings.maxEmotes || 500}
                        step={1}
                        value={[config.count || 10]}
                        onValueChange={(value) =>
                          handleAnimationCountChange(
                            animation as keyof Settings["animations"],
                            value[0]
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`${animation}-interval`}>
                          Interval: {config.interval}ms
                        </Label>
                      </div>
                      <Slider
                        id={`${animation}-interval`}
                        min={10}
                        max={1000}
                        step={10}
                        value={[config.interval || 100]}
                        onValueChange={(value) =>
                          handleAnimationIntervalChange(
                            animation as keyof Settings["animations"],
                            value[0]
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </>
  );
}
