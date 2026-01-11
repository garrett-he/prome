import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/layout/SearchBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { PromptGrid } from "@/components/prompt/PromptGrid";
import { promptList } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptSummary } from "@/types";

export function VaultPage() {
    const { t } = useTranslation();
    const currentVault = useAppStore((s) => s.currentVault);
    const selectedCategoryId = useAppStore((s) => s.selectedCategoryId);
    const selectedTagIds = useAppStore((s) => s.selectedTagIds);
    const searchQuery = useAppStore((s) => s.searchQuery);
    const sortBy = useAppStore((s) => s.sortBy);
    const [prompts, setPrompts] = useState<PromptSummary[]>([]);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!currentVault) return;

        let cancelled = false;
        setLoadError(false);
        promptList({
            category_id: selectedCategoryId,
            tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            search: searchQuery || undefined,
            sort: sortBy,
        })
            .then((result) => {
                if (!cancelled) setPrompts(result.items);
            })
            .catch(() => {
                if (!cancelled) setLoadError(true);
            });

        return () => {
            cancelled = true;
        };
    }, [currentVault, selectedCategoryId, selectedTagIds, searchQuery, sortBy]);

    if (!currentVault) return null;

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex flex-1 flex-col overflow-hidden">
                <div className="border-b p-4">
                    <SearchBar />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {loadError ? (
                        <div className="flex flex-1 items-center justify-center text-muted-foreground">
                            {t("vaultPage.loadFailed")}
                        </div>
                    ) : (
                        <PromptGrid prompts={prompts} />
                    )}
                </div>
            </main>
        </div>
    );
}
