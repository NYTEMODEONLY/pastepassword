import { useAuthStore } from "../../stores/authStore";
import { useCredentialStore } from "../../stores/credentialStore";
import {
  Key,
  Star,
  Clock,
  Tag,
  Lock,
  Plus,
  Archive,
  Settings,
  KeyRound,
  Code,
  Terminal,
  FileKey,
  Hash,
  HelpCircle,
  LayoutList,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { CredentialType } from "../../types";
import { CRED_TYPE_LABELS, CRED_TYPE_COLORS } from "../../types";

interface SidebarProps {
  onQuickAdd: () => void;
  onSettings: () => void;
}

const TYPE_ICONS: Record<CredentialType, React.ReactNode> = {
  password: <KeyRound className="h-3.5 w-3.5" />,
  api_key: <Code className="h-3.5 w-3.5" />,
  token: <Hash className="h-3.5 w-3.5" />,
  ssh_key: <FileKey className="h-3.5 w-3.5" />,
  env_var: <Terminal className="h-3.5 w-3.5" />,
  other: <HelpCircle className="h-3.5 w-3.5" />,
  unknown: <HelpCircle className="h-3.5 w-3.5" />,
};

export function Sidebar({ onQuickAdd, onSettings }: SidebarProps) {
  const { lock } = useAuthStore();
  const { filter, setFilter, tags, credentials } = useCredentialStore();

  const credTypes: CredentialType[] = [
    "password",
    "api_key",
    "token",
    "ssh_key",
    "env_var",
    "other",
  ];

  const typeCounts = credentials.reduce(
    (acc, c) => {
      acc[c.cred_type] = (acc[c.cred_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
          <Key className="h-3.5 w-3.5 text-accent" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-text">
          PastePassword
        </span>
      </div>

      {/* Quick Add */}
      <div className="px-3 pb-3">
        <button
          onClick={onQuickAdd}
          className="flex w-full items-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/15 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/25 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Quick Add
          <kbd className="ml-auto rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-normal opacity-70">
            ⌘N
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        <div className="space-y-0.5">
          <SidebarItem
            icon={<LayoutList className="h-4 w-4" />}
            label="All"
            count={credentials.length}
            active={!filter.cred_type && !filter.is_favorite && !filter.tag_id && !filter.is_archived}
            onClick={() =>
              setFilter({
                cred_type: undefined,
                is_favorite: undefined,
                tag_id: undefined,
                is_archived: undefined,
              })
            }
          />
          <SidebarItem
            icon={<Star className="h-4 w-4" />}
            label="Favorites"
            active={filter.is_favorite === true}
            onClick={() =>
              setFilter({
                is_favorite: true,
                cred_type: undefined,
                tag_id: undefined,
                is_archived: undefined,
              })
            }
          />
          <SidebarItem
            icon={<Clock className="h-4 w-4" />}
            label="Recently Used"
            active={filter.sort_by === "accessed_at"}
            onClick={() =>
              setFilter({
                sort_by: "accessed_at",
                cred_type: undefined,
                is_favorite: undefined,
                tag_id: undefined,
                is_archived: undefined,
              })
            }
          />
          <SidebarItem
            icon={<Archive className="h-4 w-4" />}
            label="Archived"
            active={filter.is_archived === true}
            onClick={() =>
              setFilter({
                is_archived: true,
                cred_type: undefined,
                is_favorite: undefined,
                tag_id: undefined,
              })
            }
          />
        </div>

        {/* Types */}
        <div className="mt-5">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Types
          </p>
          <div className="space-y-0.5">
            {credTypes.map((type) => (
              <SidebarItem
                key={type}
                icon={TYPE_ICONS[type]}
                label={CRED_TYPE_LABELS[type]}
                count={typeCounts[type]}
                active={filter.cred_type === type}
                onClick={() =>
                  setFilter({
                    cred_type: filter.cred_type === type ? undefined : type,
                    is_favorite: undefined,
                    tag_id: undefined,
                    is_archived: undefined,
                  })
                }
                color={CRED_TYPE_COLORS[type]}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Tags
            </p>
            <div className="space-y-0.5">
              {tags.map((tag) => (
                <SidebarItem
                  key={tag.id}
                  icon={<Tag className="h-3.5 w-3.5" />}
                  label={tag.name}
                  active={filter.tag_id === tag.id}
                  onClick={() =>
                    setFilter({
                      tag_id: filter.tag_id === tag.id ? undefined : tag.id,
                      cred_type: undefined,
                      is_favorite: undefined,
                      is_archived: undefined,
                    })
                  }
                  color={tag.color}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-border p-2">
        <button
          onClick={onSettings}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted transition-all duration-150 hover:bg-bg-hover hover:text-text-secondary"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <button
          onClick={lock}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted transition-all duration-150 hover:bg-bg-hover hover:text-text-secondary"
        >
          <Lock className="h-4 w-4" />
          Lock Vault
        </button>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-all duration-150",
        active
          ? "bg-accent/10 text-accent font-medium"
          : "text-text-secondary hover:bg-bg-hover hover:text-text",
      )}
    >
      <span
        className="transition-colors duration-150"
        style={color && !active ? { color } : undefined}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "ml-auto min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-medium",
            active
              ? "bg-accent/20 text-accent"
              : "bg-bg-tertiary text-text-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
