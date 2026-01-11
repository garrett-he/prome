import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CategoryList } from "@/components/category/CategoryList";
import { TagList } from "@/components/tag/TagList";
import { Button } from "@/components/ui/button";
import { VaultSwitcher } from "@/components/vault/VaultSwitcher";

export function Sidebar() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <aside className="flex h-full w-60 flex-col bg-muted/50">
            <div className="flex-1 overflow-y-auto p-3">
                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                    {t("sidebar.categories")}
                </div>
                <CategoryList />
                <div className="my-3 h-px bg-muted" />
                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">{t("sidebar.tags")}</div>
                <TagList />
            </div>
            <div className="border-t border-border/50 bg-background/50 p-3">
                <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                        <VaultSwitcher />
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => navigate("/settings")}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}
