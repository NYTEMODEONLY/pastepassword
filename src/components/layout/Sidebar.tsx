import { useAuthStore } from "../../stores/authStore";
import { useCredentialStore } from "../../stores/credentialStore";
import {
  Key, Star, Clock, Tag, Lock, Plus, Archive, Settings,
  KeyRound, Code, Terminal, FileKey, Hash, HelpCircle, LayoutList,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import type { CredentialType } from "../../types";
import { CRED_TYPE_LABELS } from "../../types";

interface SidebarProps { onQuickAdd: () => void; onSettings: () => void; }

const TYPE_ICONS: Record<CredentialType, React.ReactNode> = {
  password: <KeyRound />, api_key: <Code />, token: <Hash />,
  ssh_key: <FileKey />, env_var: <Terminal />, other: <HelpCircle />, unknown: <HelpCircle />,
};

const TYPE_COLORS: Record<CredentialType, string> = {
  password: "#e5484d", api_key: "#6c6fff", token: "#e5a000",
  ssh_key: "#30a46c", env_var: "#0ea5e9", other: "#8a8f98", unknown: "#62666d",
};

export function Sidebar({ onQuickAdd, onSettings }: SidebarProps) {
  const { lock } = useAuthStore();
  const { filter, setFilter, tags, credentials } = useCredentialStore();
  const credTypes: CredentialType[] = ["password", "api_key", "token", "ssh_key", "env_var", "other"];
  const counts = credentials.reduce((a, c) => { a[c.cred_type] = (a[c.cred_type] || 0) + 1; return a; }, {} as Record<string, number>);
  const noFilter = !filter.cred_type && !filter.is_favorite && !filter.tag_id && !filter.is_archived && filter.sort_by !== "accessed_at";
  const clear = { cred_type: undefined, is_favorite: undefined, tag_id: undefined, is_archived: undefined, sort_by: undefined };

  return (
    <div style={{
      width: 220, flexShrink: 0, height: "100%",
      display: "flex", flexDirection: "column",
      background: "#0f1012",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 8px" }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "rgba(108,111,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Key style={{ width: 14, height: 14, color: "#6c6fff" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f7f8f8", letterSpacing: "-0.2px" }}>PastePassword</span>
      </div>

      {/* Quick Add */}
      <div style={{ padding: "4px 8px 8px" }}>
        <button onClick={onQuickAdd} style={{
          width: "100%", height: 32, borderRadius: 7,
          background: "#6c6fff", color: "#fff",
          display: "flex", alignItems: "center", gap: 6,
          padding: "0 12px",
          fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
          boxShadow: "0 1px 3px rgba(108,111,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}>
          <Plus style={{ width: 14, height: 14 }} />
          Quick Add
          <span style={{
            marginLeft: "auto", fontSize: 9, fontWeight: 500,
            background: "rgba(255,255,255,0.15)", borderRadius: 3, padding: "1px 5px",
          }}>⌘N</span>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <NavBtn icon={<LayoutList />} label="All" count={credentials.length} active={noFilter}
            onClick={() => setFilter(clear)} />
          <NavBtn icon={<Star />} label="Favorites" active={filter.is_favorite === true}
            onClick={() => setFilter({ ...clear, is_favorite: true })} />
          <NavBtn icon={<Clock />} label="Recent" active={filter.sort_by === "accessed_at"}
            onClick={() => setFilter({ ...clear, sort_by: "accessed_at" })} />
          <NavBtn icon={<Archive />} label="Archived" active={filter.is_archived === true}
            onClick={() => setFilter({ ...clear, is_archived: true })} />
        </div>

        <div style={{ fontSize: 10, fontWeight: 600, color: "#4a4a5a", textTransform: "uppercase", letterSpacing: "0.06em", padding: "16px 10px 6px" }}>
          Types
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {credTypes.map((t) => (
            <NavBtn key={t} icon={TYPE_ICONS[t]} label={CRED_TYPE_LABELS[t]} count={counts[t]}
              active={filter.cred_type === t} iconColor={TYPE_COLORS[t]}
              onClick={() => setFilter({ ...clear, cred_type: filter.cred_type === t ? undefined : t })} />
          ))}
        </div>

        {tags.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#4a4a5a", textTransform: "uppercase", letterSpacing: "0.06em", padding: "16px 10px 6px" }}>
              Tags
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {tags.map((tag) => (
                <NavBtn key={tag.id} icon={<Tag />} label={tag.name} active={filter.tag_id === tag.id}
                  iconColor={tag.color}
                  onClick={() => setFilter({ ...clear, tag_id: filter.tag_id === tag.id ? undefined : tag.id })} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "6px 8px 2px", display: "flex", flexDirection: "column", gap: 2 }}>
          <NavBtn icon={<Settings />} label="Settings" active={false} onClick={onSettings} />
          <NavBtn icon={<Lock />} label="Lock Vault" active={false} onClick={lock} />
        </div>
        <div style={{ padding: "6px 18px 10px", textAlign: "center" }}>
          <span style={{ fontSize: 10, color: "#3a3a4a" }}>
            a{" "}
            <span
              style={{ color: "#5a5a6a", cursor: "pointer", textDecoration: "none" }}
              onClick={() => invoke("open_url", { url: "https://nytemode.com" })}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#8a8f98"; e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#5a5a6a"; e.currentTarget.style.textDecoration = "none"; }}
            >
              nytemode
            </span>
            {" "}project
          </span>
        </div>
      </div>
    </div>
  );
}

function NavBtn({ icon, label, count, active, onClick, iconColor }: {
  icon: React.ReactNode; label: string; count?: number; active: boolean; onClick: () => void; iconColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px",
        borderRadius: 7,
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: active ? 550 : 500,
        fontFamily: "inherit",
        color: active ? "#f7f8f8" : "#8a8f98",
        background: active ? "rgba(255,255,255,0.07)" : "transparent",
        transition: "all 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#d0d6e0";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#8a8f98";
        }
      }}
    >
      <span style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 16, height: 16, flexShrink: 0,
        color: active ? "#6c6fff" : (iconColor || "inherit"),
      }}>
        <span style={{ display: "flex" }} className="[&>svg]:w-[14px] [&>svg]:h-[14px]">{icon}</span>
      </span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{
          marginLeft: "auto", fontSize: 10, fontWeight: 500,
          color: active ? "#8a8f98" : "#4a4a5a",
          fontVariantNumeric: "tabular-nums",
        }}>{count}</span>
      )}
    </button>
  );
}
