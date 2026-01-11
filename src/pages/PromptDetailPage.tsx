import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PromptDetail as PromptDetailComponent } from "@/components/prompt/PromptDetail";
import { promptGet } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptDetail } from "@/types";

export function PromptDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentVault = useAppStore((s) => s.currentVault);
    const [prompt, setPrompt] = useState<PromptDetail | null>(null);

    useEffect(() => {
        if (!currentVault || !id) return;
        promptGet(Number(id))
            .then(setPrompt)
            .catch(() => navigate("/vault"));
    }, [currentVault, id, navigate]);

    if (!currentVault) return <Navigate to="/" replace />;

    if (!prompt) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">{t("common.loading")}</div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col overflow-y-auto">
            <PromptDetailComponent prompt={prompt} onRefresh={() => promptGet(Number(id)).then(setPrompt)} />
        </div>
    );
}
