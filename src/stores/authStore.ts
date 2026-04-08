import { create } from "zustand";
import * as api from "../lib/tauri";
import type { AppView } from "../types";

interface AuthState {
  view: AppView;
  loading: boolean;
  error: string | null;
  checkVault: () => Promise<void>;
  setup: (password: string) => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  view: "unlock",
  loading: true,
  error: null,

  checkVault: async () => {
    set({ loading: true });
    try {
      const exists = await api.isVaultSetup();
      set({ view: exists ? "unlock" : "setup", loading: false });
    } catch {
      set({ view: "setup", loading: false });
    }
  },

  setup: async (password: string) => {
    set({ loading: true, error: null });
    try {
      await api.setupVault(password);
      set({ view: "main", loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  unlock: async (password: string) => {
    set({ loading: true, error: null });
    try {
      const success = await api.unlockVault(password);
      if (success) {
        set({ view: "main", loading: false });
      } else {
        set({ error: "Wrong master password", loading: false });
      }
      return success;
    } catch (e) {
      set({ error: String(e), loading: false });
      return false;
    }
  },

  lock: async () => {
    await api.lockVault();
    set({ view: "unlock", error: null });
  },
}));
