use regex::Regex;

pub fn detect(value: &str) -> String {
    let trimmed = value.trim();

    // SSH private key
    if trimmed.starts_with("-----BEGIN") && trimmed.contains("PRIVATE KEY") {
        return "ssh_key".to_string();
    }

    // AWS Access Key ID
    if Regex::new(r"^AKIA[0-9A-Z]{16}$")
        .unwrap()
        .is_match(trimmed)
    {
        return "api_key".to_string();
    }

    // JWT token (three base64url segments separated by dots)
    if Regex::new(r"^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$")
        .unwrap()
        .is_match(trimmed)
    {
        return "token".to_string();
    }

    // GitHub tokens
    if trimmed.starts_with("ghp_")
        || trimmed.starts_with("gho_")
        || trimmed.starts_with("ghs_")
        || trimmed.starts_with("github_pat_")
    {
        return "token".to_string();
    }

    // Stripe keys
    if trimmed.starts_with("sk_live_")
        || trimmed.starts_with("sk_test_")
        || trimmed.starts_with("pk_live_")
        || trimmed.starts_with("pk_test_")
    {
        return "api_key".to_string();
    }

    // Bearer token
    if trimmed.to_lowercase().starts_with("bearer ") {
        return "token".to_string();
    }

    // Environment variable format (KEY=value)
    if Regex::new(r"^[A-Z_][A-Z0-9_]*=.+$")
        .unwrap()
        .is_match(trimmed)
    {
        return "env_var".to_string();
    }

    // Hex string (32+ chars) — likely an API key or hash
    if Regex::new(r"^[0-9a-fA-F]{32,}$")
        .unwrap()
        .is_match(trimmed)
    {
        return "api_key".to_string();
    }

    // Base64-encoded string (40+ chars) — likely a key or token
    if Regex::new(r"^[A-Za-z0-9+/]{40,}={0,2}$")
        .unwrap()
        .is_match(trimmed)
    {
        return "api_key".to_string();
    }

    // Short string with special chars — likely a password
    if trimmed.len() < 128
        && Regex::new(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]")
            .unwrap()
            .is_match(trimmed)
        && !trimmed.contains(' ')
    {
        return "password".to_string();
    }

    "other".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_github_token() {
        assert_eq!(detect("ghp_1234567890abcdef1234567890abcdef12345"), "token");
    }

    #[test]
    fn test_detect_stripe_key() {
        assert_eq!(detect("sk_live_1234567890abcdef"), "api_key");
    }

    #[test]
    fn test_detect_env_var() {
        assert_eq!(detect("DATABASE_URL=postgres://localhost:5432/db"), "env_var");
    }

    #[test]
    fn test_detect_password() {
        assert_eq!(detect("MyP@ssw0rd!"), "password");
    }

    #[test]
    fn test_detect_ssh_key() {
        assert_eq!(detect("-----BEGIN RSA PRIVATE KEY-----\nMIIE..."), "ssh_key");
    }

    #[test]
    fn test_detect_unknown() {
        assert_eq!(detect("just some text"), "other");
    }
}
