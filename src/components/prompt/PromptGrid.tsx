import type { PromptSummary } from "@/types";
import { PromptCard } from "./PromptCard";

interface PromptGridProps {
    prompts: PromptSummary[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
    if (prompts.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
                No prompts found. Create one to get started!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
            ))}
        </div>
    );
}
