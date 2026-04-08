import { useState } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { updateCredential } from "../../lib/tauri";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";
import { timeAgo, maskValue } from "../../lib/utils";
import {
  Copy,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Check,
  X,
  Pencil,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { EditCredentialModal } from "./EditCredentialModal";

export function CredentialDetail() {
  const {
    selectedCredential,
    deleteCredential,
    toggleFavorite,
    selectCredential,
    loadCredentials,
  } = useCredentialStore();
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!selectedCredential) return null;

  const cred = selectedCredential;

  async function handleCopy() {
    try {
      await writeText(cred.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      setTimeout(async () => {
        try {
          await writeText("");
        } catch {}
      }, 30000);
    } catch {
      navigator.clipboard.writeText(cred.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    await deleteCredential(cred.id);
  }

  async function handleArchive() {
    await updateCredential(cred.id, { is_archived: !cred.is_archived });
    await loadCredentials();
    await selectCredential(cred.id);
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto bg-bg">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text">{cred.title}</h2>
            <span
              className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: CRED_TYPE_COLORS[cred.cred_type] + "20",
                color: CRED_TYPE_COLORS[cred.cred_type],
              }}
            >
              {CRED_TYPE_LABELS[cred.cred_type]}
            </span>
          </div>
          <button
            onClick={() => selectCredential(null)}
            className="rounded p-1 text-text-muted hover:bg-bg-hover hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 px-6 py-4 space-y-5">
          {/* Secret Value */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-text-muted">
              Secret
            </label>
            <div className="rounded-lg border border-border bg-bg-secondary p-3">
              <pre className="whitespace-pre-wrap break-all font-mono text-sm text-text">
                {showValue ? cred.value : maskValue(cred.value)}
              </pre>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowValue(!showValue)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary transition hover:bg-bg-hover hover:text-text"
                >
                  {showValue ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {showValue ? "Hide" : "Show"}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          {cred.tags.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase text-text-muted">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {cred.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-md px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: tag.color + "20",
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {cred.notes && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase text-text-muted">
                Notes
              </label>
              <p className="text-sm text-text-secondary">{cred.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-text-muted">
              Info
            </label>
            <div className="space-y-1 text-sm text-text-secondary">
              <p>Added: {timeAgo(cred.created_at)}</p>
              {cred.accessed_at && (
                <p>Last used: {timeAgo(cred.accessed_at)}</p>
              )}
              {cred.is_archived && (
                <p className="text-warning">Archived</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border px-6 py-3">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary transition hover:bg-bg-hover hover:text-text"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => toggleFavorite(cred.id)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary transition hover:bg-bg-hover hover:text-text"
          >
            <Star
              className={`h-3.5 w-3.5 ${cred.is_favorite ? "fill-warning text-warning" : ""}`}
            />
            {cred.is_favorite ? "Unfavorite" : "Favorite"}
          </button>
          <button
            onClick={handleArchive}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary transition hover:bg-bg-hover hover:text-text"
          >
            {cred.is_archived ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            {cred.is_archived ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={handleDelete}
            className={`ml-auto flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition ${
              confirmDelete
                ? "border-danger bg-danger text-white"
                : "border-border text-text-secondary hover:border-danger hover:text-danger"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmDelete ? "Confirm Delete" : "Delete"}
          </button>
        </div>
      </div>

      {showEdit && (
        <EditCredentialModal
          credential={cred}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
