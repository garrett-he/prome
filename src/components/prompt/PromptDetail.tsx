import { ArrowLeft, Copy, Pencil, Star, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { promptCopy, promptDelete, promptToggleFavorite } from "@/lib/invoke";
import type { PromptDetail as PromptDetailType } from "@/types";

interface PromptDetailProps {
    prompt: PromptDetailType;
    onRefresh: () => void;
}

export function PromptDetail({ prompt, onRefresh }: PromptDetailProps) {
    const navigate = useNavigate();

    const handleCopy = useCallback(async () => {
        await promptCopy(prompt.id);
        toast.success("Prompt copied to clipboard");
    }, [prompt.id]);

    const handleFavorite = useCallback(async () => {
        await promptToggleFavorite(prompt.id);
        onRefresh();
    }, [prompt.id, onRefresh]);

    const handleDelete = useCallback(async () => {
        await promptDelete(prompt.id);
        toast.success("Prompt deleted");
        navigate("/vault");
    }, [prompt.id, navigate]);

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
                        Back
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
                            Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleFavorite}>
                            <Star
                                className={`mr-1 h-4 w-4 ${prompt.favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                            />
                            {prompt.favorite ? "Unfavorite" : "Favorite"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vault/prompts/${prompt.id}/edit`)}
                        >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
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
                Created {prompt.created_at} &middot; Updated {prompt.updated_at} &middot; Used {prompt.usage_count}{" "}
                times
            </div>
        </div>
    );
}
