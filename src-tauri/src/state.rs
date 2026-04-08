use rusqlite::Connection;
use std::time::Instant;
use zeroize::Zeroize;

pub struct AppState {
    pub db: Option<Connection>,
    pub vault_path: Option<String>,
    pub last_activity: Instant,
    pub auto_lock_seconds: u64,
    derived_key: Option<Vec<u8>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: None,
            vault_path: None,
            last_activity: Instant::now(),
            auto_lock_seconds: 300, // 5 minutes default
            derived_key: None,
        }
    }

    pub fn is_unlocked(&self) -> bool {
        self.db.is_some()
    }

    pub fn touch(&mut self) {
        self.last_activity = Instant::now();
    }

    pub fn should_auto_lock(&self) -> bool {
        if self.auto_lock_seconds == 0 || !self.is_unlocked() {
            return false;
        }
        self.last_activity.elapsed().as_secs() >= self.auto_lock_seconds
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
