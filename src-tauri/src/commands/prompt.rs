// src-tauri/src/commands/prompt.rs
use crate::db::connection::DbState;
use crate::db::models::{
    Paginated, PromptCreate, PromptDetail, PromptListParams, PromptSummary, PromptUpdate, Tag,
};
use crate::error::AppError;
use tauri::State;

const DEFAULT_PAGE_SIZE: i64 = 50;

#[tauri::command]
pub async fn prompt_list(
    params: PromptListParams,
    db_state: State<'_, DbState>,
) -> Result<Paginated<PromptSummary>, AppError> {
    let pool = db_state.get_pool()?;
    let page = params.page.unwrap_or(1).max(1);
    let page_size = params.page_size.unwrap_or(DEFAULT_PAGE_SIZE);
    let offset = (page - 1) * page_size;

    // Build WHERE clause
    let mut conditions: Vec<String> = vec![];
    let mut bind_values: Vec<String> = vec![];

    if let Some(cat_id) = params.category_id {
        conditions.push("p.category_id = ?".to_string());
        bind_values.push(cat_id.to_string());
    }

    if let Some(ref tag_ids) = params.tag_ids {
        if !tag_ids.is_empty() {
            let placeholders: Vec<String> = tag_ids.iter().map(|_| "?".to_string()).collect();
            conditions.push(format!(
                "p.id IN (SELECT pt.prompt_id FROM prompt_tags pt WHERE pt.tag_id IN ({}))",
                placeholders.join(", ")
            ));
            for tid in tag_ids {
                bind_values.push(tid.to_string());
            }
        }
    }

    if let Some(ref search) = params.search {
        if !search.trim().is_empty() {
            conditions.push(
                "(p.title LIKE ? OR p.description LIKE ? OR p.content LIKE ?)".to_string(),
            );
            let pattern = format!("%{}%", search.trim());
            bind_values.push(pattern.clone());
            bind_values.push(pattern.clone());
            bind_values.push(pattern);
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sort = match params.sort.as_deref() {
        Some("created") => "p.created_at DESC",
        Some("title") => "p.title ASC",
        Some("usage") => "p.usage_count DESC",
        _ => "p.updated_at DESC",
    };

    let count_sql = format!("SELECT COUNT(*) FROM prompts p {where_clause}");
    let count_query = sqlx::query_scalar::<_, i64>(&count_sql);
    let mut count_query = count_query;
    for val in &bind_values {
        count_query = count_query.bind(val);
    }
    let total = count_query.fetch_one(&pool).await?;

    let items: Vec<PromptSummary> =
        fetch_prompt_summaries(&pool, &where_clause, sort, &bind_values, offset, page_size)
            .await?;

    Ok(Paginated {
        items,
        total,
        page,
        page_size,
    })
}

async fn fetch_prompt_summaries(
    pool: &sqlx::SqlitePool,
    where_clause: &str,
    sort: &str,
    bind_values: &[String],
    offset: i64,
    page_size: i64,
) -> Result<Vec<PromptSummary>, AppError> {
    let sql = format!(
        r#"
        SELECT p.id, p.title, p.description, p.category_id,
               c.name AS category_name, c.color AS category_color,
               p.favorite, p.updated_at
        FROM prompts p
        LEFT JOIN categories c ON p.category_id = c.id
        {where_clause}
        ORDER BY {sort}
        LIMIT ? OFFSET ?
        "#
    );

    // Use a temporary struct for the raw row
    #[derive(sqlx::FromRow)]
    struct RawRow {
        id: i64,
        title: String,
        description: String,
        category_id: Option<i64>,
        category_name: Option<String>,
        category_color: Option<String>,
        favorite: i64,
        updated_at: String,
    }

    let mut query = sqlx::query_as::<_, RawRow>(&sql);
    for val in bind_values {
        query = query.bind(val);
    }
    query = query.bind(page_size).bind(offset);

    let rows = query.fetch_all(pool).await?;

    let mut items = Vec::new();
    for row in rows {
        // Fetch tags for this prompt
        let tags: Vec<Tag> = sqlx::query_as::<_, Tag>(
            r#"SELECT t.id, t.name, t.created_at FROM tags t
               INNER JOIN prompt_tags pt ON t.id = pt.tag_id
               WHERE pt.prompt_id = ?"#,
        )
        .bind(row.id)
        .fetch_all(pool)
        .await?;

        items.push(PromptSummary {
            id: row.id,
            title: row.title,
            description: row.description,
            category_id: row.category_id,
            category_name: row.category_name,
            category_color: row.category_color,
            favorite: row.favorite != 0,
            tag_names: tags.iter().map(|t| t.name.clone()).collect(),
            updated_at: row.updated_at,
        });
    }

    Ok(items)
}

#[tauri::command]
pub async fn prompt_get(
    id: i64,
    db_state: State<'_, DbState>,
) -> Result<PromptDetail, AppError> {
    let pool = db_state.get_pool()?;

    let prompt = sqlx::query_as::<_, crate::db::models::Prompt>("SELECT * FROM prompts WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Prompt {id} not found")))?;

    let category_name: Option<String> = if let Some(cat_id) = prompt.category_id {
        sqlx::query_scalar("SELECT name FROM categories WHERE id = ?")
            .bind(cat_id)
            .fetch_optional(&pool)
            .await?
    } else {
        None
    };

    let category_color: Option<String> = if let Some(cat_id) = prompt.category_id {
        sqlx::query_scalar("SELECT color FROM categories WHERE id = ?")
            .bind(cat_id)
            .fetch_optional(&pool)
            .await?
    } else {
        None
    };

    let tags: Vec<Tag> = sqlx::query_as::<_, Tag>(
        r#"SELECT t.id, t.name, t.created_at FROM tags t
           INNER JOIN prompt_tags pt ON t.id = pt.tag_id
           WHERE pt.prompt_id = ?"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(PromptDetail {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        description: prompt.description,
        category_id: prompt.category_id,
        category_name,
        category_color,
        favorite: prompt.favorite != 0,
        usage_count: prompt.usage_count,
        tags,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at,
    })
}

