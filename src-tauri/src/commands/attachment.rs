// src-tauri/src/commands/attachment.rs
use crate::db::connection::DbState;
use crate::db::models::{AttachmentCreate, AttachmentDetail, PromptAttachment};
use crate::error::AppError;
use base64::Engine;
use tauri::State;

async fn fetch_attachment(pool: &sqlx::SqlitePool, id: i64) -> Result<PromptAttachment, AppError> {
    let attachment = sqlx::query_as::<_, PromptAttachment>(
        r#"SELECT id, prompt_id, filename, mime_type, size, created_at
           FROM prompt_attachments WHERE id = ?"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Attachment {id} not found")))?;
    Ok(attachment)
}

#[tauri::command]
pub async fn attachment_add(
    params: AttachmentCreate,
    db_state: State<'_, DbState>,
) -> Result<PromptAttachment, AppError> {
    if params.filename.trim().is_empty() {
        return Err(AppError::Validation("Filename cannot be empty".to_string()));
    }
    let pool = db_state.get_pool()?;
    let size = params.data.len() as i64;
    let result = sqlx::query(
        "INSERT INTO prompt_attachments (prompt_id, filename, mime_type, size, data) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(params.prompt_id)
    .bind(&params.filename)
    .bind(&params.mime_type)
    .bind(size)
    .bind(params.data)
    .execute(&pool)
    .await?;
    fetch_attachment(&pool, result.last_insert_rowid()).await
}

#[tauri::command]
pub async fn attachment_list(prompt_id: i64, db_state: State<'_, DbState>) -> Result<Vec<PromptAttachment>, AppError> {
    let pool = db_state.get_pool()?;
    let rows = sqlx::query_as::<_, PromptAttachment>(
        r#"SELECT id, prompt_id, filename, mime_type, size, created_at
           FROM prompt_attachments WHERE prompt_id = ? ORDER BY created_at ASC, id ASC"#,
    )
    .bind(prompt_id)
    .fetch_all(&pool)
    .await?;
    Ok(rows)
}

#[tauri::command]
pub async fn attachment_get(id: i64, db_state: State<'_, DbState>) -> Result<AttachmentDetail, AppError> {
    let pool = db_state.get_pool()?;
    let row = sqlx::query_as::<_, AttachmentRow>(
        r#"SELECT id, prompt_id, filename, mime_type, size, created_at, data
           FROM prompt_attachments WHERE id = ?"#,
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Attachment {id} not found")))?;

    Ok(AttachmentDetail {
        id: row.id,
        prompt_id: row.prompt_id,
        filename: row.filename,
        mime_type: row.mime_type,
        size: row.size,
        created_at: row.created_at,
        data_base64: base64::engine::general_purpose::STANDARD.encode(&row.data),
    })
}

#[derive(sqlx::FromRow)]
struct AttachmentRow {
    id: i64,
    prompt_id: i64,
    filename: String,
    mime_type: Option<String>,
    size: i64,
    created_at: String,
    data: Vec<u8>,
}

#[tauri::command]
pub async fn attachment_delete(id: i64, db_state: State<'_, DbState>) -> Result<(), AppError> {
    let pool = db_state.get_pool()?;
    let result = sqlx::query("DELETE FROM prompt_attachments WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Attachment {id} not found")));
    }
    Ok(())
}

#[tauri::command]
pub async fn attachment_save_to(id: i64, db_state: State<'_, DbState>, app: tauri::AppHandle) -> Result<(), AppError> {
    let pool = db_state.get_pool()?;
    let row = sqlx::query_as::<_, AttachmentRow>(
        r#"SELECT id, prompt_id, filename, mime_type, size, created_at, data
           FROM prompt_attachments WHERE id = ?"#,
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Attachment {id} not found")))?;

    use tauri_plugin_dialog::DialogExt;
    let path = app.dialog().file().set_file_name(&row.filename).blocking_save_file();

    if let Some(path) = path {
        if let Ok(p) = path.into_path() {
            std::fs::write(&p, &row.data)?;
        }
    }
    Ok(())
}

pub async fn load_attachments(pool: &sqlx::SqlitePool, prompt_id: i64) -> Result<Vec<PromptAttachment>, AppError> {
    Ok(sqlx::query_as::<_, PromptAttachment>(
        r#"SELECT id, prompt_id, filename, mime_type, size, created_at
           FROM prompt_attachments WHERE prompt_id = ? ORDER BY created_at ASC, id ASC"#,
    )
    .bind(prompt_id)
    .fetch_all(pool)
    .await?)
}
