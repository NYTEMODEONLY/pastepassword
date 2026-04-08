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
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
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
