import { useCallback, useEffect, useState } from "react";
import type { TwitchStatus } from "@/shared/twitch";

export function useTwitchConnection() {
  const [status, setStatus] = useState<TwitchStatus>({ configured: false, state: "disconnected", warnings: [] });
  const refresh = useCallback(async () => {
    if (!window.electronAPI?.getTwitchStatus) return;
    try { setStatus(await window.electronAPI.getTwitchStatus()); }
    catch { setStatus(previous => ({ ...previous, state: "error", error: "Could not read the Twitch connection status." })); }
  }, []);
  useEffect(() => {
    let active = true;
    const unsubscribe = window.electronAPI?.onTwitchStatus?.(value => { if (active) setStatus(value); });
    if (window.electronAPI?.getTwitchStatus) {
      void window.electronAPI.getTwitchStatus().then(value => { if (active) setStatus(value); }).catch(() => {
        if (active) setStatus(previous => ({ ...previous, state: "error", error: "Could not read the Twitch connection status." }));
      });
    }
    return () => { active = false; unsubscribe?.(); };
  }, []);
  const login = async () => {
    try { await window.electronAPI.loginTwitch(); await refresh(); }
    catch (error) { setStatus(previous => ({ ...previous, state: "error", error: error instanceof Error ? error.message : "Twitch login failed." })); }
  };
  const disconnect = async () => {
    try { await window.electronAPI.disconnectTwitch(); await refresh(); }
    catch (error) { setStatus(previous => ({ ...previous, state: "error", error: error instanceof Error ? error.message : "Could not disconnect Twitch." })); }
  };
  return { status, refresh, login, disconnect };
}
