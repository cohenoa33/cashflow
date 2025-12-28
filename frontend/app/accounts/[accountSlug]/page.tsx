"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { handleError } from "@/lib/error";
import EditAccountForm from "@/components/accounts/EditAccountForm";
import AccountView from "@/components/accounts/AccountView";
import type { AccountDetail } from "@/types/api";
import AppShell from "@/components/layout/AppShell";

type Mode = "view" | "edit";

export default function AccountDetailPage() {
  const params = useParams<{ accountSlug: string }>();
  const router = useRouter();

  const slug = params.accountSlug;
  const [idPart] = slug.split("-");
  const accountId = Number(idPart);

  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mode, setMode] = useState<Mode>("view");
  const [redirecting, setRedirecting] = useState(false);

  // Redirect immediately for invalid ID
  useEffect(() => {
    if (Number.isNaN(accountId)) {
      setRedirecting(true);
      router.replace("/accounts");
    }
  }, [accountId, router]);

  // Load account for valid ID
  useEffect(() => {
    if (!Number.isFinite(accountId) || redirecting) return;

    async function loadAccount() {
      setErr(null);
      setLoading(true);
      try {
        const data = await api<AccountDetail>(`/accounts/${accountId}`);
        setAccount(data);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          setRedirecting(true);
          router.replace("/accounts");
          return;
        }
        setErr(handleError(e, 3));
      } finally {
        setLoading(false);
      }
    }

    void loadAccount();
  }, [accountId, refreshKey, redirecting, router]);

  const bumpRefresh = () => {
    setRefreshKey((k) => k + 1);}

  // Quiet UI while redirecting
  if (redirecting) {
    return <AppShell></AppShell>;
  }

  // Initial load / error state when no account yet
  if (!account) {
    const message = loading ? "Loading..." : err || "Account not found";
    return (
      <AppShell>
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{message}</h1>
        </header>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header + top-level mode switch (View / Edit) */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{account.name}</h1>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className={
              mode === "view"
                ? "underline font-semibold"
                : "text-gray-500 hover:underline"
            }
            onClick={() => setMode("view")}
          >
            View
          </button>
          <span className="text-gray-400">|</span>
          <button
            type="button"
            className={
              mode === "edit"
                ? "underline font-semibold"
                : "text-gray-500 hover:underline"
            }
            onClick={() => setMode("edit")}
          >
            Edit
          </button>
        </div>
      </header>

      {mode === "view" && (
        <AccountView
          account={account}
          accountId={accountId}
          refreshKey={refreshKey}
          onRefresh={bumpRefresh}
        />
      )}

      {mode === "edit" && (
        <EditAccountForm
          account={{
            id: account.id,
            name: account.name,
            currency: account.currency,
            description: account.description,
            notes: account.notes
          }}
          onSaved={() => {
            bumpRefresh();
          }}
        />
      )}
    </AppShell>
  );
}
