// src-tauri/src/db/models.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub color: Option<String>,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryCreate {
    pub name: String,
    pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryUpdate {
    pub id: i64,
    pub name: Option<String>,
    pub color: Option<String>,
    pub sort_order: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Tag {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagCreate {
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagUpdate {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Prompt {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub description: String,
    pub category_id: Option<i64>,
    pub favorite: i64,
    pub usage_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptCreate {
    pub title: String,
    pub content: String,
    pub description: Option<String>,
    pub category_id: Option<i64>,
    pub tag_ids: Option<Vec<i64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptUpdate {
    pub id: i64,
    pub title: Option<String>,
    pub content: Option<String>,
    pub description: Option<String>,
    pub category_id: Option<i64>,
    pub tag_ids: Option<Vec<i64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptListParams {
    pub category_id: Option<i64>,
    pub tag_ids: Option<Vec<i64>>,
    pub search: Option<String>,
    pub sort: Option<String>,
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptSummary {
    pub id: i64,
    pub title: String,
    pub description: String,
    pub category_id: Option<i64>,
    pub category_name: Option<String>,
    pub category_color: Option<String>,
    pub favorite: bool,
    pub tag_names: Vec<String>,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptDetail {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub description: String,
    pub category_id: Option<i64>,
    pub category_name: Option<String>,
    pub category_color: Option<String>,
    pub favorite: bool,
    pub usage_count: i64,
    pub tags: Vec<Tag>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Paginated<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultInfo {
    pub name: String,
    pub path: String,
    pub last_opened: String,
    pub prompt_count: i64,
}
