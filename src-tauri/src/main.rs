// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;
mod db;
mod error;

use commands::{attachment, category, config as config_commands, prompt, tag, vault};
use db::connection::DbState;
use std::sync::Mutex;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(DbState::new())
        .manage(Mutex::new(config::AppConfig::load().unwrap_or_default()))
        .invoke_handler(tauri::generate_handler![
            // Config
            config_commands::config_get,
            config_commands::config_set_language,
            // Vault
            vault::vault_create,
            vault::vault_open,
            vault::vault_close,
            vault::vault_get_current,
            vault::vault_list_recent,
            vault::vault_remove_recent,
            // Category
            category::category_list,
            category::category_create,
            category::category_update,
            category::category_delete,
            // Tag
            tag::tag_list,
            tag::tag_create,
            tag::tag_update,
            tag::tag_delete,
            // Prompt
            prompt::prompt_list,
            prompt::prompt_get,
            prompt::prompt_create,
            prompt::prompt_update,
            prompt::prompt_delete,
            prompt::prompt_copy,
            prompt::prompt_toggle_favorite,
            // Attachment
            attachment::attachment_add,
            attachment::attachment_list,
            attachment::attachment_get,
            attachment::attachment_delete,
            attachment::attachment_save_to,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| match event {
            #[cfg(target_os = "macos")]
            tauri::RunEvent::ExitRequested { code, api, .. } => {
                if code.is_none() {
                    api.prevent_exit();
                }
            }
            #[cfg(target_os = "macos")]
            tauri::RunEvent::WindowEvent {
                label,
                event: tauri::WindowEvent::CloseRequested { api, .. },
                ..
            } => {
                api.prevent_close();
                if let Some(window) = app_handle.get_webview_window(&label) {
                    let _ = window.hide();
                }
            }
            #[cfg(target_os = "macos")]
            tauri::RunEvent::Reopen { .. } => {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        });
}
