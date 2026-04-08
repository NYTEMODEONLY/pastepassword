import { useEffect, useState, useCallback } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { useAuthStore } from "../../stores/authStore";
import { Sidebar } from "./Sidebar";
import { CredentialList } from "../credentials/CredentialList";
import { CredentialDetail } from "../credentials/CredentialDetail";
import { QuickAddModal } from "../credentials/QuickAddModal";
import { SearchPalette } from "../search/SearchPalette";
import { SettingsPanel } from "../settings/SettingsPanel";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";

export function MainLayout() {
  const { loadCredentials, loadTags, selectedId } = useCredentialStore();
  const { lock } = useAuthStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Track user activity for auto-lock
  const touchActivity = useCallback(() => {
    invoke("touch_activity").catch(() => {});
  }, []);

  useEffect(() => {
    loadCredentials();
    loadTags();
  }, [loadCredentials, loadTags]);

  // Register global shortcuts
  useEffect(() => {
    async function registerShortcuts() {
      try {
        await register("CommandOrControl+Shift+V", () => {
          setShowQuickAdd(true);
        });
        await register("CommandOrControl+Shift+F", () => {
          setShowSearch(true);
        });
      } catch {
        // Shortcuts may already be registered or unavailable
      }
    }

    registerShortcuts();
    return () => {
      unregisterAll().catch(() => {});
    };
  }, []);

  // Listen for tray events
  useEffect(() => {
    const unlisten: (() => void)[] = [];

    listen("tray-quick-add", () => setShowQuickAdd(true)).then((u) =>
      unlisten.push(u),
    );
    listen("tray-search", () => setShowSearch(true)).then((u) =>
      unlisten.push(u),
    );
    listen("tray-lock", () => lock()).then((u) => unlisten.push(u));
    listen("vault-locked", () => lock()).then((u) => unlisten.push(u));

    return () => unlisten.forEach((u) => u());
  }, [lock]);

  // Track activity on user interaction
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "mousemove"];
    let lastTouch = 0;

    function handler() {
      const now = Date.now();
      // Throttle to once per 30 seconds
      if (now - lastTouch > 30000) {
        lastTouch = now;
        touchActivity();
      }
    }

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    // Touch immediately on mount
    touchActivity();

    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, [touchActivity]);

  // In-app keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowQuickAdd(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar onQuickAdd={() => setShowQuickAdd(true)} onSettings={() => setShowSettings(true)} />
      <CredentialList onQuickAdd={() => setShowQuickAdd(true)} />
      {selectedId && <CredentialDetail />}

      {showQuickAdd && (
        <QuickAddModal onClose={() => setShowQuickAdd(false)} />
      )}
      {showSearch && <SearchPalette onClose={() => setShowSearch(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
