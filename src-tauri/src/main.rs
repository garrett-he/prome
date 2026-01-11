// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;
mod db;
mod error;

use commands::{category, prompt, tag, vault};
use db::connection::DbState;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager,
};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(DbState::new())
        .manage(Mutex::new(config::AppConfig::default()))
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "exit", "Exit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let exiting = Arc::new(AtomicBool::new(false));
            let exiting_for_menu = exiting.clone();

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "exit" => {
                        exiting_for_menu.store(true, Ordering::SeqCst);
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click { .. } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let visible = window.is_visible().unwrap_or(false);
                            if visible {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            let app_handle = app.app_handle().clone();
            let exiting_for_close = exiting.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    if exiting_for_close.load(Ordering::SeqCst) {
                        return;
                    }
                    api.prevent_close();
                    if let Some(w) = app_handle.get_webview_window("main") {
                        w.hide().unwrap();
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
