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
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-md animate-fade-in px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text">PastePassword</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Create a master password to secure your vault
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-3 pr-10 text-text outline-none transition focus:border-border-focus"
                placeholder="Enter a strong password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        strength >= level
                          ? strength <= 1
                            ? "#ef4444"
                            : strength <= 2
                              ? "#f59e0b"
                              : "#22c55e"
                          : "#2a2a3a",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-3 text-text outline-none transition focus:border-border-focus"
              placeholder="Confirm your password"
            />
          </div>

          {(localError || error) && (
            <p className="text-sm text-danger">{localError || error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full rounded-lg bg-accent py-3 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Creating vault..." : "Create Vault"}
          </button>

          <p className="text-center text-xs text-text-muted">
            Your vault is encrypted locally. If you forget this password, your
            data cannot be recovered.
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
