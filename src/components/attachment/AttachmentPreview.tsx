import { Download, File as FileIcon } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { attachmentGet, attachmentSaveTo } from "@/lib/invoke";
import type { PromptAttachment } from "@/types";

function isPreviewable(mimeType: string | null): boolean {
    return (
        !!mimeType && (mimeType.startsWith("image/") || mimeType.startsWith("audio/") || mimeType.startsWith("video/"))
    );
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentPreviewProps {
    attachment: PromptAttachment;
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
    const { t } = useTranslation();
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isPreviewable(attachment.mime_type)) return;
        let cancelled = false;
        attachmentGet(attachment.id)
            .then((detail) => {
                if (cancelled) return;
                const mime = detail.mime_type ?? "application/octet-stream";
                setDataUrl(`data:${mime};base64,${detail.data_base64}`);
            })
            .catch(() => {
                if (!cancelled) setDataUrl(null);
            });
        return () => {
            cancelled = true;
        };
    }, [attachment.id, attachment.mime_type]);

    const handleDownload = useCallback(async () => {
        try {
            await attachmentSaveTo(attachment.id);
            toast.success(t("promptDetailAttachments.saved"));
        } catch {
            toast.error(t("promptDetailAttachments.saveFailed"));
        }
    }, [attachment.id, t]);

    let preview: ReactNode = null;
    if (dataUrl) {
        if (attachment.mime_type?.startsWith("image/")) {
            preview = <img src={dataUrl} alt={attachment.filename} className="max-h-64 rounded-md object-contain" />;
        } else if (attachment.mime_type?.startsWith("audio/")) {
            // biome-ignore lint/a11y/useMediaCaption: user media has no captions
            preview = <audio controls crossOrigin="anonymous" src={dataUrl} className="w-full" />;
        } else if (attachment.mime_type?.startsWith("video/")) {
            // biome-ignore lint/a11y/useMediaCaption: user media has no captions
            preview = <video controls src={dataUrl} className="max-h-64 rounded-md" />;
        }
    }

    return (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm" title={attachment.filename}>
                    {attachment.filename}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatSize(attachment.size)}</span>
                {!isPreviewable(attachment.mime_type) && (
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-1 h-4 w-4" />
                        {t("promptDetailAttachments.download")}
                    </Button>
                )}
            </div>

            {preview && <div className="mt-1">{preview}</div>}
        </div>
    );
}
