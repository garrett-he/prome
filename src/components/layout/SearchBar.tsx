import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/stores/app";

export function SearchBar() {
    const { t } = useTranslation();
    const { searchQuery, setSearchQuery, sortBy, setSortBy } = useAppStore(
        useShallow((s) => ({
            searchQuery: s.searchQuery,
            setSearchQuery: s.setSearchQuery,
            sortBy: s.sortBy,
            setSortBy: s.setSortBy,
        })),
    );
    const navigate = useNavigate();
    const [localQuery, setLocalQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(localQuery), 300);
        return () => clearTimeout(timer);
    }, [localQuery, setSearchQuery]);

    return (
        <div className="flex items-center gap-3 justify-end">
            <Input
                placeholder={t("search.placeholder")}
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="max-w-sm"
            />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="updated">{t("search.sortUpdated")}</SelectItem>
                    <SelectItem value="created">{t("search.sortCreated")}</SelectItem>
                    <SelectItem value="title">{t("search.sortTitle")}</SelectItem>
                    <SelectItem value="usage">{t("search.sortUsage")}</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => navigate("/vault/prompts/new")}>{t("search.newPrompt")}</Button>
        </div>
    );
}
