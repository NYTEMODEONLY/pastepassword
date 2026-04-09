import { useState, useEffect, useRef } from "react";
import { searchCredentials } from "../../lib/tauri";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";
import type { CredentialSummary } from "../../types";
import { Search, Copy, Check } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { colors, FONT, modalOverlay, modalCard } from "../../lib/styles";

export function SearchPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CredentialSummary[]>([]);
  const [sel, setSel] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try { setResults(await searchCredentials(query)); setSel(0); } catch { setResults([]); }
    }, 80);
    return () => clearTimeout(t);
  }, [query]);

  async function handleCopy(id: string) {
    try {
      const c = await invoke<{ value: string }>("get_credential", { id });
      await writeText(c.value);
      setCopiedId(id); setTimeout(() => { setCopiedId(null); onClose(); }, 400);
      setTimeout(async () => { try { await writeText(""); } catch {} }, 30000);
    } catch {}
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((p) => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((p) => Math.max(p - 1, 0)); }
    else if (e.key === "Enter" && results[sel]) { e.preventDefault(); handleCopy(results[sel].id); }
    else if (e.key === "Escape") onClose();
  }

  return (
    <div style={{ ...modalOverlay, alignItems: "flex-start", paddingTop: "18vh" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modalCard, width: "100%", maxWidth: 480 }}>
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px",
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <Search style={{ width: 16, height: 16, color: colors.textFaint, flexShrink: 0 }} />
          <input ref={ref} type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey}
            placeholder="Search credentials..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: colors.text, fontSize: 14, fontWeight: 500, fontFamily: FONT,
            }} />
          <kbd style={{
            fontSize: 9, fontWeight: 600, color: colors.textMuted,
            background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "2px 6px",
          }}>ESC</kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div style={{ maxHeight: 320, overflowY: "auto", padding: 6 }}>
            {results.map((r, i) => (
              <button key={r.id} onClick={() => handleCopy(r.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                textAlign: "left", fontFamily: FONT,
                background: i === sel ? colors.bgActive : "transparent",
                transition: "background 0.08s",
              }}
                onMouseEnter={(e) => { setSel(i); e.currentTarget.style.background = colors.bgActive; }}
                onMouseLeave={(e) => { if (i !== sel) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 550, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3,
                      background: CRED_TYPE_COLORS[r.cred_type] + "14",
                      color: CRED_TYPE_COLORS[r.cred_type],
                    }}>{CRED_TYPE_LABELS[r.cred_type]}</span>
                    {r.tags.map((t) => <span key={t.id} style={{ fontSize: 10, color: colors.textFaint }}>{t.name}</span>)}
                  </div>
                </div>
                {copiedId === r.id
                  ? <Check style={{ width: 14, height: 14, color: colors.success, flexShrink: 0 }} />
                  : <Copy style={{ width: 14, height: 14, color: colors.textMuted, flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 12, color: colors.textFaint }}>
            {query ? `No results for "${query}"` : "Type to search your credentials"}
          </div>
        )}
      </div>
    </div>
  );
}
