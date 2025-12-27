"use client";

import AccountsList from "@/components/accounts/AccountsList";
import CreateAccountForm from "@/components/accounts/CreateAccountForm";
import { useEffect, useState } from "react";
import PopupModal from "@/components/ui/Modal";
import AppShell from "@/components/layout/AppShell";


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
   <AppShell  >
        {isCreateOpen && (
          <PopupModal label="Add Account" close={() => setIsCreateOpen(false)}>
            <CreateAccountForm
              onCreated={handleCreated}
              close={() => setIsCreateOpen(false)}
            />
          </PopupModal>
        )}
        <div className="flex justify-end"></div>
        <div key={refreshKey}>
          <AccountsList openPopup={() => setIsCreateOpen(true)} />
        </div>
      </AppShell>
  );
}
