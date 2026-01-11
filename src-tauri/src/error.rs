// src-tauri/src/error.rs
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("No vault is currently open")]
    NoVaultOpen,
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Config error: {0}")]
    Config(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        #[derive(Serialize)]
        struct SerializedError {
            kind: String,
            message: String,
        }
        SerializedError {
            kind: match self {
                AppError::NoVaultOpen => "no_vault_open".to_string(),
                AppError::Database(_) => "database".to_string(),
                AppError::Io(_) => "io".to_string(),
                AppError::Serde(_) => "serde".to_string(),
                AppError::NotFound(_) => "not_found".to_string(),
                AppError::Validation(_) => "validation".to_string(),
                AppError::Config(_) => "config".to_string(),
            },
            message: self.to_string(),
        }
        .serialize(serializer)
    }
}
