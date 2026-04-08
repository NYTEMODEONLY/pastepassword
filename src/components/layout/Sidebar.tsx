import { useAuthStore } from "../../stores/authStore";
import { useCredentialStore } from "../../stores/credentialStore";
import {
  Key,
  Star,
  Clock,
  Tag,
  Lock,
  Plus,
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

export function Sidebar({ onQuickAdd }: SidebarProps) {
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
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-text">PastePassword</span>
        </div>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={onQuickAdd}
          className="flex w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Quick Add
          <span className="ml-auto text-xs opacity-70">⌘N</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1">
        <div className="mb-1">
          <SidebarItem
            icon={<LayoutList className="h-4 w-4" />}
            label="All"
            count={credentials.length}
            active={!filter.cred_type && !filter.is_favorite && !filter.tag_id}
            onClick={() =>
              setFilter({
                cred_type: undefined,
                is_favorite: undefined,
                tag_id: undefined,
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
              })
            }
          />
        </div>

        <div className="mb-1 mt-3">
          <p className="mb-1 px-3 text-xs font-medium uppercase text-text-muted">
            Types
          </p>
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
                })
              }
              color={CRED_TYPE_COLORS[type]}
            />
          ))}
        </div>

        {tags.length > 0 && (
          <div className="mb-1 mt-3">
            <p className="mb-1 px-3 text-xs font-medium uppercase text-text-muted">
              Tags
            </p>
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
                  })
                }
                color={tag.color}
              />
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-border p-2">
        <button
          onClick={lock}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text"
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
        "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
        active
          ? "bg-accent/10 text-accent"
          : "text-text-secondary hover:bg-bg-hover hover:text-text",
      )}
    >
      <span style={color && !active ? { color } : undefined}>{icon}</span>
      <span className="truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-auto text-xs text-text-muted">{count}</span>
      )}
    </button>
  );
}
