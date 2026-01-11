import { ArrowLeft, File as FileIcon, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
import { attachmentAdd, attachmentDelete, promptCreate, promptUpdate, tagCreate } from "@/lib/invoke";
import { useAppStore } from "@/stores/app";
import type { PromptAttachment, PromptDetail as PromptDetailType, Tag } from "@/types";

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
    const [existingAttachments, setExistingAttachments] = useState<PromptAttachment[]>(prompt?.attachments ?? []);
    const [pendingFiles, setPendingFiles] = useState<{ id: string; file: File }[]>([]);
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSelectFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        setPendingFiles((prev) => [...prev, ...Array.from(files).map((file) => ({ id: crypto.randomUUID(), file }))]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleRemovePending = useCallback((id: string) => {
        setPendingFiles((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const handleRemoveExisting = useCallback((attachment: PromptAttachment) => {
        setExistingAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
        setRemovedAttachmentIds((prev) => [...prev, attachment.id]);
    }, []);

    const readFileBytes = useCallback((file: File): Promise<number[]> => {
        return file.arrayBuffer().then((buffer) => Array.from(new Uint8Array(buffer)));
    }, []);

    const uploadNewAttachments = useCallback(
        async (promptId: number, files: { id: string; file: File }[]) => {
            for (const { file } of files) {
                const data = await readFileBytes(file);
                await attachmentAdd({
                    prompt_id: promptId,
                    filename: file.name,
                    mime_type: file.type || null,
                    data,
                });
            }
        },
        [readFileBytes],
    );

    const deleteRemovedAttachments = useCallback(async () => {
        for (const id of removedAttachmentIds) {
            await attachmentDelete(id);
        }
    }, [removedAttachmentIds]);

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
            setUploading(true);
            try {
                await deleteRemovedAttachments();
                await promptUpdate({
                    id: prompt.id,
                    title,
                    content,
                    description,
                    category_id: catId,
                    tag_ids: selectedTagIds,
                });
                await uploadNewAttachments(prompt.id, pendingFiles);
            } finally {
                setUploading(false);
            }
            toast.success(t("promptEditor.updated"));
            navigate(`/vault/prompts/${prompt.id}`);
        } else {
            setUploading(true);
            let resultId: number;
            try {
                const result = await promptCreate({
                    title,
                    content,
                    description: description || undefined,
                    category_id: catId ?? undefined,
                    tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
                });
                resultId = result.id;
                await uploadNewAttachments(resultId, pendingFiles);
            } finally {
                setUploading(false);
            }
            toast.success(t("promptEditor.created"));
            navigate(`/vault/prompts/${resultId}`);
        }
    }, [
        title,
        content,
        description,
        categoryId,
        selectedTagIds,
        isEditing,
        prompt,
        navigate,
        t,
        pendingFiles,
        deleteRemovedAttachments,
        uploadNewAttachments,
    ]);

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
                    <Label>{t("promptEditor.attachments")}</Label>
                    <div className="flex flex-col gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleSelectFiles(e.target.files)}
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-1 h-4 w-4" />
                            {t("promptEditor.addAttachments")}
                        </Button>

                        {existingAttachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="min-w-0 flex-1 truncate text-sm">{attachment.filename}</span>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveExisting(attachment)}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {pendingFiles.map(({ id, file }) => (
                            <div key={id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemovePending(id)}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
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
                    <Button onClick={handleSave} disabled={uploading}>
                        {uploading ? t("promptEditor.uploading") : t("common.save")}
                    </Button>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        {t("common.cancel")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
