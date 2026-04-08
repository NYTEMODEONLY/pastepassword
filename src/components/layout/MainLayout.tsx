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
    <div className="noise-bg flex h-screen bg-bg">
      <Sidebar onQuickAdd={() => setShowQuickAdd(true)} onSettings={() => setShowSettings(true)} />
      <CredentialList onQuickAdd={() => setShowQuickAdd(true)} />
      {selectedId ? (
        <CredentialDetail />
      ) : (
        <EmptyDetail />
      )}

      {showQuickAdd && (
        <QuickAddModal onClose={() => setShowQuickAdd(false)} />
      )}
      {showSearch && <SearchPalette onClose={() => setShowSearch(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-bg-secondary">
          <svg
            className="h-7 w-7 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
            />
          </svg>
        </div>
        <p className="text-sm text-text-secondary">Select a credential</p>
        <p className="mt-1 text-xs text-text-muted">
          or press <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">⌘N</kbd> to add one
        </p>
      </div>
    </div>
  );
}
