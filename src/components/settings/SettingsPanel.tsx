import { useState } from "react";
import { X, Download, Upload, Clock, Shield } from "lucide-react";
import { setAutoLockSeconds, exportVault, importVault } from "../../lib/tauri";
import { useCredentialStore } from "../../stores/credentialStore";
import { save, open } from "@tauri-apps/plugin-dialog";

interface SettingsPanelProps {
  onClose: () => void;
}

const LOCK_OPTIONS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
  { label: "Never", value: 0 },
];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { loadCredentials, loadTags } = useCredentialStore();
  const [autoLock, setAutoLock] = useState(300);
  const [exportStatus, setExportStatus] = useState("");
  const [importStatus, setImportStatus] = useState("");

  async function handleAutoLockChange(seconds: number) {
    setAutoLock(seconds);
    await setAutoLockSeconds(seconds);
  }

  async function handleExport() {
    try {
      const path = await save({
        defaultPath: `pastepassword-export-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!path) return;

      const count = await exportVault(path);
      setExportStatus(`Exported ${count} credentials`);
      setTimeout(() => setExportStatus(""), 3000);
    } catch (e) {
      setExportStatus(`Error: ${e}`);
    }
  }

  async function handleImport() {
    try {
      const path = await open({
        filters: [{ name: "JSON", extensions: ["json"] }],
        multiple: false,
      });
      if (!path) return;

      const count = await importVault(path as string);
      setImportStatus(`Imported ${count} credentials`);
      await loadCredentials();
      await loadTags();
      setTimeout(() => setImportStatus(""), 3000);
    } catch (e) {
      setImportStatus(`Error: ${e}`);
    }
  }

  return (
    <div
      className="glass-backdrop animate-backdrop-in fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md animate-fade-in-scale rounded-xl border border-border bg-bg-secondary p-6 shadow-2xl shadow-black/40">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Settings</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-bg-hover hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Auto-lock */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-secondary" />
              <label className="text-sm font-medium text-text">
                Auto-lock timeout
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {LOCK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAutoLockChange(opt.value)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                    autoLock === opt.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Security info */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-text-secondary" />
              <label className="text-sm font-medium text-text">Security</label>
            </div>
            <div className="rounded-lg border border-border bg-bg p-3 text-xs text-text-secondary space-y-1">
              <p>Encryption: AES-256 (SQLCipher)</p>
              <p>Key derivation: Argon2id (64MB, 3 iterations)</p>
              <p>Clipboard auto-clear: 30 seconds</p>
              <p>Network access: None (fully offline)</p>
            </div>
          </div>

          {/* Export */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Download className="h-4 w-4 text-text-secondary" />
              <label className="text-sm font-medium text-text">
                Export vault
              </label>
            </div>
            <p className="mb-2 text-xs text-text-muted">
              Export all credentials to a JSON file. The file contains secrets in
              plaintext — store it securely.
            </p>
            <button
              onClick={handleExport}
              className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text"
            >
              Export to JSON
            </button>
            {exportStatus && (
              <p className="mt-2 text-xs text-success">{exportStatus}</p>
            )}
          </div>

          {/* Import */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Upload className="h-4 w-4 text-text-secondary" />
              <label className="text-sm font-medium text-text">
                Import credentials
              </label>
            </div>
            <p className="mb-2 text-xs text-text-muted">
              Import from a PastePassword export file. Duplicate entries will be
              added as new credentials.
            </p>
            <button
              onClick={handleImport}
              className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text"
            >
              Import from JSON
            </button>
            {importStatus && (
              <p className="mt-2 text-xs text-success">{importStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
