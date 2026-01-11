// src-tauri/src/commands/config.rs
use crate::config::AppConfig;
use crate::error::AppError;
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub async fn config_get(config_state: State<'_, Mutex<AppConfig>>) -> Result<AppConfig, AppError> {
    let _config = config_state
        .lock()
        .map_err(|e| AppError::Config(format!("Lock poisoned: {e}")))?;
    Ok(AppConfig::load().unwrap_or_default())
}

#[tauri::command]
pub async fn config_set_language(
    language: String,
    config_state: State<'_, Mutex<AppConfig>>,
) -> Result<AppConfig, AppError> {
    if language != "en" && language != "zh" {
        return Err(AppError::Validation(format!("Unsupported language: {language}")));
    }
    let mut config = config_state
        .lock()
        .map_err(|e| AppError::Config(format!("Lock poisoned: {e}")))?;
    *config = AppConfig::load().unwrap_or_default();
    config.language = language;
    config.save()?;
    Ok(config.clone())
}
