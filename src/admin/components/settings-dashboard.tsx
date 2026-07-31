"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/admin/components/ui/button";
import { GeneralSettings } from "@/admin/components/general-settings";
import { FeatureSettings } from "@/admin/components/feature-settings";
import { AnimationSettings } from "@/admin/components/animation-settings";
import { LogsView } from "@/admin/components/logs-view";
import { Support } from "@/admin/components/support";
import type { Settings } from "@/shared/types";
import { useToast } from "@/admin/hooks/use-toast";
import { SaveIcon } from "lucide-react";
import { PreviewPane } from "@/admin/components/preview-pane";
import { AppHeader, type AppTab } from "@/admin/components/app-header";
import { Footer } from "@/admin/components/footer";
import { useConnectionStatus } from "@/admin/hooks/use-connection-status";
import { useOverlayStatus } from "@/admin/hooks/use-overlay-status";
import { defaultConfig, deepMergeSettings } from "@/shared/defaultConfig";
import { cn } from "@/admin/lib/utils";

function isFirstRunSettings(settings: Settings) {
  return !settings.twitchUsername?.trim();
}

export function SettingsDashboard() {
  const [settings, setSettings] = useState<Settings>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>("features");
  const [isFirstRun, setIsFirstRun] = useState(false);

  const connection = useConnectionStatus(settings);

  const getBaseUrl = () => {
    return settings.overlayServerPort
      ? `http://localhost:${settings.overlayServerPort}`
      : "http://localhost:3030";
  };

  const overlayUrl = settings.overlayServerPort
    ? `http://localhost:${settings.overlayServerPort}`
    : "http://localhost:3030";

  const overlay = useOverlayStatus(overlayUrl);

  const sendLog = (type: "info" | "warning" | "error", message: string) => {
    fetch(`${getBaseUrl()}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message, source: "admin" }),
    }).catch((err) => console.error("Failed to send log:", err));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/settings`);

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.statusText}`);
        }

        const data = await response.json();
        const mergedSettings = deepMergeSettings(data, defaultConfig);
        setSettings(mergedSettings);

        const firstRun = isFirstRunSettings(mergedSettings);
        setIsFirstRun(firstRun);
        setActiveTab(firstRun ? "setup" : "features");

        sendLog("info", "Settings loaded from config file");
      } catch (error) {
        console.error("Failed to load settings:", error);
        // Treat failed load / empty defaults as first run
        setIsFirstRun(true);
        setActiveTab("setup");
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
        if (settings.twitchUsername?.trim()) {
          setIsFirstRun(false);
        }
        connection.testConnection();
        overlay.testOverlay();
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
    setIsFirstRun(true);
    setActiveTab("setup");
    sendLog("warning", "Settings reset to defaults");

    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  const showPreview = activeTab === "features" || activeTab === "animations";
  const showSave = activeTab !== "support";

  const setupGuideProps = {
    overlayUrl,
    websocketUrl: settings.streamerBotWebsocketUrl,
    onWebsocketUrlChange: (value: string) => {
      setSettings((prev) => ({ ...prev, streamerBotWebsocketUrl: value }));
    },
    overlayServerPort: settings.overlayServerPort,
    onOverlayServerPortChange: (port: number) => {
      setSettings((prev) => ({ ...prev, overlayServerPort: port }));
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sbConnectionState={connection.connectionState}
        overlayConnectionState={overlay.overlayState}
        onRetestSb={() => connection.testConnection(true)}
        onRetestOverlay={() => overlay.testOverlay(true)}
      />

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "mx-auto w-full max-w-5xl px-4 py-4 md:px-5 md:py-5",
            showPreview && "pb-52"
          )}
        >
          <div className="panel-surface overflow-hidden">
            {activeTab === "features" && (
              <FeatureSettings settings={settings} setSettings={setSettings} />
            )}
            {activeTab === "animations" && (
              <AnimationSettings
                settings={settings}
                setSettings={setSettings}
              />
            )}
            {activeTab === "setup" && (
              <GeneralSettings
                settings={settings}
                setSettings={setSettings}
                resetSettings={resetSettings}
                setupGuide={setupGuideProps}
                isFirstRun={isFirstRun}
              />
            )}
            {activeTab === "logs" && (
              <LogsView overlayServerPort={settings.overlayServerPort} />
            )}
            {activeTab === "support" && <Support />}
          </div>
        </div>
      </div>

      <PreviewPane
        previewUrl={overlayUrl}
        settings={settings}
        onSettingsChange={setSettings}
        visible={showPreview}
      />

      <Footer
        saveAction={
          showSave ? (
            <Button onClick={saveSettings} size="sm" className="h-8 shadow-md shadow-primary/20">
              <SaveIcon className="mr-1.5 h-3.5 w-3.5" />
              Save Settings
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
