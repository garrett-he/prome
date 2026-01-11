import { Copy, Star } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { promptCopy } from "@/lib/invoke";
import type { PromptSummary } from "@/types";

interface PromptCardProps {
    prompt: PromptSummary;
}

export function PromptCard({ prompt }: PromptCardProps) {
    const navigate = useNavigate();

    const handleCopy = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            await promptCopy(prompt.id);
            toast.success("Prompt copied to clipboard");
        },
        [prompt.id],
    );

    return (
        <Card
            className="group cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/vault/prompts/${prompt.id}`)}
        >
            <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold">{prompt.title}</h3>
                    <div className="flex shrink-0 items-center gap-1">
                        {prompt.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        <button
                            type="button"
                            className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
                            onClick={handleCopy}
                        >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
                {prompt.description && (
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{prompt.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                    {prompt.category_name && (
                        <Badge
                            variant="secondary"
                            style={
                                prompt.category_color
                                    ? { backgroundColor: prompt.category_color, color: "#fff" }
                                    : undefined
                            }
                        >
                            {prompt.category_name}
                        </Badge>
                    )}
                    {prompt.tag_names.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                        </Badge>
                    ))}
                    {prompt.tag_names.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{prompt.tag_names.length - 2}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
