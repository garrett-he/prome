// src-tauri/src/db/connection.rs
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::sync::Mutex;

pub struct DbState {
    pub pool: Mutex<Option<SqlitePool>>,
}

impl DbState {
    pub fn new() -> Self {
        Self { pool: Mutex::new(None) }
    }

    pub fn get_pool(&self) -> Result<SqlitePool, crate::error::AppError> {
        let guard = self
            .pool
            .lock()
            .map_err(|e| crate::error::AppError::Config(format!("Lock poisoned: {e}")))?;
        guard.clone().ok_or(crate::error::AppError::NoVaultOpen)
    }

    pub fn set_pool(&self, new_pool: SqlitePool) {
        if let Ok(mut guard) = self.pool.lock() {
            *guard = Some(new_pool);
        }
    }

    pub fn clear_pool(&self) {
        if let Ok(mut guard) = self.pool.lock() {
            *guard = None;
        }
    }
}

pub async fn create_pool(path: &str) -> Result<SqlitePool, crate::error::AppError> {
    let options = SqliteConnectOptions::new().filename(path).create_if_missing(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;
    Ok(pool)
}