#[tauri::command]
pub async fn prompt_create(
    params: PromptCreate,
    db_state: State<'_, DbState>,
) -> Result<PromptDetail, AppError> {
    if params.title.trim().is_empty() {
        return Err(AppError::Validation("Title is required".to_string()));
    }
    if params.content.trim().is_empty() {
        return Err(AppError::Validation("Content is required".to_string()));
    }
    let pool = db_state.get_pool()?;
    let description = params.description.unwrap_or_default();

    let result =
        sqlx::query("INSERT INTO prompts (title, content, description, category_id) VALUES (?, ?, ?, ?)")
            .bind(&params.title)
            .bind(&params.content)
            .bind(&description)
            .bind(params.category_id)
            .execute(&pool)
            .await?;

    let id = result.last_insert_rowid();

    if let Some(ref tag_ids) = params.tag_ids {
        for tag_id in tag_ids {
            sqlx::query("INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)")
                .bind(id)
                .bind(tag_id)
                .execute(&pool)
                .await?;
        }
    }

    prompt_get(id, db_state).await
}

#[tauri::command]
pub async fn prompt_update(
    params: PromptUpdate,
    db_state: State<'_, DbState>,
) -> Result<PromptDetail, AppError> {
    let pool = db_state.get_pool()?;
    let existing = sqlx::query_as::<_, crate::db::models::Prompt>("SELECT * FROM prompts WHERE id = ?")
        .bind(params.id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Prompt {} not found", params.id)))?;

    let title = params.title.unwrap_or(existing.title);
    let content = params.content.unwrap_or(existing.content);
    let description = params.description.unwrap_or(existing.description);
    let category_id = params.category_id.or(existing.category_id);

    if title.trim().is_empty() {
        return Err(AppError::Validation("Title is required".to_string()));
    }
    if content.trim().is_empty() {
        return Err(AppError::Validation("Content is required".to_string()));
    }

    sqlx::query(
        r#"UPDATE prompts SET title = ?, content = ?, description = ?,
           category_id = ?, updated_at = datetime('now') WHERE id = ?"#,
    )
    .bind(&title)
    .bind(&content)
    .bind(&description)
    .bind(category_id)
    .bind(params.id)
    .execute(&pool)
    .await?;

    // Replace tag associations if tag_ids is provided
    if let Some(ref tag_ids) = params.tag_ids {
        sqlx::query("DELETE FROM prompt_tags WHERE prompt_id = ?")
            .bind(params.id)
            .execute(&pool)
            .await?;
        for tag_id in tag_ids {
            sqlx::query("INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)")
                .bind(params.id)
                .bind(tag_id)
                .execute(&pool)
                .await?;
        }
    }

    prompt_get(params.id, db_state).await
}

#[tauri::command]
pub async fn prompt_delete(id: i64, db_state: State<'_, DbState>) -> Result<(), AppError> {
    let pool = db_state.get_pool()?;
    let result = sqlx::query("DELETE FROM prompts WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Prompt {id} not found")));
    }
    Ok(())
}

#[tauri::command]
pub async fn prompt_copy(
    id: i64,
    db_state: State<'_, DbState>,
    app: tauri::AppHandle,
) -> Result<(), AppError> {
    let pool = db_state.get_pool()?;
    let content: String = sqlx::query_scalar("SELECT content FROM prompts WHERE id = ?")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| AppError::NotFound(format!("Prompt {id} not found")))?;

    // Increment usage count
    sqlx::query("UPDATE prompts SET usage_count = usage_count + 1, updated_at = updated_at WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    // Write to clipboard
    use tauri_plugin_clipboard_manager::ClipboardExt;
    app.clipboard()
        .write_text(&content)
        .map_err(|e| AppError::Config(format!("Clipboard error: {e}")))?;

    Ok(())
}

#[tauri::command]
pub async fn prompt_toggle_favorite(
    id: i64,
    db_state: State<'_, DbState>,
) -> Result<PromptDetail, AppError> {
    let pool = db_state.get_pool()?;
    sqlx::query(
        "UPDATE prompts SET favorite = CASE WHEN favorite = 0 THEN 1 ELSE 0 END, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(id)
    .execute(&pool)
    .await?;

    prompt_get(id, db_state).await
}
