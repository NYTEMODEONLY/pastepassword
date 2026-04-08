import { useState } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { updateCredential } from "../../lib/tauri";
import { X } from "lucide-react";
import { CRED_TYPE_LABELS, type CredentialType, type Credential } from "../../types";
import { colors, inputStyle, textareaStyle, selectStyle, labelStyle, btnPrimary, btnSecondary, modalOverlay, modalCard } from "../../lib/styles";

const TYPES: CredentialType[] = ["password", "api_key", "token", "ssh_key", "env_var", "other"];

export function EditCredentialModal({ credential, onClose }: { credential: Credential; onClose: () => void }) {
  const { loadCredentials, selectCredential, tags, createTag } = useCredentialStore();
  const [title, setTitle] = useState(credential.title);
  const [value, setValue] = useState(credential.value);
  const [credType, setCredType] = useState<CredentialType>(credential.cred_type);
  const [notes, setNotes] = useState(credential.notes);
  const [selTags, setSelTags] = useState<string[]>(credential.tags.map((t) => t.id));
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    try {
      await updateCredential(credential.id, { title, value: value.trim(), cred_type: credType, notes, tag_ids: selTags });
      await loadCredentials(); await selectCredential(credential.id); onClose();
    } catch { setSaving(false); }
  }

  async function handleNewTag() {
    if (!newTag.trim()) return;
    try { const t = await createTag(newTag.trim()); setSelTags((p) => [...p, t.id]); setNewTag(""); } catch {}
  }

  return (
    <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modalCard, width: "100%", maxWidth: 460, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text, letterSpacing: "-0.3px" }}>Edit Credential</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textFaint, padding: 4, display: "flex" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocused("title")} onBlur={() => setFocused(null)}
              autoFocus style={inputStyle(focused === "title")} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Secret</label>
            <textarea value={value} onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused("value")} onBlur={() => setFocused(null)}
              rows={3} style={textareaStyle(focused === "value")} />
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Type</label>
              <select value={credType} onChange={(e) => setCredType(e.target.value as CredentialType)}
                onFocus={() => setFocused("type")} onBlur={() => setFocused(null)}
                style={selectStyle(focused === "type")}>
                {TYPES.map((t) => <option key={t} value={t}>{CRED_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                onFocus={() => setFocused("notes")} onBlur={() => setFocused(null)}
                placeholder="What is this for?" style={inputStyle(focused === "notes")} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              {tags.map((tag) => (
                <button key={tag.id} type="button"
                  onClick={() => setSelTags((p) => p.includes(tag.id) ? p.filter((i) => i !== tag.id) : [...p, tag.id])}
                  style={{
                    padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 500,
                    cursor: "pointer", border: "none", fontFamily: "inherit",
                    background: selTags.includes(tag.id) ? tag.color + "20" : "rgba(255,255,255,0.04)",
                    color: selTags.includes(tag.id) ? tag.color : colors.textTertiary,
                    boxShadow: selTags.includes(tag.id) ? `0 0 0 1px ${tag.color}30` : `0 0 0 1px ${colors.border}`,
                    transition: "all 0.1s",
                  }}>
                  {tag.name}
                </button>
              ))}
              <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNewTag(); } }}
                onFocus={() => setFocused("newTag")} onBlur={() => setFocused(null)}
                placeholder="+ new tag"
                style={{ ...inputStyle(focused === "newTag"), width: 90, height: 26, fontSize: 11, padding: "0 8px" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
            <button type="submit" disabled={!value.trim() || saving}
              style={{ ...btnPrimary, opacity: !value.trim() || saving ? 0.4 : 1, cursor: !value.trim() || saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
