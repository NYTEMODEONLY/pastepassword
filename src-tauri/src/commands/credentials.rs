use crate::db::models::*;
use crate::detection::credential_type;
use crate::state::AppState;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn add_credential(
    title: String,
    value: String,
    cred_type: Option<String>,
    notes: String,
    tag_ids: Vec<String>,
    state: State<'_, Mutex<AppState>>,
) -> Result<CredentialSummary, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    let id = Uuid::new_v4().to_string();
    let detected_type = cred_type.unwrap_or_else(|| credential_type::detect(&value));
    let auto_title = if title.is_empty() {
        format!("{} credential", capitalize(&detected_type))
    } else {
        title
    };

    conn.execute(
        "INSERT INTO credentials (id, title, value, cred_type, notes) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, auto_title, value, detected_type, notes],
    )
    .map_err(|e| format!("Failed to insert credential: {}", e))?;

    // Add tags
    for tag_id in &tag_ids {
        conn.execute(
            "INSERT OR IGNORE INTO credential_tags (credential_id, tag_id) VALUES (?1, ?2)",
            rusqlite::params![id, tag_id],
        )
        .map_err(|e| format!("Failed to add tag: {}", e))?;
    }

    // Fetch tags for response
    let tags = get_tags_for_credential(conn, &id)?;

    let created_at: String = conn
        .query_row(
            "SELECT created_at FROM credentials WHERE id = ?1",
            [&id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(CredentialSummary {
        id,
        title: auto_title.clone(),
        cred_type: detected_type,
        notes,
        created_at: created_at.clone(),
        updated_at: created_at,
        accessed_at: None,
        is_favorite: false,
        is_archived: false,
        tags,
    })
}

#[tauri::command]
pub fn get_credentials(
    filter: Option<CredentialFilter>,
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<CredentialSummary>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    let mut sql = String::from(
        "SELECT DISTINCT c.id, c.title, c.cred_type, c.notes, c.created_at, c.updated_at, c.accessed_at, c.is_favorite, c.is_archived FROM credentials c",
    );
    let mut conditions: Vec<String> = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref f) = filter {
        if let Some(ref tag_id) = f.tag_id {
            sql.push_str(" JOIN credential_tags ct ON c.id = ct.credential_id");
            conditions.push(format!("ct.tag_id = ?{}", params.len() + 1));
            params.push(Box::new(tag_id.clone()));
        }
        if let Some(ref cred_type) = f.cred_type {
            conditions.push(format!("c.cred_type = ?{}", params.len() + 1));
            params.push(Box::new(cred_type.clone()));
        }
        if let Some(is_fav) = f.is_favorite {
            conditions.push(format!("c.is_favorite = ?{}", params.len() + 1));
            params.push(Box::new(is_fav as i32));
        }
        let archived = f.is_archived.unwrap_or(false);
        conditions.push(format!("c.is_archived = ?{}", params.len() + 1));
        params.push(Box::new(archived as i32));
    } else {
        conditions.push("c.is_archived = 0".to_string());
    }

    if !conditions.is_empty() {
        sql.push_str(" WHERE ");
        sql.push_str(&conditions.join(" AND "));
    }

    let sort = filter
        .as_ref()
        .and_then(|f| f.sort_by.as_deref())
        .unwrap_or("created_at");
    match sort {
        "title" => sql.push_str(" ORDER BY c.title ASC"),
        "accessed_at" => sql.push_str(" ORDER BY c.accessed_at DESC NULLS LAST"),
        "type" => sql.push_str(" ORDER BY c.cred_type ASC, c.created_at DESC"),
        _ => sql.push_str(" ORDER BY c.created_at DESC"),
    }

    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(param_refs.as_slice(), |row| {
            Ok(CredentialSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                cred_type: row.get(2)?,
                notes: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                accessed_at: row.get(6)?,
                is_favorite: row.get::<_, i32>(7)? != 0,
                is_archived: row.get::<_, i32>(8)? != 0,
                tags: Vec::new(),
            })
        })
        .map_err(|e| e.to_string())?;

    let mut credentials: Vec<CredentialSummary> = Vec::new();
    for row in rows {
        let mut cred = row.map_err(|e| e.to_string())?;
        cred.tags = get_tags_for_credential(conn, &cred.id)?;
        credentials.push(cred);
    }

    Ok(credentials)
}

#[tauri::command]
pub fn get_credential(
    id: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<Credential, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    // Update accessed_at
    conn.execute(
        "UPDATE credentials SET accessed_at = datetime('now') WHERE id = ?1",
        [&id],
    )
    .map_err(|e| e.to_string())?;

    let cred = conn
        .query_row(
            "SELECT id, title, value, cred_type, notes, created_at, updated_at, accessed_at, is_favorite, is_archived FROM credentials WHERE id = ?1",
            [&id],
            |row| {
                Ok(Credential {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    value: row.get(2)?,
                    cred_type: row.get(3)?,
                    notes: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                    accessed_at: row.get(7)?,
                    is_favorite: row.get::<_, i32>(8)? != 0,
                    is_archived: row.get::<_, i32>(9)? != 0,
                    tags: Vec::new(),
                })
            },
        )
        .map_err(|e| format!("Credential not found: {}", e))?;

    let mut cred = cred;
    cred.tags = get_tags_for_credential(conn, &cred.id)?;
    Ok(cred)
}

