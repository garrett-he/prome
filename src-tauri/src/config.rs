// src-tauri/src/config.rs
use crate::error::AppError;
use crate::db::models::VaultInfo;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct AppConfig {
    pub recent_vaults: Vec<VaultInfo>,
}

impl AppConfig {
    pub fn config_path() -> Result<PathBuf, AppError> {
        let dir = dirs::config_dir()
            .ok_or_else(|| AppError::Config("Cannot determine config directory".to_string()))?;
        let prome_dir = dir.join("prome");
        fs::create_dir_all(&prome_dir)?;
        Ok(prome_dir.join("config.json"))
    }

    pub fn load() -> Result<Self, AppError> {
        let path = Self::config_path()?;
        if !path.exists() {
            return Ok(Self::default());
        }
        let data = fs::read_to_string(&path)?;
        let config: Self = serde_json::from_str(&data)?;
        Ok(config)
    }

    pub fn save(&self) -> Result<(), AppError> {
        let path = Self::config_path()?;
        let data = serde_json::to_string_pretty(self)?;
        fs::write(path, data)?;
        Ok(())
    }

    pub fn upsert_recent_vault(&mut self, info: VaultInfo) {
        self.recent_vaults.retain(|v| v.path != info.path);
        self.recent_vaults.insert(0, info);
        if self.recent_vaults.len() > 10 {
            self.recent_vaults.truncate(10);
        }
    }

    pub fn remove_recent_vault(&mut self, path: &str) {
        self.recent_vaults.retain(|v| v.path != path);
    }
}
