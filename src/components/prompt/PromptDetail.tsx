import { ArrowLeft, Copy, Pencil, Star, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { promptCopy, promptDelete, promptToggleFavorite } from "@/lib/invoke";
import type { PromptDetail as PromptDetailType } from "@/types";

interface PromptDetailProps {
    prompt: PromptDetailType;
    onRefresh: () => void;
}

export function PromptDetail({ prompt, onRefresh }: PromptDetailProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleCopy = useCallback(async () => {
        await promptCopy(prompt.id);
        toast.success(t("promptDetail.copy"));
    }, [prompt.id, t]);

    const handleFavorite = useCallback(async () => {
        await promptToggleFavorite(prompt.id);
        onRefresh();
    }, [prompt.id, onRefresh]);

    const handleDelete = useCallback(async () => {
        await promptDelete(prompt.id);
        toast.success(t("promptDetail.delete"));
        navigate("/vault");
    }, [prompt.id, navigate, t]);

    return (
        <div className="w-full p-6">
            {/* Sticky toolbar */}
            <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 border-b bg-background px-6 pb-4 pt-5">
                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => navigate("/vault")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t("common.back")}
                    </button>
                    {prompt.category_name && (
                        <>
                            <span>/</span>
                            <span>{prompt.category_name}</span>
                        </>
                    )}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{prompt.title}</h1>
                        {prompt.description && <p className="mt-1 text-muted-foreground">{prompt.description}</p>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            <Copy className="mr-1 h-4 w-4" />
                            {t("promptDetail.copy")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleFavorite}>
                            <Star
                                className={`mr-1 h-4 w-4 ${prompt.favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                            />
                            {prompt.favorite ? t("promptDetail.unfavorite") : t("promptDetail.favorite")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vault/prompts/${prompt.id}/edit`)}
                        >
                            <Pencil className="mr-1 h-4 w-4" />
                            {t("promptDetail.edit")}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                            <Trash2 className="mr-1 h-4 w-4" />
                            {t("promptDetail.delete")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div className="mb-6 flex flex-wrap gap-2">
                {prompt.category_name && (
                    <Badge
                        style={
                            prompt.category_color
                                ? { backgroundColor: prompt.category_color, color: "#fff" }
                                : undefined
                        }
                    >
                        {prompt.category_name}
                    </Badge>
                )}
                {prompt.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                        #{tag.name}
                    </Badge>
                ))}
            </div>

            {/* Content */}
            <div className="rounded-lg border bg-muted/50 p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{prompt.content}</pre>
            </div>

            {/* Meta */}
            <div className="mt-4 text-xs text-muted-foreground">
                {t("promptDetail.created", { date: prompt.created_at })} &middot;
                {t("promptDetail.updated", { date: prompt.updated_at })} &middot;
                {t("promptDetail.used", { count: prompt.usage_count })}
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("promptDetail.deleteTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("promptDetail.deleteDescription", { title: prompt.title })}
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
