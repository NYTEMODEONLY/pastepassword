import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export function SetupScreen() {
  const { setup, error, loading } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e", "#22c55e"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords don't match");
      return;
    }

    await setup(password);
  }

  return (
    <div className="noise-bg flex h-screen items-center justify-center bg-bg">
      {/* Subtle gradient orb behind the card */}
      <div className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />

      <div className="relative w-full max-w-md animate-fade-in px-8">
        <div className="mb-10 text-center">
          <div className="animate-glow-pulse mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/20 bg-accent-subtle">
            <ShieldCheck className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            PastePassword
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Create a master password to protect your vault
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3.5 pr-10 text-text outline-none transition-all duration-200 placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent/30"
                placeholder="Enter a strong password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password && (
              <div className="mt-3 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          strength >= level ? strengthColor : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColor }}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3.5 text-text outline-none transition-all duration-200 placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent/30"
              placeholder="Confirm your password"
            />
            {confirm && password && confirm !== password && (
              <p className="mt-1.5 text-xs text-danger">Passwords don't match</p>
            )}
          </div>

          {(localError || error) && (
            <div className="rounded-lg border border-danger/20 bg-danger-subtle px-4 py-2.5 text-sm text-danger">
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full rounded-xl bg-accent py-3.5 font-medium text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? "Creating vault..." : "Create Vault"}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-text-muted">
            Your vault is encrypted locally with AES-256. If you forget this
            password, your data cannot be recovered.
          </p>
        </form>
      </div>
    </div>
  );
}

function getStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
