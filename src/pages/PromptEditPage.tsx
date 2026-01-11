import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PromptEditor } from "@/components/prompt/PromptEditor";
import { promptGet } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptDetail } from "@/types";

export function PromptEditPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentVault = useAppStore((s) => s.currentVault);
    const isNew = !id;
    const [prompt, setPrompt] = useState<PromptDetail | undefined>(undefined);

    useEffect(() => {
        if (isNew || !currentVault || !id) return;
        promptGet(Number(id))
            .then(setPrompt)
            .catch(() => navigate("/vault"));
    }, [currentVault, id, isNew, navigate]);

    if (!currentVault) return <Navigate to="/" replace />;

    if (!isNew && !prompt) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">{t("common.loading")}</div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col overflow-y-auto">
            <PromptEditor key={id ?? "new"} prompt={isNew ? undefined : prompt} />
        </div>
    );
}
