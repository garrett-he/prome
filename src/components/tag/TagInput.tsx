import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Tag } from "@/types";

interface TagInputProps {
    availableTags: Tag[];
    selectedTagIds: number[];
    onChange: (tagIds: number[]) => void;
    onCreateTag: (name: string) => Promise<Tag>;
    className?: string;
}

export function TagInput({ availableTags, selectedTagIds, onChange, onCreateTag, className }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const selectedTags = availableTags.filter((t) => selectedTagIds.includes(t.id));

    const handleKeyDown = useCallback(
        async (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && inputValue.trim()) {
                e.preventDefault();
                const name = inputValue.trim();
                let tag = availableTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
                if (!tag) {
                    tag = await onCreateTag(name);
                }
                if (tag && !selectedTagIds.includes(tag.id)) {
                    onChange([...selectedTagIds, tag.id]);
                }
                setInputValue("");
            }
        },
        [inputValue, availableTags, selectedTagIds, onChange, onCreateTag],
    );

    const handleRemove = (tagId: number) => {
        onChange(selectedTagIds.filter((id) => id !== tagId));
    };

    return (
        <div className={`flex flex-wrap items-center gap-1.5 rounded-md border p-2 ${className}`}>
            {selectedTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="gap-1">
                    #{tag.name}
                    <button
                        type="button"
                        className="ml-0.5 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemove(tag.id)}
                    >
                        &times;
                    </button>
                </Badge>
            ))}
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
                className="min-w-[100px] border-0 p-0 shadow-none focus-visible:ring-0"
            />
        </div>
    );
}
