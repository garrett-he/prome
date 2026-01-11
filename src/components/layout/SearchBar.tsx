import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/stores/app";

export function SearchBar() {
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
                placeholder="Search prompts..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="max-w-sm"
            />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="usage">Most Used</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => navigate("/vault/prompts/new")}>New Prompt</Button>
        </div>
    );
}
