use crate::crypto::kdf;
use crate::db;
use rusqlite::Connection;
use std::fs;
use std::path::{Path, PathBuf};

fn vault_dir() -> PathBuf {
    let base = dirs_next().unwrap_or_else(|| PathBuf::from("."));
    base.join("PastePassword")
}

fn dirs_next() -> Option<PathBuf> {
    #[cfg(target_os = "macos")]
    {
        dirs::data_dir()
    }
    #[cfg(target_os = "windows")]
    {
        dirs::data_local_dir()
    }
    #[cfg(target_os = "linux")]
    {
        dirs::data_dir()
    }
}

fn db_path() -> PathBuf {
    vault_dir().join("vault.db")
}

fn salt_path() -> PathBuf {
    vault_dir().join("vault.salt")
}

/// Check if a vault has been set up (salt file exists).
pub fn is_setup() -> bool {
    salt_path().exists()
}

/// Create a new vault with the given master password.
pub fn setup(password: &str) -> Result<Connection, String> {
    let dir = vault_dir();
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create vault dir: {}", e))?;

    // Generate and save salt
    let salt = kdf::generate_salt()?;
    fs::write(salt_path(), &salt).map_err(|e| format!("Failed to write salt: {}", e))?;

    // Derive key
    let key = kdf::derive_key(password.as_bytes(), &salt)?;

    // Open encrypted database
    let conn = open_encrypted_db(&db_path(), &key)?;

    // Run migrations
    db::migrations::run(&conn)?;

    Ok(conn)
}

/// Unlock an existing vault with the given master password.
pub fn unlock(password: &str) -> Result<Connection, String> {
    let salt = fs::read(salt_path()).map_err(|e| format!("Failed to read salt: {}", e))?;
    let key = kdf::derive_key(password.as_bytes(), &salt)?;
    let conn = open_encrypted_db(&db_path(), &key)?;

    // Verify the key is correct by running a test query
    conn.execute_batch("SELECT count(*) FROM sqlite_master;")
        .map_err(|_| "Wrong master password".to_string())?;

    Ok(conn)
}

/// Get the vault directory path as a string.
pub fn get_vault_path() -> String {
    vault_dir().to_string_lossy().to_string()
}

fn open_encrypted_db(path: &Path, key: &[u8]) -> Result<Connection, String> {
    let conn =
        Connection::open(path).map_err(|e| format!("Failed to open database: {}", e))?;

    // Set the encryption key using hex format
    let hex_key: String = key.iter().map(|b| format!("{:02x}", b)).collect();
    conn.pragma_update(None, "key", &format!("x'{}'", hex_key))
        .map_err(|e| format!("Failed to set encryption key: {}", e))?;

    // Verify we can read the database
    conn.pragma_query_value(None, "cipher_version", |row| row.get::<_, String>(0))
        .map_err(|_| "Failed to initialize SQLCipher".to_string())?;

    Ok(conn)
}
