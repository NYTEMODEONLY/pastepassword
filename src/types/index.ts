export interface Credential {
  id: string;
  title: string;
  value: string;
  cred_type: CredentialType;
  notes: string;
  created_at: string;
  updated_at: string;
  accessed_at: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  tags: Tag[];
}

export interface CredentialSummary {
  id: string;
  title: string;
  cred_type: CredentialType;
  notes: string;
  created_at: string;
  updated_at: string;
  accessed_at: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CredentialFilter {
  cred_type?: string;
  tag_id?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  sort_by?: string;
}

export interface CredentialUpdate {
  title?: string;
  value?: string;
  cred_type?: string;
  notes?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  tag_ids?: string[];
}

export type CredentialType =
  | "password"
  | "api_key"
  | "token"
  | "ssh_key"
  | "env_var"
  | "other"
  | "unknown";

export type AppView = "setup" | "unlock" | "main";

export const CRED_TYPE_LABELS: Record<CredentialType, string> = {
  password: "Password",
  api_key: "API Key",
  token: "Token",
  ssh_key: "SSH Key",
  env_var: "Env Var",
  other: "Other",
  unknown: "Unknown",
};

export const CRED_TYPE_COLORS: Record<CredentialType, string> = {
  password: "#ef4444",
  api_key: "#6366f1",
  token: "#f59e0b",
  ssh_key: "#22c55e",
  env_var: "#06b6d4",
  other: "#a1a1aa",
  unknown: "#71717a",
};
