use crate::crypto::vault;
use crate::state::AppState;
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub fn is_vault_setup() -> bool {
    vault::is_setup()
}

#[tauri::command]
pub fn setup_vault(
    password: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    if vault::is_setup() {
        return Err("Vault already exists".to_string());
    }

    let conn = vault::setup(&password)?;
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.vault_path = Some(vault::get_vault_path());
    app_state.db = Some(conn);
    Ok(())
}

#[tauri::command]
pub fn unlock_vault(
    password: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<bool, String> {
    match vault::unlock(&password) {
        Ok(conn) => {
            let mut app_state = state.lock().map_err(|e| e.to_string())?;
            app_state.vault_path = Some(vault::get_vault_path());
            app_state.db = Some(conn);
            Ok(true)
        }
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub fn lock_vault(state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.lock();
    Ok(())
}
