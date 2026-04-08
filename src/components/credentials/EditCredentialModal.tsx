import { useState } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { updateCredential } from "../../lib/tauri";
import { X } from "lucide-react";
import { CRED_TYPE_LABELS, type CredentialType, type Credential } from "../../types";

const TYPES: CredentialType[] = [
  "password",
  "api_key",
  "token",
  "ssh_key",
  "env_var",
  "other",
];

interface EditCredentialModalProps {
  credential: Credential;
  onClose: () => void;
}

export function EditCredentialModal({
  credential,
  onClose,
}: EditCredentialModalProps) {
  const { loadCredentials, selectCredential, tags, createTag } =
    useCredentialStore();
  const [title, setTitle] = useState(credential.title);
  const [value, setValue] = useState(credential.value);
  const [credType, setCredType] = useState<CredentialType>(credential.cred_type);
  const [notes, setNotes] = useState(credential.notes);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    credential.tags.map((t) => t.id),
  );
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    setSaving(true);
    try {
      await updateCredential(credential.id, {
        title,
        value: value.trim(),
        cred_type: credType,
        notes,
        tag_ids: selectedTagIds,
      });
      await loadCredentials();
      await selectCredential(credential.id);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    try {
      const tag = await createTag(newTagName.trim());
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setNewTagName("");
    } catch {
      // duplicate
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  return (
    <div
      className="glass-backdrop animate-backdrop-in fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg animate-fade-in-scale rounded-xl border border-border bg-bg-secondary p-6 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Edit Credential</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-bg-hover hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text outline-none transition focus:border-border-focus"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Secret
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 font-mono text-sm text-text outline-none transition focus:border-border-focus"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm text-text-secondary">
                Type
              </label>
              <select
                value={credType}
                onChange={(e) => setCredType(e.target.value as CredentialType)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-border-focus"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CRED_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm text-text-secondary">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-border-focus"
                placeholder="What is this for?"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="rounded-md border px-2 py-1 text-xs font-medium transition"
                  style={{
                    borderColor: selectedTagIds.includes(tag.id)
                      ? tag.color
                      : "var(--color-border)",
                    backgroundColor: selectedTagIds.includes(tag.id)
                      ? tag.color + "20"
                      : "transparent",
                    color: selectedTagIds.includes(tag.id)
                      ? tag.color
                      : "var(--color-text-secondary)",
                  }}
                >
                  {tag.name}
                </button>
              ))}
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
                className="w-24 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text outline-none placeholder:text-text-muted focus:border-border-focus"
                placeholder="New tag..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition hover:bg-bg-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim() || saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
