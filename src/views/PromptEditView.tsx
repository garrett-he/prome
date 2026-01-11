import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PromptEditor } from "@/components/prompt/PromptEditor";
import { promptGet } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptDetail } from "@/types";

export function PromptEditView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentVault = useAppStore((s) => s.currentVault);
    const isNew = !id;
    const [prompt, setPrompt] = useState<PromptDetail | undefined>(undefined);

    useEffect(() => {
        if (!currentVault) {
            navigate("/", { replace: true });
        }
    }, [currentVault, navigate]);

    useEffect(() => {
        if (isNew || !id) return;
        promptGet(Number(id))
            .then(setPrompt)
            .catch(() => navigate("/vault"));
    }, [id, isNew, navigate]);

    if (!isNew && !prompt) {
        return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="flex h-screen w-full flex-col overflow-y-auto">
            <PromptEditor prompt={isNew ? undefined : prompt} />
        </div>
    );
}
