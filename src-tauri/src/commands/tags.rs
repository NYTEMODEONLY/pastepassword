use crate::db::models::Tag;
use crate::state::AppState;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_tags(state: State<'_, Mutex<AppState>>) -> Result<Vec<Tag>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    let mut stmt = conn
        .prepare("SELECT id, name, color FROM tags ORDER BY name ASC")
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tags)
}

#[tauri::command]
pub fn create_tag(
    name: String,
    color: Option<String>,
    state: State<'_, Mutex<AppState>>,
) -> Result<Tag, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    let id = Uuid::new_v4().to_string();
    let tag_color = color.unwrap_or_else(|| "#6366f1".to_string());

    conn.execute(
        "INSERT INTO tags (id, name, color) VALUES (?1, ?2, ?3)",
        rusqlite::params![id, name, tag_color],
    )
    .map_err(|e| format!("Failed to create tag: {}", e))?;

    Ok(Tag {
        id,
        name,
        color: tag_color,
    })
}

#[tauri::command]
pub fn delete_tag(id: String, state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    conn.execute("DELETE FROM credential_tags WHERE tag_id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
