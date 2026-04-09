import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Eye, EyeOff } from "lucide-react";
import { FONT } from "../../lib/styles";

export function UnlockScreen() {
  const { unlock, error, loading } = useAuthStore();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    const ok = await unlock(password);
    if (!ok) { setShake(true); setPassword(""); setTimeout(() => setShake(false), 400); }
  }

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse 600px 500px at 50% 35%, #13141a 0%, #08090a 100%)",
    }}>
      <div style={{
        width: 340,
        animation: shake ? "shake 0.3s ease" : "fade-in 0.3s ease-out both",
      }}>
        {/* Lock Icon */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: "linear-gradient(145deg, #1a1b22 0%, #141518 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(108,111,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6c6fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#f7f8f8", letterSpacing: "-0.4px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: "#62666d", marginTop: 4 }}>
            Enter your master password
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: "linear-gradient(180deg, #16171c 0%, #131418 100%)",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}>
          <form onSubmit={handleSubmit}>
            {/* Password Input */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Master password"
                autoFocus
                style={{
                  width: "100%", height: 44, borderRadius: 10,
                  border: "none",
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: focused
                    ? "0 0 0 1px #6c6fff, 0 0 0 4px rgba(108,111,255,0.1)"
                    : "0 0 0 1px rgba(255,255,255,0.08)",
                  color: "#f7f8f8", fontSize: 14, fontWeight: 500,
                  padding: "0 44px 0 16px",
                  outline: "none",
                  fontFamily: FONT,
                  transition: "box-shadow 0.15s",
                }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#4a4a5a", padding: 4,
                display: "flex", alignItems: "center",
              }}>
                {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: "#e5484d", marginBottom: 12 }}>{error}</p>
            )}

            {/* Unlock Button */}
            <button type="submit" disabled={loading || !password} style={{
              width: "100%", height: 44, borderRadius: 10,
              background: loading || !password ? "#3a3c70" : "linear-gradient(180deg, #7275ff 0%, #5c5fef 100%)",
              color: "#fff", fontSize: 14, fontWeight: 600,
              border: "none", cursor: loading || !password ? "not-allowed" : "pointer",
              opacity: loading || !password ? 0.5 : 1,
              boxShadow: loading || !password ? "none" : "0 1px 3px rgba(108,111,255,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
              transition: "all 0.15s",
              fontFamily: FONT,
            }}>
              {loading ? "Unlocking..." : "Unlock"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 10, color: "#3a3a4a", marginTop: 20 }}>
          PastePassword · v0.1.0
        </p>
      </div>
    </div>
  );
}
