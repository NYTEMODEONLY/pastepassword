use crate::state::AppState;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Serialize, Deserialize)]
struct ExportData {
    version: u32,
    exported_at: String,
    credentials: Vec<ExportCredential>,
    tags: Vec<ExportTag>,
}

#[derive(Serialize, Deserialize)]
struct ExportCredential {
    title: String,
    value: String,
    cred_type: String,
    notes: String,
    created_at: String,
    is_favorite: bool,
    tags: Vec<String>, // tag names
}

#[derive(Serialize, Deserialize)]
struct ExportTag {
    name: String,
    color: String,
}

#[tauri::command]
pub fn export_vault(
    path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<u32, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    // Get all tags
    let mut tag_stmt = conn
        .prepare("SELECT id, name, color FROM tags")
        .map_err(|e| e.to_string())?;
    let tags: Vec<ExportTag> = tag_stmt
        .query_map([], |row| {
            Ok(ExportTag {
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Get all credentials with their tag names
    let mut cred_stmt = conn
        .prepare("SELECT id, title, value, cred_type, notes, created_at, is_favorite FROM credentials")
        .map_err(|e| e.to_string())?;

    let creds: Vec<ExportCredential> = cred_stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            Ok((id, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?, row.get(5)?, row.get::<_, i32>(6)?))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|(id, title, value, cred_type, notes, created_at, is_fav)| {
            let mut tag_names_stmt = conn
                .prepare("SELECT t.name FROM tags t JOIN credential_tags ct ON t.id = ct.tag_id WHERE ct.credential_id = ?1")
                .unwrap();
            let tag_names: Vec<String> = tag_names_stmt
                .query_map([&id], |row| row.get(0))
                .unwrap()
                .collect::<Result<Vec<_>, _>>()
                .unwrap_or_default();

            ExportCredential {
                title,
                value,
                cred_type,
                notes,
                created_at,
                is_favorite: is_fav != 0,
                tags: tag_names,
            }
        })
        .collect();

    let count = creds.len() as u32;

    let export = ExportData {
        version: 1,
        exported_at: chrono::Utc::now().to_rfc3339(),
        credentials: creds,
        tags,
    };

    let json = serde_json::to_string_pretty(&export).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| format!("Failed to write export: {}", e))?;

    Ok(count)
}

#[tauri::command]
pub fn import_vault(
    path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<u32, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    let json = std::fs::read_to_string(&path).map_err(|e| format!("Failed to read: {}", e))?;
    let data: ExportData = serde_json::from_str(&json).map_err(|e| format!("Invalid format: {}", e))?;

    let mut imported = 0u32;

    // Import tags first
    for tag in &data.tags {
        let id = uuid::Uuid::new_v4().to_string();
        let _ = conn.execute(
            "INSERT OR IGNORE INTO tags (id, name, color) VALUES (?1, ?2, ?3)",
            rusqlite::params![id, tag.name, tag.color],
        );
    }

    // Import credentials
    for cred in &data.credentials {
        let id = uuid::Uuid::new_v4().to_string();
        let result = conn.execute(
            "INSERT INTO credentials (id, title, value, cred_type, notes, created_at, is_favorite) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![id, cred.title, cred.value, cred.cred_type, cred.notes, cred.created_at, cred.is_favorite as i32],
        );

        if result.is_ok() {
            imported += 1;
            // Link tags by name
            for tag_name in &cred.tags {
                let tag_id: Option<String> = conn
                    .query_row(
                        "SELECT id FROM tags WHERE name = ?1",
                        [tag_name],
                        |row| row.get(0),
                    )
                    .ok();
                if let Some(tid) = tag_id {
                    let _ = conn.execute(
                        "INSERT OR IGNORE INTO credential_tags (credential_id, tag_id) VALUES (?1, ?2)",
                        rusqlite::params![id, tid],
                    );
                }
            }
        }
    }

    Ok(imported)
}
