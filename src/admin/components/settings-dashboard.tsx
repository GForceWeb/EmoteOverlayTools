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
import type { Settings, LogEntry } from "@/shared/types";
import { useToast } from "@/admin/hooks/use-toast";

import { SaveIcon } from "lucide-react";
import { PreviewPane } from "@/admin/components/preview-pane";
import { ConnectionStatus } from "@/admin/components/connection-status";

import { defaultConfig } from "@/shared/defaultConfig";

export function SettingsDashboard() {
  const [settings, setSettings] = useState<Settings>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Load settings from config file when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const streamerBotWebsocketUrl = settings.overlayServerPort
          ? `http://localhost:${settings.overlayServerPort}`
          : "http://localhost:3030";

        const response = await fetch(`${streamerBotWebsocketUrl}/api/settings`);

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.statusText}`);
        }

        const data = await response.json();
        setSettings(data);
        addLogEntry("info", "Settings loaded from config file");
      } catch (error) {
        console.error("Failed to load settings:", error);
        addLogEntry(
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

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date(),
      type: "info",
      message: "Settings dashboard initialized",
    },
  ]);

  const { toast } = useToast();

  const addLogEntry = (type: "info" | "warning" | "error", message: string) => {
    const newEntry: LogEntry = {
      timestamp: new Date(),
      type,
      message,
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const clearLogs = () => {
    setLogs([
      {
        timestamp: new Date(),
        type: "info",
        message: "Logs cleared",
      },
    ]);
  };

  const saveSettings = async () => {
    try {
      const result = await window.electronAPI.saveSettings(settings);
      if (result.success) {
        addLogEntry("info", "Settings saved successfully");
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
      addLogEntry(
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
    addLogEntry("warning", "Settings reset to defaults");

    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight fill-white">
          Twitch Overlay Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your stream overlay animations and features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="animations">Animations</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
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
                <LogsView logs={logs} onClearLogs={clearLogs} />
              </TabsContent>

              <CardFooter className="flex justify-between border-t p-6">
                <div></div>{" "}
                {/* Empty div to maintain the justify-between spacing */}
                <Button onClick={saveSettings}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </Tabs>
        </div>

        <div className="lg:col-span-1 flex flex-col space-y-6 min-h-0">
          <ConnectionStatus 
            settings={settings} 
            key={settingsSaved ? "saved" : "not-saved"} // Force re-render when settings are saved
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
