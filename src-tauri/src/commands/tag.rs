// src-tauri/src/commands/tag.rs
use crate::db::connection::DbState;
use crate::db::models::{Tag, TagCreate, TagUpdate};
use crate::error::AppError;
use tauri::State;

#[tauri::command]
pub async fn tag_list(db_state: State<'_, DbState>) -> Result<Vec<Tag>, AppError> {
    let pool = db_state.get_pool()?;
    let tags = sqlx::query_as::<_, Tag>("SELECT * FROM tags ORDER BY name ASC")
        .fetch_all(&pool)
        .await?;
    Ok(tags)
}

#[tauri::command]
pub async fn tag_create(
    params: TagCreate,
    db_state: State<'_, DbState>,
) -> Result<Tag, AppError> {
    if params.name.trim().is_empty() {
        return Err(AppError::Validation("Tag name cannot be empty".to_string()));
    }
    let pool = db_state.get_pool()?;
    let result = sqlx::query("INSERT INTO tags (name) VALUES (?)")
        .bind(&params.name)
        .execute(&pool)
        .await?;
    let id = result.last_insert_rowid();
    let tag = sqlx::query_as::<_, Tag>("SELECT * FROM tags WHERE id = ?")
        .bind(id)
        .fetch_one(&pool)
        .await?;
    Ok(tag)
}

#[tauri::command]
pub async fn tag_update(
    params: TagUpdate,
    db_state: State<'_, DbState>,
) -> Result<Tag, AppError> {
    if params.name.trim().is_empty() {
        return Err(AppError::Validation("Tag name cannot be empty".to_string()));
    }
    let pool = db_state.get_pool()?;
    let result = sqlx::query("UPDATE tags SET name = ? WHERE id = ?")
        .bind(&params.name)
        .bind(params.id)
        .execute(&pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Tag {} not found", params.id)));
    }
    let tag = sqlx::query_as::<_, Tag>("SELECT * FROM tags WHERE id = ?")
        .bind(params.id)
        .fetch_one(&pool)
        .await?;
    Ok(tag)
}

#[tauri::command]
pub async fn tag_delete(
    id: i64,
    db_state: State<'_, DbState>,
) -> Result<(), AppError> {
    let pool = db_state.get_pool()?;
    let result = sqlx::query("DELETE FROM tags WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Tag {id} not found")));
    }
    Ok(())
}
