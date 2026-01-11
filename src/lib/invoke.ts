import { invoke } from "@tauri-apps/api/core";
import type {
    AppConfig,
    AttachmentCreate,
    AttachmentDetail,
    Category,
    CategoryCreate,
    CategoryUpdate,
    Paginated,
    PromptAttachment,
    PromptCreate,
    PromptDetail,
    PromptListParams,
    PromptSummary,
    PromptUpdate,
    Tag,
    TagCreate,
    TagUpdate,
    VaultInfo,
} from "@/types";

// Config
export const configGet = (): Promise<AppConfig> => invoke("config_get");

export const configSetLanguage = (language: string): Promise<AppConfig> => invoke("config_set_language", { language });

// Vault
export const vaultCreate = (path: string): Promise<VaultInfo> => invoke("vault_create", { path });

export const vaultOpen = (path: string): Promise<VaultInfo> => invoke("vault_open", { path });

export const vaultClose = (): Promise<void> => invoke("vault_close");

export const vaultGetCurrent = (): Promise<VaultInfo | null> => invoke("vault_get_current");

export const vaultListRecent = (): Promise<VaultInfo[]> => invoke("vault_list_recent");

export const vaultRemoveRecent = (path: string): Promise<void> => invoke("vault_remove_recent", { path });

// Category
export const categoryList = (): Promise<Category[]> => invoke("category_list");

export const categoryCreate = (params: CategoryCreate): Promise<Category> => invoke("category_create", { params });

export const categoryUpdate = (params: CategoryUpdate): Promise<Category> => invoke("category_update", { params });

export const categoryDelete = (id: number): Promise<void> => invoke("category_delete", { id });

// Tag
export const tagList = (): Promise<Tag[]> => invoke("tag_list");

export const tagCreate = (params: TagCreate): Promise<Tag> => invoke("tag_create", { params });

export const tagUpdate = (params: TagUpdate): Promise<Tag> => invoke("tag_update", { params });

export const tagDelete = (id: number): Promise<void> => invoke("tag_delete", { id });

// Prompt
export const promptList = (params: PromptListParams): Promise<Paginated<PromptSummary>> =>
    invoke("prompt_list", { params });

export const promptGet = (id: number): Promise<PromptDetail> => invoke("prompt_get", { id });

export const promptCreate = (params: PromptCreate): Promise<PromptDetail> => invoke("prompt_create", { params });

export const promptUpdate = (params: PromptUpdate): Promise<PromptDetail> => invoke("prompt_update", { params });

export const promptDelete = (id: number): Promise<void> => invoke("prompt_delete", { id });

export const promptCopy = (id: number): Promise<void> => invoke("prompt_copy", { id });

export const promptToggleFavorite = (id: number): Promise<PromptDetail> => invoke("prompt_toggle_favorite", { id });

// Attachment
export const attachmentAdd = (params: AttachmentCreate): Promise<PromptAttachment> =>
    invoke("attachment_add", { params });

export const attachmentList = (promptId: number): Promise<PromptAttachment[]> =>
    invoke("attachment_list", { promptId });

export const attachmentGet = (id: number): Promise<AttachmentDetail> => invoke("attachment_get", { id });

export const attachmentDelete = (id: number): Promise<void> => invoke("attachment_delete", { id });

export const attachmentSaveTo = (id: number): Promise<void> => invoke("attachment_save_to", { id });
