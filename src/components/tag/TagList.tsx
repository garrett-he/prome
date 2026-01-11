import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app";

export function TagList() {
    const { tags, selectedTagIds, toggleTagId } = useAppStore(
        useShallow((s) => ({ tags: s.tags, selectedTagIds: s.selectedTagIds, toggleTagId: s.toggleTagId })),
    );

    if (tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
                <button
                    key={tag.id}
                    type="button"
                    className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs border transition-colors",
                        selectedTagIds.includes(tag.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-secondary-foreground border-border hover:bg-accent",
                    )}
                    onClick={() => toggleTagId(tag.id)}
                >
                    #{tag.name}
                </button>
            ))}
        </div>
    );
}
