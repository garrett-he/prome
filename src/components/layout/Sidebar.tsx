import { CategoryList } from "@/components/category/CategoryList";
import { TagList } from "@/components/tag/TagList";
import { VaultSwitcher } from "@/components/vault/VaultSwitcher";

export function Sidebar() {
    return (
        <aside className="flex h-full w-60 flex-col bg-muted/50">
            <div className="flex-1 overflow-y-auto p-3">
                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Categories</div>
                <CategoryList />
                <div className="my-3 h-px bg-muted" />
                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Tags</div>
                <TagList />
            </div>
            <div className="border-t border-border/50 bg-background/50 p-3">
                <VaultSwitcher />
            </div>
        </aside>
    );
}
