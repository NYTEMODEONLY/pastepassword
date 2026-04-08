import { useEffect, useCallback } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";
import { cn, timeAgo } from "../../lib/utils";
import { Star, Plus, Search, Key } from "lucide-react";

interface CredentialListProps {
  onQuickAdd: () => void;
}

export function CredentialList({ onQuickAdd }: CredentialListProps) {
  const {
    credentials,
    selectedId,
    selectCredential,
    searchQuery,
    setSearchQuery,
  } = useCredentialStore();

  // Keyboard navigation: j/k to move, Enter to select
  const handleKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const currentIndex = credentials.findIndex((c) => c.id === selectedId);

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(currentIndex + 1, credentials.length - 1);
        if (credentials[next]) selectCredential(credentials[next].id);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(currentIndex - 1, 0);
        if (credentials[prev]) selectCredential(credentials[prev].id);
      }
    },
    [credentials, selectedId, selectCredential],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [handleKeyNav]);

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-bg">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 pl-9 text-sm text-text outline-none transition-all duration-200 placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[10px] text-text-muted">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center animate-fade-in">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-secondary">
              <Key className="h-6 w-6 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              No credentials yet
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Add your first secret to get started
            </p>
            <button
              onClick={onQuickAdd}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20"
            >
              <Plus className="h-4 w-4" />
              Quick Add
            </button>
          </div>
        ) : (
          <div className="px-2 pb-2">
            {credentials.map((cred, index) => (
              <button
                key={cred.id}
                onClick={() => selectCredential(cred.id)}
                className={cn(
                  "group flex w-full flex-col gap-1.5 rounded-lg px-3 py-3 text-left transition-all duration-150",
                  selectedId === cred.id
                    ? "bg-accent/8 ring-1 ring-accent/20"
                    : "hover:bg-bg-hover",
                )}
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <div className="flex items-center gap-2">
                  {cred.is_favorite && (
                    <Star className="h-3 w-3 shrink-0 fill-warning text-warning" />
                  )}
                  <span
                    className={cn(
                      "truncate text-sm",
                      selectedId === cred.id
                        ? "font-medium text-text"
                        : "text-text-secondary group-hover:text-text",
                    )}
                  >
                    {cred.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor:
                        CRED_TYPE_COLORS[cred.cred_type] + "15",
                      color: CRED_TYPE_COLORS[cred.cred_type],
                    }}
                  >
                    {CRED_TYPE_LABELS[cred.cred_type]}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {timeAgo(cred.created_at)}
                  </span>
                  {cred.tags.length > 0 && (
                    <span className="truncate text-[11px] text-text-muted">
                      · {cred.tags.map((t) => t.name).join(", ")}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      {credentials.length > 0 && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-[11px] text-text-muted">
            {credentials.length} credential{credentials.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
}
