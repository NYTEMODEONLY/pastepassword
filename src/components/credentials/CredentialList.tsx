import { useState, useEffect, useCallback } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";
import { timeAgo } from "../../lib/utils";
import { Star, Plus, Search, Key } from "lucide-react";
import { colors, FONT, inputStyle, btnSecondary } from "../../lib/styles";

export function CredentialList({ onQuickAdd }: { onQuickAdd: () => void }) {
  const { credentials, selectedId, selectCredential, searchQuery, setSearchQuery } = useCredentialStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const handleKeyNav = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const i = credentials.findIndex((c) => c.id === selectedId);
    if (e.key === "j" || e.key === "ArrowDown") { e.preventDefault(); const n = i === -1 ? 0 : Math.min(i + 1, credentials.length - 1); if (credentials[n]) selectCredential(credentials[n].id); }
    else if (e.key === "k" || e.key === "ArrowUp") { e.preventDefault(); if (i > 0) selectCredential(credentials[i - 1].id); }
  }, [credentials, selectedId, selectCredential]);

  useEffect(() => { window.addEventListener("keydown", handleKeyNav); return () => window.removeEventListener("keydown", handleKeyNav); }, [handleKeyNav]);

  return (
    <div style={{
      width: 280, flexShrink: 0, height: "100%",
      display: "flex", flexDirection: "column",
      background: colors.bg,
      borderRight: `1px solid ${colors.border}`,
    }}>
      {/* Search */}
      <div style={{ padding: 10 }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: colors.textMuted }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            placeholder="Search..."
            style={{ ...inputStyle(searchFocused), height: 32, fontSize: 12, paddingLeft: 32, paddingRight: 40 }} />
          <kbd style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 9, fontWeight: 600, color: colors.textMuted,
            background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "2px 6px",
          }}>⌘K</kbd>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 6px 6px" }}>
        {credentials.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: colors.bgElevated,
              boxShadow: `0 0 0 1px ${colors.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>
              <Key style={{ width: 20, height: 20, color: colors.textMuted }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary }}>No credentials yet</p>
            <p style={{ fontSize: 11, color: colors.textFaint, marginTop: 4 }}>Add your first secret to get started</p>
            <button onClick={onQuickAdd} style={{ ...btnSecondary, marginTop: 14, height: 28, fontSize: 11 }}>
              <Plus style={{ width: 12, height: 12 }} /> Quick Add
            </button>
          </div>
        ) : (
          credentials.map((cred) => (
            <button key={cred.id} onClick={() => selectCredential(cred.id)}
              style={{
                width: "100%", display: "flex", flexDirection: "column", gap: 4,
                padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                textAlign: "left", fontFamily: FONT, marginBottom: 1,
                background: selectedId === cred.id ? colors.bgActive : "transparent",
                transition: "background 0.08s",
              }}
              onMouseEnter={(e) => { if (selectedId !== cred.id) e.currentTarget.style.background = colors.bgHover; }}
              onMouseLeave={(e) => { if (selectedId !== cred.id) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {cred.is_favorite && <Star style={{ width: 11, height: 11, fill: colors.warning, color: colors.warning, flexShrink: 0 }} />}
                <span style={{
                  fontSize: 12, fontWeight: selectedId === cred.id ? 600 : 500,
                  color: selectedId === cred.id ? colors.text : colors.textSecondary,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{cred.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3,
                  background: CRED_TYPE_COLORS[cred.cred_type] + "14",
                  color: CRED_TYPE_COLORS[cred.cred_type],
                }}>{CRED_TYPE_LABELS[cred.cred_type]}</span>
                <span style={{ fontSize: 10, color: colors.textMuted }}>{timeAgo(cred.created_at)}</span>
                {cred.tags.length > 0 && (
                  <span style={{ fontSize: 10, color: colors.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    · {cred.tags.map((t) => t.name).join(", ")}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {credentials.length > 0 && (
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: 10, color: colors.textMuted }}>{credentials.length} credential{credentials.length !== 1 ? "s" : ""}</p>
        </div>
      )}
    </div>
  );
}

