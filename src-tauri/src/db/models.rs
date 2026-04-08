use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Credential {
    pub id: String,
    pub title: String,
    pub value: String,
    pub cred_type: String,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
    pub accessed_at: Option<String>,
    pub is_favorite: bool,
    pub is_archived: bool,
    pub tags: Vec<Tag>,
}

/// Summary without the secret value — used in list views.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CredentialSummary {
    pub id: String,
    pub title: String,
    pub cred_type: String,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
    pub accessed_at: Option<String>,
    pub is_favorite: bool,
    pub is_archived: bool,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Deserialize)]
pub struct CredentialFilter {
    pub cred_type: Option<String>,
    pub tag_id: Option<String>,
    pub is_favorite: Option<bool>,
    pub is_archived: Option<bool>,
    pub sort_by: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CredentialUpdate {
    pub title: Option<String>,
    pub value: Option<String>,
    pub cred_type: Option<String>,
    pub notes: Option<String>,
    pub is_favorite: Option<bool>,
    pub is_archived: Option<bool>,
    pub tag_ids: Option<Vec<String>>,
}
