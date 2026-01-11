import { ArrowLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { TagInput } from "@/components/tag/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { promptCreate, promptUpdate, tagCreate } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptDetail as PromptDetailType, Tag } from "@/types";

interface PromptEditorProps {
    prompt?: PromptDetailType;
}

export function PromptEditor({ prompt }: PromptEditorProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { categories, tags, fetchTags } = useAppStore(
        useShallow((s) => ({ categories: s.categories, tags: s.tags, fetchTags: s.fetchTags })),
    );
    const isEditing = !!prompt;

    const [title, setTitle] = useState(prompt?.title ?? "");
    const [description, setDescription] = useState(prompt?.description ?? "");
    const [content, setContent] = useState(prompt?.content ?? "");
    const [categoryId, setCategoryId] = useState<string>(prompt?.category_id?.toString() ?? "none");
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(prompt?.tags.map((t) => t.id) ?? []);
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    const handleCreateTag = useCallback(
        async (name: string): Promise<Tag> => {
            const tag = await tagCreate({ name });
            await fetchTags();
            return tag;
        },
        [fetchTags],
    );

    const handleSave = useCallback(async () => {
        const newErrors: { title?: string; content?: string } = {};
        if (!title.trim()) newErrors.title = t("promptEditor.titleRequired");
        if (!content.trim()) newErrors.content = t("promptEditor.contentRequired");
        if (newErrors.title || newErrors.content) {
            setErrors(newErrors);
            return;
        }

        const catId = categoryId === "none" ? null : Number(categoryId);

        if (isEditing && prompt) {
            await promptUpdate({
                id: prompt.id,
                title,
                content,
                description,
                category_id: catId,
                tag_ids: selectedTagIds,
            });
            toast.success(t("promptEditor.updated"));
            navigate(`/vault/prompts/${prompt.id}`);
        } else {
            const result = await promptCreate({
                title,
                content,
                description: description || undefined,
                category_id: catId ?? undefined,
                tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            });
            toast.success(t("promptEditor.created"));
            navigate(`/vault/prompts/${result.id}`);
        }
    }, [title, content, description, categoryId, selectedTagIds, isEditing, prompt, navigate, t]);

    return (
        <div className="w-full p-6">
            <div className="mb-4">
                <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t("common.back")}
                </button>
            </div>

            <h1 className="mb-6 text-2xl font-bold">
                {isEditing ? t("promptEditor.editTitle") : t("promptEditor.newTitle")}
            </h1>

            <div className="flex flex-col gap-4">
                <div>
                    <Label htmlFor="title">{t("promptEditor.title")}</Label>
                    <Input
                        id="title"
                        className="w-full"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setErrors((prev) => ({ ...prev, title: undefined }));
                        }}
                        placeholder={t("promptEditor.titlePlaceholder")}
                    />
                    {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                </div>

                <div>
                    <Label htmlFor="description">{t("promptEditor.description")}</Label>
                    <Input
                        id="description"
                        className="w-full"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("promptEditor.descriptionPlaceholder")}
                    />
                </div>

                <div>
                    <Label>{t("promptEditor.category")}</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("promptEditor.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{t("promptEditor.none")}</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>{t("promptEditor.tags")}</Label>
                    <TagInput
                        className="w-full"
                        availableTags={tags}
                        selectedTagIds={selectedTagIds}
                        onChange={setSelectedTagIds}
                        onCreateTag={handleCreateTag}
                    />
                </div>

                <div>
                    <Label htmlFor="content">{t("promptEditor.content")}</Label>
                    <Textarea
                        id="content"
                        className="w-full min-h-[200px] font-mono"
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setErrors((prev) => ({ ...prev, content: undefined }));
                        }}
                        placeholder={t("promptEditor.contentPlaceholder")}
                    />
                    {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
                </div>

                <div className="flex gap-3">
                    <Button onClick={handleSave}>{t("common.save")}</Button>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        {t("common.cancel")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
