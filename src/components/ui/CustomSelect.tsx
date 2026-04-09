import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { colors, FONT, inputStyle } from "../../lib/styles";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  focused?: boolean;
}

export function CustomSelect({ value, options, onChange, onFocus, onBlur, focused = false }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onBlur]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); if (!open) onFocus?.(); else onBlur?.(); }}
        style={{
          ...inputStyle(focused || open),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>{selected?.label ?? ""}</span>
        <ChevronDown style={{ width: 12, height: 12, color: colors.textTertiary, flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          zIndex: 100,
          background: colors.bgSurface,
          borderRadius: 8,
          padding: 4,
          boxShadow: `0 0 0 1px ${colors.borderStrong}, 0 8px 24px rgba(0,0,0,0.5)`,
          fontFamily: FONT,
        }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); onBlur?.(); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 5,
                border: "none",
                background: opt.value === value ? "rgba(255,255,255,0.06)" : "transparent",
                color: opt.value === value ? colors.text : colors.textSecondary,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: FONT,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.08s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = opt.value === value ? "rgba(255,255,255,0.06)" : "transparent"; }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check style={{ width: 12, height: 12, color: colors.accent }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
