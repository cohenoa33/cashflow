"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Link from "next/link";
import TransactionsList from "@/components/transactions/TransactionsList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import EditAccountForm from "@/components/accounts/EditAccountForm";
import DeleteAccountButton from "@/components/accounts/DeleteAccountButton";


type Tx = {
  id: number;
  amount: number | string;
  type: string;
  description?: string | null;
  category?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  accountId: number;
};

type AccountDetail = {
  id: number;
  name: string;
  currency: string;
  description?: string | null;
  notes?: string | null;
  startingBalance: number | string;
  currentBalance: number | string;
  transactions: Tx[];
};

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const accountId = Number(params.id);

  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);


useEffect(() => {
  async function loadAccount() {
    setErr(null);
    setLoading(true);
    try {
      const data = await api<AccountDetail>(`/accounts/${accountId}`);
      setAccount(data);
    } catch (e) {
      setErr(handleError(e, 3));
    } finally {
      setLoading(false);
    }
  }

  if (Number.isFinite(accountId)) loadAccount();
}, [accountId, refreshKey]);

  return (
    <RequireAuth>
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {account ? account.name : "Account"}
          </h1>
          <Link href="/accounts" className="text-sm underline">
            Back to Accounts
          </Link>
        </header>

        {loading && <p>Loading…</p>}
        {err && <p className="text-red-600">{err}</p>}

        {account && (
          <section className="space-y-6">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{account.name}</h1>
                <p className="text-sm text-gray-600">
                  Currency: {account.currency} • Starting:{" "}
                  {String(account.startingBalance)} • Current:{" "}
                  {String(account.currentBalance)}
                </p>
              </div>
              <DeleteAccountButton id={account.id} />
            </header>

            <EditAccountForm
              account={{
                id: account.id,
                name: account.name,
                currency: account.currency,
                description: account.description,
                notes: account.notes
              }}
              onSaved={() => setRefreshKey((k) => k + 1)}
            />
          </section>
        )}
        <AddTransactionForm
          accountId={accountId}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />

        <TransactionsList key={refreshKey} accountId={accountId} />
      </main>
    </RequireAuth>
  );
}
