import { useState } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { updateCredential } from "../../lib/tauri";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";
import { timeAgo, maskValue } from "../../lib/utils";
import { Copy, Eye, EyeOff, Star, Trash2, Check, X, Pencil, Archive, ArchiveRestore, Calendar, Clock } from "lucide-react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { EditCredentialModal } from "./EditCredentialModal";
import { colors, FONT_MONO, btnPrimary, btnSecondary } from "../../lib/styles";

export function CredentialDetail() {
  const { selectedCredential, deleteCredential, toggleFavorite, selectCredential, loadCredentials } = useCredentialStore();
  const [showVal, setShowVal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!selectedCredential) return null;
  const c = selectedCredential;

  async function handleCopy() {
    try { await writeText(c.value); } catch { navigator.clipboard.writeText(c.value); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    setTimeout(async () => { try { await writeText(""); } catch {} }, 30000);
  }

  async function handleDel() {
    if (!confirmDel) { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); return; }
    await deleteCredential(c.id);
  }

  async function handleArchive() {
    await updateCredential(c.id, { is_archived: !c.is_archived });
    await loadCredentials(); await selectCredential(c.id);
  }

  const badge = (bg: string, fg: string, text: string) => (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: bg, color: fg }}>{text}</span>
  );

  const actionBtn = (icon: React.ReactNode, label: string, onClick: () => void, extra?: React.CSSProperties) => (
    <button onClick={onClick} style={{ ...btnSecondary, height: 28, padding: "0 10px", fontSize: 11, ...extra }}>
      {icon} {label}
    </button>
  );

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", animation: "slide-in 0.15s ease-out both" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: colors.text, letterSpacing: "-0.3px" }}>{c.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              {badge(CRED_TYPE_COLORS[c.cred_type] + "14", CRED_TYPE_COLORS[c.cred_type], CRED_TYPE_LABELS[c.cred_type])}
              {c.is_favorite && <Star style={{ width: 12, height: 12, fill: colors.warning, color: colors.warning }} />}
              {c.is_archived && badge("rgba(229,160,0,0.1)", "#e5a000", "Archived")}
            </div>
          </div>
          <button onClick={() => selectCredential(null)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textFaint, padding: 4, display: "flex" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Secret */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 500, color: colors.textFaint, marginBottom: 8 }}>Secret</p>
            <div style={{
              background: colors.bg,
              borderRadius: 10, padding: 16,
              boxShadow: `0 0 0 1px ${colors.border}, inset 0 1px 3px rgba(0,0,0,0.15)`,
            }}>
              <pre style={{
                fontFamily: FONT_MONO,
                fontSize: 12, lineHeight: 1.6, color: colors.text,
                whiteSpace: "pre-wrap", wordBreak: "break-all",
                minHeight: 24, margin: 0,
              }}>
                {showVal ? c.value : maskValue(c.value)}
              </pre>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button onClick={() => setShowVal(!showVal)} style={{ ...btnSecondary, height: 30, fontSize: 11 }}>
                  {showVal ? <EyeOff style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
                  {showVal ? "Hide" : "Reveal"}
                </button>
                <button onClick={handleCopy} style={{
                  ...btnPrimary, height: 30, fontSize: 11,
                  background: copied ? colors.success : btnPrimary.background,
                }}>
                  {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </section>

          {/* Tags */}
          {c.tags.length > 0 && (
            <section>
              <p style={{ fontSize: 11, fontWeight: 500, color: colors.textFaint, marginBottom: 8 }}>Tags</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {c.tags.map((t) => badge(t.color + "14", t.color, t.name))}
              </div>
            </section>
          )}

          {/* Notes */}
          {c.notes && (
            <section>
              <p style={{ fontSize: 11, fontWeight: 500, color: colors.textFaint, marginBottom: 8 }}>Notes</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: colors.textSecondary }}>{c.notes}</p>
            </section>
          )}

          {/* Details */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 500, color: colors.textFaint, marginBottom: 8 }}>Details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: colors.textTertiary }}>
                <Calendar style={{ width: 12, height: 12 }} /> Added {timeAgo(c.created_at)}
              </div>
              {c.accessed_at && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: colors.textTertiary }}>
                  <Clock style={{ width: 12, height: 12 }} /> Last used {timeAgo(c.accessed_at)}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 24px", borderTop: `1px solid ${colors.border}` }}>
          {actionBtn(<Pencil style={{ width: 12, height: 12 }} />, "Edit", () => setShowEdit(true))}
          {actionBtn(
            <Star style={{ width: 12, height: 12, ...(c.is_favorite ? { fill: colors.warning, color: colors.warning } : {}) }} />,
            c.is_favorite ? "Unfav" : "Fav",
            () => toggleFavorite(c.id),
          )}
          {actionBtn(
            c.is_archived ? <ArchiveRestore style={{ width: 12, height: 12 }} /> : <Archive style={{ width: 12, height: 12 }} />,
            c.is_archived ? "Restore" : "Archive",
            handleArchive,
          )}
          <div style={{ flex: 1 }} />
          <button onClick={handleDel} style={{
            ...(confirmDel ? { ...btnPrimary, background: colors.danger, boxShadow: "0 1px 3px rgba(229,72,77,0.25)" } : btnSecondary),
            height: 28, padding: "0 10px", fontSize: 11,
          }}>
            <Trash2 style={{ width: 12, height: 12 }} /> {confirmDel ? "Confirm" : "Delete"}
          </button>
        </div>
      </div>

      {showEdit && <EditCredentialModal credential={c} onClose={() => setShowEdit(false)} />}
    </>
  );
}
