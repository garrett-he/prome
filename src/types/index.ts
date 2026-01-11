export interface Category {
    id: number;
    name: string;
    color: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CategoryCreate {
    name: string;
    color?: string | null;
}

export interface CategoryUpdate {
    id: number;
    name?: string;
    color?: string | null;
    sort_order?: number;
}

export interface Tag {
    id: number;
    name: string;
    created_at: string;
}

export interface TagCreate {
    name: string;
}

export interface TagUpdate {
    id: number;
    name: string;
}

export interface PromptSummary {
    id: number;
    title: string;
    description: string;
    category_id: number | null;
    category_name: string | null;
    category_color: string | null;
    favorite: boolean;
    tag_names: string[];
    updated_at: string;
}

export interface PromptDetail {
    id: number;
    title: string;
    content: string;
    description: string;
    category_id: number | null;
    category_name: string | null;
    category_color: string | null;
    favorite: boolean;
    usage_count: number;
    tags: Tag[];
    created_at: string;
    updated_at: string;
}

export interface PromptCreate {
    title: string;
    content: string;
    description?: string;
    category_id?: number | null;
    tag_ids?: number[];
}

export interface PromptUpdate {
    id: number;
    title?: string;
    content?: string;
    description?: string;
    category_id?: number | null;
    tag_ids?: number[];
}

export interface PromptListParams {
    category_id?: number | null;
    tag_ids?: number[];
    search?: string;
    sort?: "updated" | "created" | "title" | "usage";
    page?: number;
    page_size?: number;
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}

export interface VaultInfo {
    name: string;
    path: string;
    last_opened: string;
    prompt_count: number;
}

export interface AppError {
    kind: string;
    message: string;
}
