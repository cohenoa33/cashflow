"use client";

import RequireAuth from "@/components/RequireAuth";
import AccountsList from "@/components/accounts/AccountsList";
import Link from "next/link";
import CreateAccountForm from "@/components/accounts/CreateAccountForm";
import { useState } from "react";

export default function AccountsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreated() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <RequireAuth>
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <header className="flex items-center justify-between">
          <Link className="text-sm underline" href="/">
            Home
          </Link>
        </header>

        <CreateAccountForm onCreated={handleCreated} />
        <div key={refreshKey}>
          <AccountsList />
        </div>
      </main>
    </RequireAuth>
  );
}
