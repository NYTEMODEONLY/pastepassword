mod commands;
mod crypto;
mod db;
mod detection;
mod state;

use state::AppState;
use std::sync::Mutex;
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager,
};

#[tauri::command]
fn detect_credential_type(value: String) -> String {
    detection::credential_type::detect(&value)
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn touch_activity(state: tauri::State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.touch();
    Ok(())
}

#[tauri::command]
fn set_auto_lock_seconds(
    seconds: u64,
    state: tauri::State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.auto_lock_seconds = seconds;
    Ok(())
}

pub fn run() {
    let app_state = AppState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(app_state))
        .invoke_handler(tauri::generate_handler![
            commands::auth::is_vault_setup,
            commands::auth::setup_vault,
            commands::auth::unlock_vault,
            commands::auth::lock_vault,
            commands::credentials::add_credential,
            commands::credentials::get_credentials,
            commands::credentials::get_credential,
            commands::credentials::update_credential,
            commands::credentials::delete_credential,
            commands::credentials::search_credentials,
            commands::tags::get_tags,
            commands::tags::create_tag,
            commands::tags::delete_tag,
            commands::import_export::export_vault,
            commands::import_export::import_vault,
            detect_credential_type,
            open_url,
            touch_activity,
            set_auto_lock_seconds,
        ])
        .setup(|app| {
            setup_tray(app)?;
            setup_auto_lock(app.handle().clone());
            Ok(())
        })
        .on_window_event(|window, event| {
            // Hide to tray on close instead of quitting
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let quick_add = MenuItemBuilder::with_id("quick_add", "Quick Add...")
        .accelerator("CmdOrCtrl+Shift+V")
        .build(app)?;
    let search = MenuItemBuilder::with_id("search", "Search...")
        .accelerator("CmdOrCtrl+Shift+F")
        .build(app)?;
    let separator1 = PredefinedMenuItem::separator(app)?;
    let show = MenuItemBuilder::with_id("show", "Show Window").build(app)?;
    let lock = MenuItemBuilder::with_id("lock", "Lock Vault").build(app)?;
    let separator2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Quit PastePassword")
        .accelerator("CmdOrCtrl+Q")
        .build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[
            &quick_add,
            &search,
            &separator1,
            &show,
            &lock,
            &separator2,
            &quit,
        ])
        .build()?;

    let icon = Image::from_bytes(include_bytes!("../icons/32x32.png"))
        .expect("Failed to load tray icon");

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .tooltip("PastePassword")
        .on_menu_event(move |app, event| {
            let id = event.id().as_ref();
            match id {
                "quick_add" => {
                    show_window(app);
                    let _ = app.emit("tray-quick-add", ());
                }
                "search" => {
                    show_window(app);
                    let _ = app.emit("tray-search", ());
                }
                "show" => {
                    show_window(app);
                }
                "lock" => {
                    let _ = app.emit("tray-lock", ());
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click { .. } = event {
                show_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

fn show_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn setup_auto_lock(handle: tauri::AppHandle) {
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(std::time::Duration::from_secs(10));

            let state = handle.state::<Mutex<AppState>>();
            let should_lock = {
                let app_state = match state.lock() {
                    Ok(s) => s,
                    Err(_) => continue,
                };
                app_state.should_auto_lock()
            };

            if should_lock {
                // Lock the vault
                {
                    let mut app_state = match state.lock() {
                        Ok(s) => s,
                        Err(_) => continue,
                    };
                    app_state.lock();
                }
                // Notify frontend
                let _ = handle.emit("vault-locked", ());
            }
        }
    });
}
