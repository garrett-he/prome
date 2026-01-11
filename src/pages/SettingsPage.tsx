import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from "@/i18n";
import { useAppStore } from "@/stores/app";

export function SettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const language = useAppStore((s) => s.language);
    const setLanguage = useAppStore((s) => s.setLanguage);

    const handleLanguageChange = async (value: string) => {
        try {
            await setLanguage(value as Language);
            toast.success(t("settings.languageSaved"));
        } catch {
            toast.error(t("settings.languageSaveFailed"));
        }
    };

    return (
        <div className="flex h-screen w-full flex-col overflow-y-auto">
            <div className="w-full max-w-2xl p-6">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        {t("common.back")}
                    </Button>
                </div>

                <h1 className="mb-6 text-2xl font-bold">{t("settings.title")}</h1>

                <div className="flex flex-col gap-4">
                    <div>
                        <Label>{t("settings.language")}</Label>
                        <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="zh">中文</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