#[tauri::command]
pub fn update_credential(
    id: String,
    updates: CredentialUpdate,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    let mut sets: Vec<String> = vec!["updated_at = datetime('now')".to_string()];
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref title) = updates.title {
        params.push(Box::new(title.clone()));
        sets.push(format!("title = ?{}", params.len()));
    }
    if let Some(ref value) = updates.value {
        params.push(Box::new(value.clone()));
        sets.push(format!("value = ?{}", params.len()));
    }
    if let Some(ref cred_type) = updates.cred_type {
        params.push(Box::new(cred_type.clone()));
        sets.push(format!("cred_type = ?{}", params.len()));
    }
    if let Some(ref notes) = updates.notes {
        params.push(Box::new(notes.clone()));
        sets.push(format!("notes = ?{}", params.len()));
    }
    if let Some(is_fav) = updates.is_favorite {
        params.push(Box::new(is_fav as i32));
        sets.push(format!("is_favorite = ?{}", params.len()));
    }
    if let Some(is_arch) = updates.is_archived {
        params.push(Box::new(is_arch as i32));
        sets.push(format!("is_archived = ?{}", params.len()));
    }

    params.push(Box::new(id.clone()));
    let sql = format!(
        "UPDATE credentials SET {} WHERE id = ?{}",
        sets.join(", "),
        params.len()
    );

    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    conn.execute(&sql, param_refs.as_slice())
        .map_err(|e| e.to_string())?;

    // Update tags if provided
    if let Some(ref tag_ids) = updates.tag_ids {
        conn.execute(
            "DELETE FROM credential_tags WHERE credential_id = ?1",
            [&id],
        )
        .map_err(|e| e.to_string())?;

        for tag_id in tag_ids {
            conn.execute(
                "INSERT OR IGNORE INTO credential_tags (credential_id, tag_id) VALUES (?1, ?2)",
                rusqlite::params![id, tag_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn delete_credential(
    id: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    conn.execute("DELETE FROM credentials WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn search_credentials(
    query: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<CredentialSummary>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let conn = app_state.db.as_ref().ok_or("Vault is locked")?;

    if query.trim().is_empty() {
        return get_credentials_inner(conn, None);
    }

    // FTS5 search with prefix matching
    let fts_query = format!("{}*", query.trim());
    let mut stmt = conn
        .prepare(
            "SELECT c.id, c.title, c.cred_type, c.notes, c.created_at, c.updated_at, c.accessed_at, c.is_favorite, c.is_archived
             FROM credentials c
             JOIN credentials_fts fts ON c.rowid = fts.rowid
             WHERE credentials_fts MATCH ?1
             AND c.is_archived = 0
             ORDER BY rank",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([&fts_query], |row| {
            Ok(CredentialSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                cred_type: row.get(2)?,
                notes: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                accessed_at: row.get(6)?,
                is_favorite: row.get::<_, i32>(7)? != 0,
                is_archived: row.get::<_, i32>(8)? != 0,
                tags: Vec::new(),
            })
        })
        .map_err(|e| e.to_string())?;

    let mut credentials: Vec<CredentialSummary> = Vec::new();
    for row in rows {
        let mut cred = row.map_err(|e| e.to_string())?;
        cred.tags = get_tags_for_credential(conn, &cred.id)?;
        credentials.push(cred);
    }

    Ok(credentials)
}

fn get_credentials_inner(
    conn: &rusqlite::Connection,
    _filter: Option<CredentialFilter>,
) -> Result<Vec<CredentialSummary>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, cred_type, notes, created_at, updated_at, accessed_at, is_favorite, is_archived FROM credentials WHERE is_archived = 0 ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(CredentialSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                cred_type: row.get(2)?,
                notes: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                accessed_at: row.get(6)?,
                is_favorite: row.get::<_, i32>(7)? != 0,
                is_archived: row.get::<_, i32>(8)? != 0,
                tags: Vec::new(),
            })
        })
        .map_err(|e| e.to_string())?;

    let mut credentials: Vec<CredentialSummary> = Vec::new();
    for row in rows {
        let mut cred = row.map_err(|e| e.to_string())?;
        cred.tags = get_tags_for_credential(conn, &cred.id)?;
        credentials.push(cred);
    }

    Ok(credentials)
}

fn get_tags_for_credential(
    conn: &rusqlite::Connection,
    credential_id: &str,
) -> Result<Vec<Tag>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.name, t.color FROM tags t JOIN credential_tags ct ON t.id = ct.tag_id WHERE ct.credential_id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([credential_id], |row| {
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

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(c) => c.to_uppercase().to_string() + chars.as_str(),
    }
}
