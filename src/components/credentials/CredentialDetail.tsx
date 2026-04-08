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
  Calendar,
  Clock,
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
      <div className="flex flex-1 flex-col overflow-y-auto bg-bg animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-text">
              {cred.title}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: CRED_TYPE_COLORS[cred.cred_type] + "15",
                  color: CRED_TYPE_COLORS[cred.cred_type],
                }}
              >
                {CRED_TYPE_LABELS[cred.cred_type]}
              </span>
              {cred.is_favorite && (
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              )}
              {cred.is_archived && (
                <span className="rounded-md bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
                  Archived
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => selectCredential(null)}
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg-hover hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-6 py-5">
          {/* Secret Value */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Secret
            </label>
            <div className="rounded-xl border border-border bg-bg-secondary p-4">
              <pre className="min-h-[40px] whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-text">
                {showValue ? cred.value : maskValue(cred.value)}
              </pre>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowValue(!showValue)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary transition-all duration-150 hover:bg-bg-hover hover:text-text"
                >
                  {showValue ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {showValue ? "Hide" : "Reveal"}
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white transition-all duration-200 ${
                    copied
                      ? "bg-success shadow-md shadow-success/20"
                      : "bg-accent shadow-md shadow-accent/20 hover:bg-accent-hover hover:shadow-accent/30"
                  }`}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy to clipboard"}
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          {cred.tags.length > 0 && (
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {cred.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: tag.color + "15",
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
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Notes
              </label>
              <p className="text-sm leading-relaxed text-text-secondary">
                {cred.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Details
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-3.5 w-3.5 text-text-muted" />
                <span>Added {timeAgo(cred.created_at)}</span>
              </div>
              {cred.accessed_at && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="h-3.5 w-3.5 text-text-muted" />
                  <span>Last used {timeAgo(cred.accessed_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-1.5 border-t border-border px-6 py-3">
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            label="Edit"
            onClick={() => setShowEdit(true)}
          />
          <ActionButton
            icon={
              <Star
                className={`h-3.5 w-3.5 ${cred.is_favorite ? "fill-warning text-warning" : ""}`}
              />
            }
            label={cred.is_favorite ? "Unfav" : "Fav"}
            onClick={() => toggleFavorite(cred.id)}
          />
          <ActionButton
            icon={
              cred.is_archived ? (
                <ArchiveRestore className="h-3.5 w-3.5" />
              ) : (
                <Archive className="h-3.5 w-3.5" />
              )
            }
            label={cred.is_archived ? "Restore" : "Archive"}
            onClick={handleArchive}
          />
          <div className="flex-1" />
          <button
            onClick={handleDelete}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              confirmDelete
                ? "border-danger bg-danger text-white shadow-md shadow-danger/20"
                : "border-border text-text-muted hover:border-danger/50 hover:text-danger"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmDelete ? "Confirm" : "Delete"}
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

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-150 hover:bg-bg-hover hover:text-text"
    >
      {icon}
      {label}
    </button>
  );
}
