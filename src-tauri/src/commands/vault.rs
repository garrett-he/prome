// src-tauri/src/commands/vault.rs
use crate::config::AppConfig;
use crate::db::connection::{self, DbState};
use crate::db::migrations;
use crate::db::models::VaultInfo;
use crate::error::AppError;
use std::path::Path;
use std::sync::Mutex;
use tauri::State;

fn vault_name_from_path(path: &str) -> String {
    Path::new(path)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("Untitled")
        .to_string()
}

fn db_path_from_dir(dir_path: &str) -> String {
    Path::new(dir_path).join("prome.db").to_string_lossy().to_string()
}

async fn count_prompts(pool: &sqlx::SqlitePool) -> i64 {
    sqlx::query_scalar("SELECT COUNT(*) FROM prompts")
        .fetch_one(pool)
        .await
        .unwrap_or(0)
}

#[tauri::command]
pub async fn vault_create(
    path: String,
    db_state: State<'_, DbState>,
    config_state: State<'_, Mutex<AppConfig>>,
) -> Result<VaultInfo, AppError> {
    let db_path = db_path_from_dir(&path);
    let pool = connection::create_pool(&db_path).await?;
    migrations::run_migrations(&pool).await?;
    migrations::seed_default_categories(&pool).await?;

    db_state.set_pool(pool.clone());

    let name = vault_name_from_path(&path);
    let now = chrono::Utc::now().to_rfc3339();
    let prompt_count = count_prompts(&pool).await;
    let info = VaultInfo {
        name: name.clone(),
        path: path.clone(),
        last_opened: now.clone(),
        prompt_count,
    };

    let mut config = config_state.lock().map_err(|e| {
        AppError::Config(format!("Lock poisoned: {e}"))
    })?;
    // Reload from disk first
    *config = AppConfig::load().unwrap_or_default();
    config.upsert_recent_vault(info.clone());
    config.save()?;

    Ok(info)
}

#[tauri::command]
pub async fn vault_open(
    path: String,
    db_state: State<'_, DbState>,
    config_state: State<'_, Mutex<AppConfig>>,
) -> Result<VaultInfo, AppError> {
    if !Path::new(&path).exists() {
        return Err(AppError::NotFound(format!("Vault directory not found: {path}")));
    }
    let db_path = db_path_from_dir(&path);
    if !Path::new(&db_path).exists() {
        return Err(AppError::NotFound(format!("prome.db not found in vault directory: {path}")));
    }
    let pool = connection::create_pool(&db_path).await?;
    migrations::run_migrations(&pool).await?;

    db_state.set_pool(pool.clone());

    let name = vault_name_from_path(&path);
    let now = chrono::Utc::now().to_rfc3339();
    let prompt_count = count_prompts(&pool).await;
    let info = VaultInfo {
        name: name.clone(),
        path: path.clone(),
        last_opened: now.clone(),
        prompt_count,
    };

    let mut config = config_state.lock().map_err(|e| {
        AppError::Config(format!("Lock poisoned: {e}"))
    })?;
    *config = AppConfig::load().unwrap_or_default();
    config.upsert_recent_vault(info.clone());
    config.save()?;

    Ok(info)
}

#[tauri::command]
pub async fn vault_close(db_state: State<'_, DbState>) -> Result<(), AppError> {
    db_state.clear_pool();
    Ok(())
}

#[tauri::command]
pub async fn vault_get_current(
    db_state: State<'_, DbState>,
) -> Result<Option<VaultInfo>, AppError> {
    // We only check if pool exists; full VaultInfo comes from config
    let pool = db_state.get_pool();
    match pool {
        Ok(_) => Ok(None), // Frontend tracks current vault from open/create result
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub async fn vault_list_recent(
    config_state: State<'_, Mutex<AppConfig>>,
) -> Result<Vec<VaultInfo>, AppError> {
    let _config = config_state.lock().map_err(|e| {
        AppError::Config(format!("Lock poisoned: {e}"))
    })?;
    let loaded = AppConfig::load().unwrap_or_default();
    Ok(loaded.recent_vaults)
}

#[tauri::command]
pub async fn vault_remove_recent(
    path: String,
    config_state: State<'_, Mutex<AppConfig>>,
) -> Result<(), AppError> {
    let mut config = config_state.lock().map_err(|e| {
        AppError::Config(format!("Lock poisoned: {e}"))
    })?;
    *config = AppConfig::load().unwrap_or_default();
    config.remove_recent_vault(&path);
    config.save()?;
    Ok(())
}
