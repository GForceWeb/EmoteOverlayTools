import React from "react"

import { Input } from "@/admin/components/ui/input"
import { Label } from "@/admin/components/ui/label"
import { Switch } from "@/admin/components/ui/switch"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/admin/components/ui/card"
import type { Settings } from "@/shared/types"
import { Separator } from "@/admin/components/ui/separator"
import { Slider } from "@/admin/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog"
import { RotateCcwIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/admin/components/ui/button"
import { InfoHint } from "@/admin/components/info-hint"
import {
  SetupGuideContent,
  type SetupGuideContentProps,
} from "@/admin/components/setup-guide-content"

interface GeneralSettingsProps {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  resetSettings: () => void
  setupGuide: SetupGuideContentProps
  isFirstRun?: boolean
}

export function GeneralSettings({
  settings,
  setSettings,
  resetSettings,
  setupGuide,
  isFirstRun = false,
}: GeneralSettingsProps) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    setSettings((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value, 10) : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSliderChange = (name: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <>
      <CardHeader className="space-y-1 px-5 py-4">
        <CardTitle className="font-display text-base">Settings &amp; Connection</CardTitle>
        <CardDescription>
          {isFirstRun
            ? "Welcome — connect Streamer.Bot and OBS, then set your Twitch username"
            : "Connect Streamer.Bot / OBS and configure global defaults"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5">
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold tracking-tight">
            Connection Setup
          </h3>
          <SetupGuideContent
            {...setupGuide}
            defaultInstructionsOpen={
              setupGuide.defaultInstructionsOpen ?? isFirstRun
            }
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-display text-sm font-semibold">Global Settings</h3>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="twitchUsername">Twitch Username</Label>
              <InfoHint text="Used to look up your avatar as the default avatar for certain animations like Cheers." />
            </div>
            <Input
              id="twitchUsername"
              name="twitchUsername"
              value={settings.twitchUsername}
              onChange={handleInputChange}
              placeholder="Your Twitch username"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxEmotes">Maximum Emotes: {settings.maxEmotes}</Label>
            </div>
            <Slider
              id="maxEmotes"
              min={25}
              max={400}
              step={5}
              value={[settings.maxEmotes]}
              onValueChange={(value) => handleSliderChange("maxEmotes", value[0])}
            />
            <p className="text-xs text-muted-foreground">Maximum number of emotes to display per animation</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="defaultEmotes">Default Emotes: {settings.defaultEmotes}</Label>
            </div>
            <Slider
              id="defaultEmotes"
              min={10}
              max={100}
              step={1}
              value={[settings.defaultEmotes]}
              onValueChange={(value) => handleSliderChange("defaultEmotes", value[0])}
            />
            <p className="text-xs text-muted-foreground">Default number of emotes to use for each animation when not specified</p>
          </div>

          <div className="flex items-center justify-between space-y-0 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="subOnly">Subscriber Only Mode</Label>
              <p className="text-xs text-muted-foreground">Limit overlay interactions to subscribers only</p>
            </div>
            <Switch
              id="subOnly"
              checked={settings.subOnly}
              onCheckedChange={(checked) => handleSwitchChange("subOnly", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-y-0 pt-1">
            <div className="space-y-0.5">
              <Label htmlFor="debug">Debug Mode</Label>
              <p className="text-xs text-muted-foreground">Enable debug information and logging</p>
            </div>
            <Switch
              id="debug"
              checked={settings.debug}
              onCheckedChange={(checked) => handleSwitchChange("debug", checked)}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="configFilePath">Config File Path (Optional)</Label>
            <Input
              id="configFilePath"
              name="configFilePath"
              value={settings.configFilePath || ""}
              onChange={handleInputChange}
              placeholder="Path to custom config file"
            />
            <p className="text-xs text-muted-foreground">Specify a custom path to save your configuration file</p>
          </div>

          <div className="pt-3">
            <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)} className="w-full">
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Settings</DialogTitle>
            <DialogDescription>
              This will reset all settings to their default values. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetSettings()
                setIsResetDialogOpen(false)
              }}
            >
              Reset All Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
