import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app";
import type { Category } from "@/types";

const CATEGORY_COLORS = ["#6b7280", "#d97706", "#4f46e5", "#16a34a", "#dc2626", "#db2777", "#0891b2", "#7c3aed"];

interface CategoryItemProps {
    category: Category;
}

function CategoryItem({ category }: CategoryItemProps) {
    const { t } = useTranslation();
    const { selectedCategoryId, setSelectedCategoryId, updateCategory, deleteCategory } = useAppStore(
        useShallow((s) => ({
            selectedCategoryId: s.selectedCategoryId,
            setSelectedCategoryId: s.setSelectedCategoryId,
            updateCategory: s.updateCategory,
            deleteCategory: s.deleteCategory,
        })),
    );
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(category.name);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleSelect = useCallback(() => {
        if (!editing) setSelectedCategoryId(category.id);
    }, [category.id, editing, setSelectedCategoryId]);

    const handleRenameSubmit = useCallback(async () => {
        const name = editName.trim();
        if (!name) {
            setEditName(category.name);
            setEditing(false);
            return;
        }
        if (name === category.name) {
            setEditing(false);
            return;
        }
        try {
            await updateCategory({ id: category.id, name });
            setEditing(false);
        } catch {
            toast.error(t("category.renameFailed"));
        }
    }, [category.id, category.name, editName, t, updateCategory]);

    const handleRenameKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                void handleRenameSubmit();
            } else if (e.key === "Escape") {
                setEditName(category.name);
                setEditing(false);
            }
        },
        [category.name, handleRenameSubmit],
    );

    const handleSetColor = useCallback(
        async (color: string) => {
            try {
                await updateCategory({ id: category.id, color });
            } catch {
                toast.error(t("category.colorFailed"));
            }
        },
        [category.id, t, updateCategory],
    );

    const handleDelete = useCallback(async () => {
        try {
            await deleteCategory(category.id);
            toast.success(t("category.deleted"));
        } catch {
            toast.error(t("category.deleteFailed"));
        }
    }, [category.id, deleteCategory, t]);

    return (
        <div className="group flex items-center gap-1 rounded-md">
            {editing ? (
                <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={() => void handleRenameSubmit()}
                    className={cn(
                        "h-6 min-w-0 flex-1 px-1.5 py-0 text-sm",
                        selectedCategoryId === category.id && "bg-accent font-medium",
                    )}
                />
            ) : (
                <button
                    type="button"
                    className={cn(
                        "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left",
                        selectedCategoryId === category.id && "bg-accent font-medium",
                    )}
                    onClick={handleSelect}
                >
                    {category.color && (
                        <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                        />
                    )}
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                </button>
            )}

            {!editing && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>{category.name}</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                setEditName(category.name);
                                setEditing(true);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                            {t("category.rename")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>{t("category.color")}</DropdownMenuLabel>
                        <div className="flex gap-1 px-2 py-1.5">
                            {CATEGORY_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={cn(
                                        "h-4 w-4 rounded-full border border-border hover:scale-110",
                                        category.color === color && "ring-2 ring-ring ring-offset-1",
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => void handleSetColor(color)}
                                />
                            ))}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setConfirmOpen(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            {t("category.delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("category.deleteTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("category.deleteDescription", { name: category.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            {t("common.delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function CategoryList() {
    const { t } = useTranslation();
    const { categories, selectedCategoryId, setSelectedCategoryId, createCategory } = useAppStore(
        useShallow((s) => ({
            categories: s.categories,
            selectedCategoryId: s.selectedCategoryId,
            setSelectedCategoryId: s.setSelectedCategoryId,
            createCategory: s.createCategory,
        })),
    );
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState("");

    const handleAddSubmit = useCallback(async () => {
        const name = newName.trim();
        if (!name) {
            setAdding(false);
            setNewName("");
            return;
        }
        try {
            const category = await createCategory(name);
            setNewName("");
            setAdding(false);
            if (category) setSelectedCategoryId(category.id);
        } catch {
            toast.error(t("category.createFailed"));
        }
    }, [createCategory, newName, setSelectedCategoryId, t]);

    const handleAddKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                void handleAddSubmit();
            } else if (e.key === "Escape") {
                setNewName("");
                setAdding(false);
            }
        },
        [handleAddSubmit],
    );

    return (
        <div className="flex flex-col gap-0.5">
            <button
                type="button"
                className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-left",
                    selectedCategoryId === null && "bg-accent font-medium",
                )}
                onClick={() => setSelectedCategoryId(null)}
            >
                <span className="flex-1">{t("category.all")}</span>
            </button>

            {adding ? (
                <div className="flex items-center gap-1 px-1 py-0.5">
                    <Input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleAddKeyDown}
                        onBlur={() => void handleAddSubmit()}
                        placeholder={t("category.namePlaceholder")}
                        className="h-6 px-1.5 py-0 text-sm"
                    />
                </div>
            ) : null}

            {categories.map((cat) => (
                <CategoryItem key={cat.id} category={cat} />
            ))}

            {!adding && (
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    onClick={() => setAdding(true)}
                >
                    <Plus className="h-4 w-4" />
                    <span>{t("category.add")}</span>
                </button>
            )}
        </div>
    );
}
