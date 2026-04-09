import { useState } from "react";
import { X, Download, Upload, Clock, Shield, Info } from "lucide-react";
import { setAutoLockSeconds, exportVault, importVault } from "../../lib/tauri";
import { useCredentialStore } from "../../stores/credentialStore";
import { save, open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { colors, FONT, btnSecondary, modalOverlay, modalCard, sectionTitle, sectionIcon } from "../../lib/styles";

const LOCK_OPTIONS = [
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
  { label: "15m", value: 900 },
  { label: "30m", value: 1800 },
  { label: "Never", value: 0 },
];

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { loadCredentials, loadTags } = useCredentialStore();
  const [autoLock, setAutoLock] = useState(300);
  const [msg, setMsg] = useState("");

  async function handleAutoLock(s: number) { setAutoLock(s); await setAutoLockSeconds(s); }

  async function handleExport() {
    try {
      const path = await save({ defaultPath: `pastepassword-export-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: "JSON", extensions: ["json"] }] });
      if (!path) return;
      const n = await exportVault(path);
      setMsg(`Exported ${n} credentials`); setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg(`Error: ${e}`); }
  }

  async function handleImport() {
    try {
      const path = await open({ filters: [{ name: "JSON", extensions: ["json"] }], multiple: false });
      if (!path) return;
      const n = await importVault(path as string);
      setMsg(`Imported ${n} credentials`); await loadCredentials(); await loadTags();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg(`Error: ${e}`); }
  }

  return (
    <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modalCard, width: "100%", maxWidth: 380, padding: "20px 22px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Settings</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textFaint, padding: 4, display: "flex" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Auto-lock */}
          <section>
            <div style={sectionTitle}><Clock style={sectionIcon} /><span>Auto-lock</span></div>
            <div style={{ display: "flex", gap: 4 }}>
              {LOCK_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => handleAutoLock(o.value)} style={{
                  flex: 1, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, fontFamily: FONT,
                  background: autoLock === o.value ? colors.accent : "rgba(255,255,255,0.03)",
                  color: autoLock === o.value ? "#fff" : colors.textTertiary,
                  boxShadow: autoLock === o.value
                    ? "0 1px 2px rgba(123,69,193,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : `0 0 0 1px ${colors.borderStrong}`,
                  transition: "all 0.1s",
                }}>{o.label}</button>
              ))}
            </div>
          </section>

          {/* Security — compact single line */}
          <section>
            <div style={sectionTitle}><Shield style={sectionIcon} /><span>Security</span></div>
            <p style={{ fontSize: 10, color: colors.textTertiary, lineHeight: 1.6 }}>
              AES-256 (SQLCipher) · Argon2id KDF · Clipboard clears in 30s · Fully offline
            </p>
          </section>

          {/* Data — Export + Import combined */}
          <section>
            <div style={sectionTitle}><Download style={sectionIcon} /><span>Data</span></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleExport} style={{ ...btnSecondary, height: 30, fontSize: 11, flex: 1 }}>
                <Download style={{ width: 12, height: 12 }} /> Export
              </button>
              <button onClick={handleImport} style={{ ...btnSecondary, height: 30, fontSize: 11, flex: 1 }}>
                <Upload style={{ width: 12, height: 12 }} /> Import
              </button>
            </div>
            {msg && <p style={{ fontSize: 10, color: colors.success, marginTop: 6 }}>{msg}</p>}
          </section>

          {/* About — compact */}
          <section style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>PastePassword <span style={{ fontWeight: 400, color: colors.textFaint }}>v0.1.0</span></p>
                <p style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
                  Built by{" "}
                  <span style={{ color: colors.accent, cursor: "pointer" }}
                    onClick={() => invoke("open_url", { url: "https://nytemode.com" })}
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}>
                    nytemode
                  </span>
                  {" · MIT License"}
                </p>
              </div>
              <Info style={{ width: 14, height: 14, color: colors.textMuted, flexShrink: 0 }} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
