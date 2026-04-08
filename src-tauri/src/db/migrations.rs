use rusqlite::Connection;

pub fn run(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS vault_meta (
            id          INTEGER PRIMARY KEY CHECK (id = 1),
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            version     INTEGER NOT NULL DEFAULT 1
        );

        INSERT OR IGNORE INTO vault_meta (id, version) VALUES (1, 1);

        CREATE TABLE IF NOT EXISTS credentials (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL DEFAULT '',
            value       TEXT NOT NULL,
            cred_type   TEXT NOT NULL DEFAULT 'unknown',
            notes       TEXT DEFAULT '',
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
            accessed_at TEXT,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            is_archived INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS tags (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL UNIQUE,
            color       TEXT DEFAULT '#6366f1',
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS credential_tags (
            credential_id TEXT NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
            tag_id        TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (credential_id, tag_id)
        );

        CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(cred_type);
        CREATE INDEX IF NOT EXISTS idx_credentials_created ON credentials(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_credentials_archived ON credentials(is_archived);
        CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
        ",
    )
    .map_err(|e| format!("Migration failed: {}", e))?;

    // FTS5 virtual table — separate because CREATE VIRTUAL TABLE doesn't support IF NOT EXISTS cleanly
    let has_fts: bool = conn
        .query_row(
            "SELECT count(*) > 0 FROM sqlite_master WHERE type='table' AND name='credentials_fts'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if !has_fts {
        conn.execute_batch(
            "
            CREATE VIRTUAL TABLE credentials_fts USING fts5(
                title, notes, cred_type,
                content='credentials',
                content_rowid='rowid'
            );

            CREATE TRIGGER credentials_ai AFTER INSERT ON credentials BEGIN
                INSERT INTO credentials_fts(rowid, title, notes, cred_type)
                VALUES (new.rowid, new.title, new.notes, new.cred_type);
            END;

            CREATE TRIGGER credentials_ad AFTER DELETE ON credentials BEGIN
                INSERT INTO credentials_fts(credentials_fts, rowid, title, notes, cred_type)
                VALUES ('delete', old.rowid, old.title, old.notes, old.cred_type);
            END;

            CREATE TRIGGER credentials_au AFTER UPDATE ON credentials BEGIN
                INSERT INTO credentials_fts(credentials_fts, rowid, title, notes, cred_type)
                VALUES ('delete', old.rowid, old.title, old.notes, old.cred_type);
                INSERT INTO credentials_fts(rowid, title, notes, cred_type)
                VALUES (new.rowid, new.title, new.notes, new.cred_type);
            END;
            ",
        )
        .map_err(|e| format!("FTS migration failed: {}", e))?;
    }

    Ok(())
}
