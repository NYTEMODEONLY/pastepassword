use argon2::{Argon2, Algorithm, Version, Params};

/// Derive a 32-byte key from a master password and salt using Argon2id.
/// Uses OWASP-recommended parameters: m=65536 (64MB), t=3, p=4.
pub fn derive_key(password: &[u8], salt: &[u8]) -> Result<Vec<u8>, String> {
    let params = Params::new(65536, 3, 4, Some(32))
        .map_err(|e| format!("Argon2 params error: {}", e))?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);

    let mut output = vec![0u8; 32];
    argon2
        .hash_password_into(password, salt, &mut output)
        .map_err(|e| format!("Argon2 hash error: {}", e))?;

    Ok(output)
}

/// Generate a random 16-byte salt.
pub fn generate_salt() -> Result<Vec<u8>, String> {
    let mut salt = vec![0u8; 16];
    getrandom::getrandom(&mut salt).map_err(|e| format!("RNG error: {}", e))?;
    Ok(salt)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_key_deterministic() {
        let salt = vec![1u8; 16];
        let key1 = derive_key(b"password", &salt).unwrap();
        let key2 = derive_key(b"password", &salt).unwrap();
        assert_eq!(key1, key2);
        assert_eq!(key1.len(), 32);
    }

    #[test]
    fn test_different_passwords_different_keys() {
        let salt = vec![1u8; 16];
        let key1 = derive_key(b"password1", &salt).unwrap();
        let key2 = derive_key(b"password2", &salt).unwrap();
        assert_ne!(key1, key2);
    }
}
