"use client";

import RequireAuth from "@/components/RequireAuth";
import AccountsList from "@/components/accounts/AccountsList";
import CreateAccountForm from "@/components/accounts/CreateAccountForm";
import { useEffect, useState } from "react";
import PopupModal from "@/components/ui/Modal";
import NavBar from "@/components/NavBar";

export default function AccountsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  function handleCreated() {
    setRefreshKey((k) => k + 1);
    setIsCreateOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsCreateOpen(false);
    }
    if (isCreateOpen) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCreateOpen]);

  return (
    <RequireAuth>
      <NavBar />
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create account
        </button>

        {isCreateOpen && (
          <PopupModal
            label="Create account"
            close={() => setIsCreateOpen(false)}
          >
            <CreateAccountForm onCreated={handleCreated} />
          </PopupModal>
        )}
        <div key={refreshKey}>
          <AccountsList />
        </div>
      </main>
    </RequireAuth>
  );
}
