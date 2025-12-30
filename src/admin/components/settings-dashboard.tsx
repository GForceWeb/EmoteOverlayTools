"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/admin/components/ui/tabs";
import { Button } from "@/admin/components/ui/button";
import { Card, CardFooter } from "@/admin/components/ui/card";
import { GeneralSettings } from "@/admin/components/general-settings";

import { FeatureSettings } from "@/admin/components/feature-settings";
import { AnimationSettings } from "@/admin/components/animation-settings";
import { LogsView } from "@/admin/components/logs-view";
import { Support } from "@/admin/components/support";
import type { Settings } from "@/shared/types";
import { useToast } from "@/admin/hooks/use-toast";

import { SaveIcon } from "lucide-react";
import { PreviewPane } from "@/admin/components/preview-pane";
import { ConnectionStatus } from "@/admin/components/connection-status";
import { OverlayUrl } from "@/admin/components/overlay-url";

import { defaultConfig, deepMergeSettings } from "@/shared/defaultConfig";

export function SettingsDashboard() {
  const [settings, setSettings] = useState<Settings>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const getBaseUrl = () => {
    return settings.overlayServerPort
      ? `http://localhost:${settings.overlayServerPort}`
      : "http://localhost:3030";
  };

  // Send log entry to file-based logging system
  const sendLog = (type: "info" | "warning" | "error", message: string) => {
    fetch(`${getBaseUrl()}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message, source: "admin" }),
    }).catch((err) => console.error("Failed to send log:", err));
  };

  // Load settings from config file when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/settings`);

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.statusText}`);
        }

        const data = await response.json();
        // Deep merge with defaults to ensure all animations are present
        const mergedSettings = deepMergeSettings(data, defaultConfig);
        setSettings(mergedSettings);
        sendLog("info", "Settings loaded from config file");
      } catch (error) {
        console.error("Failed to load settings:", error);
        sendLog(
          "error",
          `Failed to load settings: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const { toast } = useToast();

  const saveSettings = async () => {
    try {
      const result = await window.electronAPI.saveSettings(settings);
      if (result.success) {
        sendLog("info", "Settings saved successfully");
        toast({
          title: "Settings saved",
          description: "Your settings have been saved successfully.",
        });
        // Trigger reconnection test after settings are saved
        setSettingsSaved(prev => !prev);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      sendLog(
        "error",
        `Failed to save settings: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      toast({
        title: "Save failed",
        description: `Could not save settings: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    setSettings(defaultConfig);
    sendLog("warning", "Settings reset to defaults");

    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Emote Overlay Tools
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your stream overlay animations and features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="animations">Animations</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <Card>
              <TabsContent value="general" className="mt-0">
                <GeneralSettings
                  settings={settings}
                  setSettings={setSettings}
                  resetSettings={resetSettings}
                />
              </TabsContent>

              <TabsContent value="features" className="mt-0">
                <FeatureSettings
                  settings={settings}
                  setSettings={setSettings}
                />
              </TabsContent>

              <TabsContent value="animations" className="mt-0">
                <AnimationSettings
                  settings={settings}
                  setSettings={setSettings}
                />
              </TabsContent>

              <TabsContent value="logs" className="mt-0">
                <LogsView overlayServerPort={settings.overlayServerPort} />
              </TabsContent>

              <TabsContent value="support" className="mt-0">
                <Support />
              </TabsContent>

              {activeTab !== "support" && (
                <CardFooter className="flex justify-between border-t p-6">
                  <div></div>{" "}
                  {/* Empty div to maintain the justify-between spacing */}
                  <Button onClick={saveSettings}>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </CardFooter>
              )}
            </Card>
          </Tabs>
        </div>

        <div className="lg:col-span-2 flex flex-col space-y-6 min-h-0">
          <ConnectionStatus 
            settings={settings} 
            key={settingsSaved ? "saved" : "not-saved"} // Force re-render when settings are saved
          />
          <OverlayUrl
            url={
              settings.overlayServerPort
                ? `http://localhost:${settings.overlayServerPort}`
                : "http://localhost:3030"
            }
          />

          <div className="flex-1 min-h-0">
            <PreviewPane
              previewUrl={
                settings.overlayServerPort
                  ? `http://localhost:${settings.overlayServerPort}`
                  : "http://localhost:3030"
              }
              settings={settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
