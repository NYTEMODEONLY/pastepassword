import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { SetupScreen } from "./components/auth/SetupScreen";
import { UnlockScreen } from "./components/auth/UnlockScreen";
import { MainLayout } from "./components/layout/MainLayout";

export default function App() {
  const { view, loading, checkVault } = useAuthStore();

  useEffect(() => {
    checkVault();
  }, [checkVault]);

  if (loading && view !== "main") {
    return (
      <div className="noise-bg flex h-screen items-center justify-center bg-bg">
        <div className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="relative flex flex-col items-center gap-4 animate-fade-in">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          <p className="text-sm text-text-muted">Loading vault...</p>
        </div>
      </div>
    );
  }

  switch (view) {
    case "setup":
      return <SetupScreen />;
    case "unlock":
      return <UnlockScreen />;
    case "main":
      return <MainLayout />;
  }
}
