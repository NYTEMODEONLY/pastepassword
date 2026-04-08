import { useCredentialStore } from "../../stores/credentialStore";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";
import { cn, timeAgo } from "../../lib/utils";
import { Star, Plus, Search } from "lucide-react";

interface CredentialListProps {
  onQuickAdd: () => void;
}

export function CredentialList({ onQuickAdd }: CredentialListProps) {
  const { credentials, selectedId, selectCredential, searchQuery, setSearchQuery } =
    useCredentialStore();

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-border">
      <div className="border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search... ⌘K"
            className="w-full rounded-md border border-border bg-bg px-4 py-2 pl-9 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-border-focus"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm text-text-muted">No credentials yet</p>
            <button
              onClick={onQuickAdd}
              className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover"
            >
              <Plus className="h-4 w-4" />
              Add your first credential
            </button>
          </div>
        ) : (
          credentials.map((cred) => (
            <button
              key={cred.id}
              onClick={() => selectCredential(cred.id)}
              className={cn(
                "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition",
                selectedId === cred.id
                  ? "bg-accent/10"
                  : "hover:bg-bg-hover",
              )}
            >
              <div className="flex items-center gap-2">
                {cred.is_favorite && (
                  <Star className="h-3 w-3 fill-warning text-warning" />
                )}
                <span className="truncate text-sm font-medium text-text">
                  {cred.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: CRED_TYPE_COLORS[cred.cred_type] + "20",
                    color: CRED_TYPE_COLORS[cred.cred_type],
                  }}
                >
                  {CRED_TYPE_LABELS[cred.cred_type]}
                </span>
                <span className="text-xs text-text-muted">
                  {timeAgo(cred.created_at)}
                </span>
                {cred.tags.length > 0 && (
                  <span className="truncate text-xs text-text-muted">
                    {cred.tags.map((t) => t.name).join(", ")}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
