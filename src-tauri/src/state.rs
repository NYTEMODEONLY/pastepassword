use rusqlite::Connection;
use zeroize::Zeroize;

pub struct AppState {
    pub db: Option<Connection>,
    pub vault_path: Option<String>,
    derived_key: Option<Vec<u8>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: None,
            vault_path: None,
            derived_key: None,
        }
    }

    pub fn is_unlocked(&self) -> bool {
        self.db.is_some()
    }

    pub fn set_key(&mut self, key: Vec<u8>) {
        self.derived_key = Some(key);
    }

    pub fn lock(&mut self) {
        self.db = None;
        if let Some(ref mut key) = self.derived_key {
            key.zeroize();
        }
        self.derived_key = None;
    }
}

impl Drop for AppState {
    fn drop(&mut self) {
        self.lock();
    }
}
