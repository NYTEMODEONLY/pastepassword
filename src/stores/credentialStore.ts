import { create } from "zustand";
import * as api from "../lib/tauri";
import type {
  CredentialSummary,
  Credential,
  CredentialFilter,
  Tag,
} from "../types";

interface CredentialState {
  credentials: CredentialSummary[];
  selectedId: string | null;
  selectedCredential: Credential | null;
  tags: Tag[];
  filter: CredentialFilter;
  searchQuery: string;
  loading: boolean;

  loadCredentials: () => Promise<void>;
  loadTags: () => Promise<void>;
  selectCredential: (id: string | null) => Promise<void>;
  setFilter: (filter: Partial<CredentialFilter>) => void;
  setSearchQuery: (query: string) => Promise<void>;
  addCredential: (params: {
    title: string;
    value: string;
    credType?: string;
    notes: string;
    tagIds: string[];
  }) => Promise<CredentialSummary>;
  deleteCredential: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
}

export const useCredentialStore = create<CredentialState>((set, get) => ({
  credentials: [],
  selectedId: null,
  selectedCredential: null,
  tags: [],
  filter: {},
  searchQuery: "",
  loading: false,

  loadCredentials: async () => {
    set({ loading: true });
    try {
      const { searchQuery, filter } = get();
      const credentials = searchQuery
        ? await api.searchCredentials(searchQuery)
        : await api.getCredentials(filter);
      set({ credentials, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadTags: async () => {
    try {
      const tags = await api.getTags();
      set({ tags });
    } catch {
      // ignore
    }
  },

  selectCredential: async (id: string | null) => {
    if (!id) {
      set({ selectedId: null, selectedCredential: null });
      return;
    }
    set({ selectedId: id });
    try {
      const credential = await api.getCredential(id);
      set({ selectedCredential: credential });
    } catch {
      set({ selectedId: null, selectedCredential: null });
    }
  },

  setFilter: (filter: Partial<CredentialFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
      searchQuery: "",
      selectedId: null,
      selectedCredential: null,
    }));
    get().loadCredentials();
  },

  setSearchQuery: async (query: string) => {
    set({ searchQuery: query, selectedId: null, selectedCredential: null });
    try {
      const credentials = query
        ? await api.searchCredentials(query)
        : await api.getCredentials(get().filter);
      set({ credentials });
    } catch {
      // ignore
    }
  },

  addCredential: async (params) => {
    const cred = await api.addCredential(params);
    await get().loadCredentials();
    await get().loadTags();
    return cred;
  },

  deleteCredential: async (id: string) => {
    await api.deleteCredential(id);
    const { selectedId } = get();
    if (selectedId === id) {
      set({ selectedId: null, selectedCredential: null });
    }
    await get().loadCredentials();
  },

  toggleFavorite: async (id: string) => {
    const { credentials } = get();
    const cred = credentials.find((c) => c.id === id);
    if (!cred) return;
    await api.updateCredential(id, { is_favorite: !cred.is_favorite });
    await get().loadCredentials();
    // Refresh selected if it's the toggled one
    const { selectedId } = get();
    if (selectedId === id) {
      const updated = await api.getCredential(id);
      set({ selectedCredential: updated });
    }
  },

  createTag: async (name: string, color?: string) => {
    const tag = await api.createTag(name, color);
    await get().loadTags();
    return tag;
  },
}));
