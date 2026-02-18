"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { handleError } from "@/lib/error";
import type { AccountDetail } from "@/types/api";
import ImportTransactions from "@/components/transactions/ImportTransactions";
import AppShell from "@/components/layout/AppShell";


export default function AccountImportTransactionsPage() {
  const params = useParams<{ accountSlug: string }>();
  const router = useRouter();

  const slug = params.accountSlug;
  const [idPart] = slug.split("-");
  const accountId = Number(idPart);

  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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
  }, [accountId, redirecting, router]);



  // Quiet UI while redirecting
  if (redirecting) {
    return (
        <AppShell></AppShell>
    );
  }

  // Initial load / error state when no account yet
  if (!account ) {
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
        <h1
          className="text-2xl font-semibold"
          onClick={() => router.push(`/accounts/${slug}`)}
        >
          {account.name}
        </h1>
        <button
          type="button"
          aria-label="Close"
          onClick={() => router.push(`/accounts/${slug}`)}
          className="rounded-md p-1 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </header>
      <ImportTransactions
        accountId={account.id}
        onComplete={() => {
          router.push(`/accounts/${slug}`);
        }}
      />
    </AppShell>
  );
}
