import { useEffect, useState } from "react";
import { useCredentialStore } from "../../stores/credentialStore";
import { Sidebar } from "./Sidebar";
import { CredentialList } from "../credentials/CredentialList";
import { CredentialDetail } from "../credentials/CredentialDetail";
import { QuickAddModal } from "../credentials/QuickAddModal";
import { SearchPalette } from "../search/SearchPalette";

export function MainLayout() {
  const { loadCredentials, loadTags, selectedId } = useCredentialStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadCredentials();
    loadTags();
  }, [loadCredentials, loadTags]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowQuickAdd(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar onQuickAdd={() => setShowQuickAdd(true)} />
      <CredentialList onQuickAdd={() => setShowQuickAdd(true)} />
      {selectedId && <CredentialDetail />}

      {showQuickAdd && (
        <QuickAddModal onClose={() => setShowQuickAdd(false)} />
      )}
      {showSearch && <SearchPalette onClose={() => setShowSearch(false)} />}
    </div>
  );
}
