import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Eye } from "lucide-react";
import { FONT } from "../../lib/styles";

export function SetupScreen() {
  const { setup, error, loading } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localErr, setLocalErr] = useState("");
  const [pwFocus, setPwFocus] = useState(false);
  const [cfFocus, setCfFocus] = useState(false);

  const strength = getStrength(password);
  const sColor = ["", "#e5484d", "#e5a000", "#30a46c", "#30a46c"][strength];
  const sLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLocalErr("");
    if (password.length < 8) { setLocalErr("At least 8 characters required"); return; }
    if (password !== confirm) { setLocalErr("Passwords don't match"); return; }
    await setup(password);
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%", height: 44, borderRadius: 10,
    border: "none",
    background: "rgba(255,255,255,0.04)",
    boxShadow: focused
      ? "0 0 0 1px #7B45C1, 0 0 0 4px rgba(123,69,193,0.1)"
      : "0 0 0 1px rgba(255,255,255,0.08)",
    color: "#f7f8f8", fontSize: 14, fontWeight: 500,
    padding: "0 44px 0 16px",
    outline: "none", fontFamily: FONT,
    transition: "box-shadow 0.15s",
  });

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse 600px 500px at 50% 35%, #13141a 0%, #08090a 100%)",
    }}>
      <div style={{ width: 360, animation: "fade-in 0.3s ease-out both" }}>
        {/* Icon */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: "linear-gradient(145deg, #1a1b22 0%, #141518 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(123,69,193,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <img src="/app-icon.png" width="48" height="48" alt="PastePassword" style={{ borderRadius: 10 }} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#f7f8f8", letterSpacing: "-0.4px" }}>PastePassword</h1>
          <p style={{ fontSize: 13, color: "#8a8f98", marginTop: 4 }}>Create a master password to secure your vault</p>
        </div>

        {/* Form Card */}
        <div style={{
          background: "linear-gradient(180deg, #16171c 0%, #131418 100%)",
          borderRadius: 14, padding: 20,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}>
          <form onSubmit={handleSubmit}>
            {/* Password */}
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: "#8a8f98", display: "block", marginBottom: 6 }}>Master password</label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocus(true)} onBlur={() => setPwFocus(false)}
                  placeholder="Choose a strong password" autoFocus style={inputStyle(pwFocus)} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, display: "flex",
                }}><Eye style={{ width: 16, height: 16 }} /></button>
              </div>
              {password && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div style={{ display: "flex", flex: 1, gap: 3 }}>
                    {[1,2,3,4].map((l) => (
                      <div key={l} style={{
                        height: 3, flex: 1, borderRadius: 2,
                        background: strength >= l ? sColor : "rgba(255,255,255,0.06)",
                        transition: "background 0.2s",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: sColor }}>{sLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 16, marginTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: "#8a8f98", display: "block", marginBottom: 6 }}>Confirm password</label>
              <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                onFocus={() => setCfFocus(true)} onBlur={() => setCfFocus(false)}
                placeholder="Repeat your password" style={{ ...inputStyle(cfFocus), paddingRight: 16 }} />
              {confirm && password && confirm !== password && (
                <p style={{ fontSize: 11, color: "#e5484d", marginTop: 6 }}>Passwords don't match</p>
              )}
            </div>

            {(localErr || error) && <p style={{ fontSize: 12, color: "#e5484d", marginBottom: 12 }}>{localErr || error}</p>}

            <button type="submit" disabled={loading || !password || !confirm} style={{
              width: "100%", height: 44, borderRadius: 10,
              background: loading || !password || !confirm ? "#4a2d6e" : "linear-gradient(180deg, #8F5CD4 0%, #6937A5 100%)",
              color: "#fff", fontSize: 14, fontWeight: 600,
              border: "none", cursor: loading || !password || !confirm ? "not-allowed" : "pointer",
              opacity: loading || !password || !confirm ? 0.5 : 1,
              boxShadow: loading || !password || !confirm ? "none" : "0 1px 3px rgba(123,69,193,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
              fontFamily: FONT, transition: "all 0.15s",
            }}>
              {loading ? "Creating vault..." : "Create Vault"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: "#6b7280", marginTop: 16, lineHeight: 1.6 }}>
          Encrypted locally with AES-256 · Cannot be recovered if lost
        </p>
      </div>
    </div>
  );
}

function getStrength(p: string): number {
  if (!p) return 0; let s = 0;
  if (p.length >= 8) s++; if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
