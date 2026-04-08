import { useState } from "react";
import { X, Download, Upload, Clock, Shield, Info } from "lucide-react";
import { setAutoLockSeconds, exportVault, importVault } from "../../lib/tauri";
import { useCredentialStore } from "../../stores/credentialStore";
import { save, open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { colors, btnSecondary, modalOverlay, modalCard, sectionCard, sectionTitle, sectionIcon } from "../../lib/styles";

const LOCK_OPTIONS = [
  { label: "1 min", value: 60 },
  { label: "5 min", value: 300 },
  { label: "15 min", value: 900 },
  { label: "30 min", value: 1800 },
  { label: "Never", value: 0 },
];

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { loadCredentials, loadTags } = useCredentialStore();
  const [autoLock, setAutoLock] = useState(300);
  const [exportMsg, setExportMsg] = useState("");
  const [importMsg, setImportMsg] = useState("");

  async function handleAutoLock(s: number) { setAutoLock(s); await setAutoLockSeconds(s); }

  async function handleExport() {
    try {
      const path = await save({ defaultPath: `pastepassword-export-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: "JSON", extensions: ["json"] }] });
      if (!path) return;
      const n = await exportVault(path);
      setExportMsg(`Exported ${n} credentials`); setTimeout(() => setExportMsg(""), 3000);
    } catch (e) { setExportMsg(`Error: ${e}`); }
  }

  async function handleImport() {
    try {
      const path = await open({ filters: [{ name: "JSON", extensions: ["json"] }], multiple: false });
      if (!path) return;
      const n = await importVault(path as string);
      setImportMsg(`Imported ${n} credentials`); await loadCredentials(); await loadTags();
      setTimeout(() => setImportMsg(""), 3000);
    } catch (e) { setImportMsg(`Error: ${e}`); }
  }

  return (
    <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modalCard, width: "100%", maxWidth: 420, padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.text, letterSpacing: "-0.3px" }}>Settings</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textFaint, padding: 4, display: "flex" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Auto-lock */}
          <section>
            <div style={sectionTitle}>
              <Clock style={sectionIcon} />
              <span>Auto-lock timeout</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {LOCK_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => handleAutoLock(o.value)} style={{
                  flex: 1, height: 32, borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                  background: autoLock === o.value ? colors.accent : "rgba(255,255,255,0.03)",
                  color: autoLock === o.value ? "#fff" : colors.textTertiary,
                  boxShadow: autoLock === o.value
                    ? "0 1px 3px rgba(108,111,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : `0 0 0 1px ${colors.borderStrong}`,
                  transition: "all 0.1s",
                }}>
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* Security */}
          <section>
            <div style={sectionTitle}>
              <Shield style={sectionIcon} />
              <span>Security</span>
            </div>
            <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "Encryption: AES-256 (SQLCipher)",
                "Key derivation: Argon2id (64MB, 3 iterations)",
                "Clipboard auto-clear: 30 seconds",
                "Network access: None (fully offline)",
              ].map((line) => (
                <p key={line} style={{ fontSize: 11, color: colors.textTertiary, lineHeight: 1.5 }}>{line}</p>
              ))}
            </div>
          </section>

          {/* Export */}
          <section>
            <div style={sectionTitle}>
              <Download style={sectionIcon} />
              <span>Export vault</span>
            </div>
            <p style={{ fontSize: 11, color: colors.textFaint, marginBottom: 10, lineHeight: 1.5 }}>
              Export all credentials to JSON. Contains secrets in plaintext — store securely.
            </p>
            <button onClick={handleExport} style={btnSecondary}>Export to JSON</button>
            {exportMsg && <p style={{ fontSize: 11, color: colors.success, marginTop: 8 }}>{exportMsg}</p>}
          </section>

          {/* Import */}
          <section>
            <div style={sectionTitle}>
              <Upload style={sectionIcon} />
              <span>Import credentials</span>
            </div>
            <p style={{ fontSize: 11, color: colors.textFaint, marginBottom: 10, lineHeight: 1.5 }}>
              Import from a PastePassword export file.
            </p>
            <button onClick={handleImport} style={btnSecondary}>Import from JSON</button>
            {importMsg && <p style={{ fontSize: 11, color: colors.success, marginTop: 8 }}>{importMsg}</p>}
          </section>

          {/* About */}
          <section>
            <div style={sectionTitle}>
              <Info style={sectionIcon} />
              <span>About</span>
            </div>
            <div style={sectionCard}>
              <p style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 2 }}>PastePassword</p>
              <p style={{ fontSize: 11, color: colors.textFaint, marginBottom: 10 }}>Version 0.1.0</p>
              <p style={{ fontSize: 12, color: colors.textTertiary }}>
                Built by{" "}
                <span style={{ color: colors.accent, cursor: "pointer" }}
                  onClick={() => invoke("open_url", { url: "https://nytemode.com" })}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}>
                  nytemode
                </span>
              </p>
              <p style={{ fontSize: 10, color: colors.textMuted, marginTop: 6 }}>
                Free & open source · MIT License
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
