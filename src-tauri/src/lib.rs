mod commands;
mod crypto;
mod db;
mod detection;
mod state;

use state::AppState;
use std::sync::Mutex;

#[tauri::command]
fn detect_credential_type(value: String) -> String {
    detection::credential_type::detect(&value)
}

pub fn run() {
    let app_state = AppState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
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
            detect_credential_type,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
