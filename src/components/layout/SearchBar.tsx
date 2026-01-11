import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/stores/app";

export function SearchBar() {
    const { searchQuery, setSearchQuery, sortBy, setSortBy } = useAppStore();
    const navigate = useNavigate();
    const [localQuery, setLocalQuery] = useState(searchQuery);

    const handleSearch = useCallback(
        (value: string) => {
            setLocalQuery(value);
            const timer = setTimeout(() => setSearchQuery(value), 300);
            return () => clearTimeout(timer);
        },
        [setSearchQuery],
    );

    return (
        <div className="flex items-center gap-3 justify-end">
            <Input
                placeholder="Search prompts..."
                value={localQuery}
                onChange={(e) => handleSearch(e.target.value)}
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
