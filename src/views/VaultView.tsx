import { useEffect, useState } from "react";
import { SearchBar } from "@/components/layout/SearchBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { PromptGrid } from "@/components/prompt/PromptGrid";
import { promptList } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptSummary } from "@/types";

export function VaultView() {
    const { currentVault, selectedCategoryId, selectedTagIds, searchQuery, sortBy } = useAppStore();
    const [prompts, setPrompts] = useState<PromptSummary[]>([]);

    useEffect(() => {
        if (!currentVault) return;

        promptList({
            category_id: selectedCategoryId,
            tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            search: searchQuery || undefined,
            sort: sortBy,
        }).then((result) => setPrompts(result.items));
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
                    <PromptGrid prompts={prompts} />
                </div>
            </main>
        </div>
    );
}
