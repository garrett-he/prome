import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PromptDetail as PromptDetailComponent } from "@/components/prompt/PromptDetail";
import { promptGet } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptDetail } from "@/types";

export function PromptDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentVault = useAppStore((s) => s.currentVault);
    const [prompt, setPrompt] = useState<PromptDetail | null>(null);

    useEffect(() => {
        if (!currentVault) {
            navigate("/", { replace: true });
        }
    }, [currentVault, navigate]);

    useEffect(() => {
        if (!id) return;
        promptGet(Number(id))
            .then(setPrompt)
            .catch(() => navigate("/vault"));
    }, [id, navigate]);

    if (!prompt) {
        return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="flex h-screen w-full flex-col overflow-y-auto">
            <PromptDetailComponent prompt={prompt} onRefresh={() => promptGet(Number(id)).then(setPrompt)} />
        </div>
    );
}
