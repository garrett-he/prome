import { create } from "zustand";
import i18n, { detectSystemLanguage, isLanguage, type Language } from "@/i18n";
import * as invoke from "@/lib/invoke";
import type { Category, Tag, VaultInfo } from "@/types";

interface AppState {
    // Language
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    initLanguage: () => Promise<void>;

    // Vault
    currentVault: VaultInfo | null;
    recentVaults: VaultInfo[];
    initializing: boolean;
    initialized: boolean;
    initVault: () => Promise<void>;
    openVault: (path: string) => Promise<void>;
    createVault: (path: string) => Promise<void>;
    closeVault: () => Promise<void>;
    fetchRecentVaults: () => Promise<void>;
    removeRecentVault: (path: string) => Promise<void>;

    // Sidebar filters
    selectedCategoryId: number | null;
    selectedTagIds: number[];
    searchQuery: string;
    sortBy: "updated" | "created" | "title" | "usage";
    setSelectedCategoryId: (id: number | null) => void;
    toggleTagId: (id: number) => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (sort: "updated" | "created" | "title" | "usage") => void;

    // Categories & Tags
    categories: Category[];
    tags: Tag[];
    fetchCategories: () => Promise<void>;
    fetchTags: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Language
    language: detectSystemLanguage(),

    setLanguage: async (lang) => {
        set({ language: lang });
        await i18n.changeLanguage(lang);
        await invoke.configSetLanguage(lang);
    },

    initLanguage: async () => {
        let lang: Language = detectSystemLanguage();
        try {
            const config = await invoke.configGet();
            if (isLanguage(config.language)) lang = config.language;
        } catch {
            // fall back to system language
        }
        await i18n.changeLanguage(lang);
        set({ language: lang });
    },

    // Vault
    currentVault: null,
    recentVaults: [],
    initializing: false,
    initialized: false,

    initVault: async () => {
        if (get().initialized || get().initializing) return;
        set({ initializing: true });
        try {
            const recentVaults = await invoke.vaultListRecent();
            set({ recentVaults });
            if (recentVaults.length > 0) {
                const last = recentVaults[0];
                try {
                    const info = await invoke.vaultOpen(last.path);
                    set({ currentVault: info });
                    await Promise.all([get().fetchCategories(), get().fetchTags()]);
                } catch {
                    // last vault path may no longer exist; ignore and show WelcomePage
                }
            }
        } finally {
            set({ initializing: false, initialized: true });
        }
    },

    openVault: async (path: string) => {
        const info = await invoke.vaultOpen(path);
        set({ currentVault: info });
        get().fetchCategories();
        get().fetchTags();
    },

    createVault: async (path: string) => {
        const info = await invoke.vaultCreate(path);
        set({ currentVault: info });
        get().fetchCategories();
        get().fetchTags();
    },

    closeVault: async () => {
        await invoke.vaultClose();
        set({
            currentVault: null,
            categories: [],
            tags: [],
            selectedCategoryId: null,
            selectedTagIds: [],
            searchQuery: "",
        });
    },

    fetchRecentVaults: async () => {
        const recentVaults = await invoke.vaultListRecent();
        set({ recentVaults });
    },

    removeRecentVault: async (path: string) => {
        await invoke.vaultRemoveRecent(path);
        await get().fetchRecentVaults();
    },

    // Filters
    selectedCategoryId: null,
    selectedTagIds: [],
    searchQuery: "",
    sortBy: "updated",

    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
    toggleTagId: (id) => {
        const current = get().selectedTagIds;
        const next = current.includes(id) ? current.filter((t) => t !== id) : [...current, id];
        set({ selectedTagIds: next });
    },
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSortBy: (sort) => set({ sortBy: sort }),

    // Categories & Tags
    categories: [],
    tags: [],

    fetchCategories: async () => {
        const categories = await invoke.categoryList();
        set({ categories });
    },

    fetchTags: async () => {
        const tags = await invoke.tagList();
        set({ tags });
    },
}));
