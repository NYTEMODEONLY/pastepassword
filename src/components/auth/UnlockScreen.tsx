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
    <div className="noise-bg flex h-screen items-center justify-center bg-bg">
      <div className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-accent/5 blur-[100px]" />

      <div
        className={`relative w-full max-w-sm px-8 ${shaking ? "animate-shake" : "animate-fade-in"}`}
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-bg-secondary shadow-lg shadow-black/20">
            <Lock className="h-9 w-9 text-accent" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Enter your master password to unlock
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3.5 pr-10 text-text outline-none transition-all duration-200 placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent/30"
              placeholder="Master password"
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

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger-subtle px-4 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-accent py-3.5 font-medium text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
