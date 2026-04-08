import type { CSSProperties } from "react";

// Shared style primitives for consistent rendering across the app
// Using inline styles because Tailwind v4 @theme tokens don't apply reliably in Tauri

export const colors = {
  bg: "#08090a",
  bgRaised: "#0f1012",
  bgElevated: "#151618",
  bgSurface: "#1a1b1e",
  bgInput: "rgba(255,255,255,0.04)",
  bgHover: "rgba(255,255,255,0.04)",
  bgActive: "rgba(255,255,255,0.07)",

  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.09)",

  text: "#f7f8f8",
  textSecondary: "#d0d6e0",
  textTertiary: "#8a8f98",
  textFaint: "#62666d",
  textMuted: "#4a4a5a",

  accent: "#6c6fff",
  accentHover: "#7e80ff",
  accentBg: "rgba(108,111,255,0.12)",

  danger: "#e5484d",
  success: "#30a46c",
  warning: "#e5a000",
} as const;

export const inputStyle = (focused: boolean): CSSProperties => ({
  width: "100%",
  height: 38,
  borderRadius: 8,
  border: "none",
  background: colors.bgInput,
  boxShadow: focused
    ? `0 0 0 1px ${colors.accent}, 0 0 0 3px rgba(108,111,255,0.08)`
    : `0 0 0 1px ${colors.borderStrong}`,
  color: colors.text,
  fontSize: 13,
  fontWeight: 500,
  padding: "0 12px",
  outline: "none",
  fontFamily: "inherit",
  transition: "box-shadow 0.12s",
});

export const textareaStyle = (focused: boolean): CSSProperties => ({
  ...inputStyle(focused),
  height: "auto",
  padding: "10px 12px",
  resize: "none" as const,
  lineHeight: 1.5,
  fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
  fontSize: 12,
});

export const selectStyle = (focused: boolean): CSSProperties => ({
  ...inputStyle(focused),
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 3.75L5 6.25L7.5 3.75' stroke='%238a8f98' stroke-width='1.25' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 28,
  cursor: "pointer",
});

export const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: colors.textFaint,
  display: "block",
  marginBottom: 6,
};

export const btnPrimary: CSSProperties = {
  height: 34,
  borderRadius: 8,
  background: `linear-gradient(180deg, #7275ff 0%, #5c5fef 100%)`,
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "0 16px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxShadow: "0 1px 3px rgba(108,111,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
  transition: "all 0.12s",
};

export const btnSecondary: CSSProperties = {
  height: 34,
  borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
  color: colors.textSecondary,
  fontSize: 12,
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "0 14px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxShadow: `0 0 0 1px ${colors.borderStrong}`,
  transition: "all 0.12s",
};

export const modalOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

export const modalCard: CSSProperties = {
  background: "linear-gradient(180deg, #1a1b1f 0%, #151618 100%)",
  borderRadius: 14,
  boxShadow: `0 0 0 1px ${colors.border}, 0 24px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)`,
};

export const sectionCard: CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  borderRadius: 10,
  padding: "12px 14px",
  boxShadow: `0 0 0 1px ${colors.border}`,
};

export const sectionTitle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
  fontSize: 12,
  fontWeight: 600,
  color: colors.text,
};

export const sectionIcon: CSSProperties = {
  width: 14,
  height: 14,
  color: colors.textTertiary,
};
