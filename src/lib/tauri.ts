import { invoke } from "@tauri-apps/api/core";
import type {
  Credential,
  CredentialSummary,
  CredentialFilter,
  CredentialUpdate,
  Tag,
} from "../types";

// Auth
export const isVaultSetup = () => invoke<boolean>("is_vault_setup");
export const setupVault = (password: string) =>
  invoke<void>("setup_vault", { password });
export const unlockVault = (password: string) =>
  invoke<boolean>("unlock_vault", { password });
export const lockVault = () => invoke<void>("lock_vault");

// Credentials
export const addCredential = (params: {
  title: string;
  value: string;
  credType?: string;
  notes: string;
  tagIds: string[];
}) =>
  invoke<CredentialSummary>("add_credential", {
    title: params.title,
    value: params.value,
    credType: params.credType,
    notes: params.notes,
    tagIds: params.tagIds,
  });

export const getCredentials = (filter?: CredentialFilter) =>
  invoke<CredentialSummary[]>("get_credentials", { filter: filter ?? null });

export const getCredential = (id: string) =>
  invoke<Credential>("get_credential", { id });

export const updateCredential = (id: string, updates: CredentialUpdate) =>
  invoke<void>("update_credential", { id, updates });

export const deleteCredential = (id: string) =>
  invoke<void>("delete_credential", { id });

export const searchCredentials = (query: string) =>
  invoke<CredentialSummary[]>("search_credentials", { query });

// Tags
export const getTags = () => invoke<Tag[]>("get_tags");
export const createTag = (name: string, color?: string) =>
  invoke<Tag>("create_tag", { name, color });
export const deleteTag = (id: string) => invoke<void>("delete_tag", { id });

// Import/Export
export const exportVault = (path: string) =>
  invoke<number>("export_vault", { path });
export const importVault = (path: string) =>
  invoke<number>("import_vault", { path });

// Settings
export const setAutoLockSeconds = (seconds: number) =>
  invoke<void>("set_auto_lock_seconds", { seconds });
