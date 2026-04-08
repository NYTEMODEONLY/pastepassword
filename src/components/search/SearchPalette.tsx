import { useState, useEffect, useRef } from "react";
import { searchCredentials } from "../../lib/tauri";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";
import type { CredentialSummary } from "../../types";
import { Search, Copy, Check } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface SearchPaletteProps {
  onClose: () => void;
}

export function SearchPalette({ onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CredentialSummary[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await searchCredentials(query);
        setResults(res);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleCopy(id: string) {
    try {
      const cred = await invoke<{ value: string }>("get_credential", { id });
      await writeText(cred.value);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
        onClose();
      }, 500);

      // Auto-clear clipboard
      setTimeout(async () => {
        try {
          await writeText("");
        } catch {}
      }, 30000);
    } catch {
      // ignore
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleCopy(results[selectedIndex].id);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[20vh]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg animate-fade-in rounded-xl border border-border bg-bg-secondary shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-text outline-none placeholder:text-text-muted"
            placeholder="Search credentials..."
          />
          <kbd className="rounded border border-border px-2 py-0.5 text-xs text-text-muted">
            ESC
          </kbd>
        </div>

        {results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map((cred, index) => (
              <button
                key={cred.id}
                onClick={() => handleCopy(cred.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                  index === selectedIndex ? "bg-accent/10" : "hover:bg-bg-hover"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {cred.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor:
                          CRED_TYPE_COLORS[cred.cred_type] + "20",
                        color: CRED_TYPE_COLORS[cred.cred_type],
                      }}
                    >
                      {CRED_TYPE_LABELS[cred.cred_type]}
                    </span>
                    {cred.tags.map((t) => (
                      <span key={t.id} className="text-xs text-text-muted">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
                {copiedId === cred.id ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-text-muted" />
                )}
              </button>
            ))}
          </div>
        ) : query ? (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            No results for "{query}"
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            Type to search your credentials
          </div>
        )}
      </div>
    </div>
  );
}
