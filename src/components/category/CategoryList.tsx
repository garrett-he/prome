import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app";

export function CategoryList() {
    const { categories, selectedCategoryId, setSelectedCategoryId } = useAppStore(
        useShallow((s) => ({
            categories: s.categories,
            selectedCategoryId: s.selectedCategoryId,
            setSelectedCategoryId: s.setSelectedCategoryId,
        })),
    );

    return (
        <div className="flex flex-col gap-0.5">
            <button
                type="button"
                className={cn(
                    "rounded-md px-3 py-1.5 text-sm text-left",
                    selectedCategoryId === null && "bg-accent font-medium",
                )}
                onClick={() => setSelectedCategoryId(null)}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    type="button"
                    className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-left",
                        selectedCategoryId === cat.id && "bg-accent font-medium",
                    )}
                    onClick={() => setSelectedCategoryId(cat.id)}
                >
                    {cat.color && (
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                        />
                    )}
                    <span className="flex-1 truncate">{cat.name}</span>
                </button>
            ))}
        </div>
    );
}
