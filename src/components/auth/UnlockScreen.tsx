import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Lock, Eye, EyeOff } from "lucide-react";

export function UnlockScreen() {
  const { unlock, error, loading } = useAuthStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    const success = await unlock(password);
    if (!success) {
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className={`w-full max-w-sm px-8 ${shaking ? "animate-shake" : ""}`}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-secondary">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-text">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Enter your master password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-3 pr-10 text-text outline-none transition focus:border-border-focus"
              placeholder="Master password"
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

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg bg-accent py-3 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
