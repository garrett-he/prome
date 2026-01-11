// src-tauri/src/commands/category.rs
use crate::db::connection::DbState;
use crate::db::models::{Category, CategoryCreate, CategoryUpdate};
use crate::error::AppError;
use tauri::State;

#[tauri::command]
pub async fn category_list(db_state: State<'_, DbState>) -> Result<Vec<Category>, AppError> {
    let pool = db_state.get_pool()?;
    let categories = sqlx::query_as::<_, Category>("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
        .fetch_all(&pool)
        .await?;
    Ok(categories)
}

#[tauri::command]
pub async fn category_create(params: CategoryCreate, db_state: State<'_, DbState>) -> Result<Category, AppError> {
    if params.name.trim().is_empty() {
        return Err(AppError::Validation("Category name cannot be empty".to_string()));
    }
    let pool = db_state.get_pool()?;
    let result = sqlx::query("INSERT INTO categories (name, color) VALUES (?, ?)")
        .bind(&params.name)
        .bind(&params.color)
        .execute(&pool)
        .await?;
    let id = result.last_insert_rowid();
    let category = sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ?")
        .bind(id)
        .fetch_one(&pool)
        .await?;
    Ok(category)
}

#[tauri::command]
pub async fn category_update(params: CategoryUpdate, db_state: State<'_, DbState>) -> Result<Category, AppError> {
    let pool = db_state.get_pool()?;
    let existing = sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ?")
        .bind(params.id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Category {} not found", params.id)))?;

    let name = params.name.unwrap_or(existing.name);
    let color = params.color.or(existing.color);
    let sort_order = params.sort_order.unwrap_or(existing.sort_order);

    sqlx::query("UPDATE categories SET name = ?, color = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(&name)
        .bind(&color)
        .bind(sort_order)
        .bind(params.id)
        .execute(&pool)
        .await?;

    let category = sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ?")
        .bind(params.id)
        .fetch_one(&pool)
        .await?;
    Ok(category)
}

#[tauri::command]
pub async fn category_delete(id: i64, db_state: State<'_, DbState>) -> Result<(), AppError> {
    let pool = db_state.get_pool()?;
    let result = sqlx::query("DELETE FROM categories WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Category {id} not found")));
    }
    Ok(())
}
