"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import TransactionsList from "@/components/transactions/TransactionsList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import EditAccountForm from "@/components/accounts/EditAccountForm";
import DeleteAccountButton from "@/components/accounts/DeleteAccountButton";
import PopupModal from "@/components/ui/Modal";
import AccountBalanceChart from "@/components/accounts/AccountBalanceChart";
import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";

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
  forecastBalance: number | string;
  transactions: Tx[];
};

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const accountId = Number(params.id);

  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

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
      <NavBar />
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {account ? account.name : "Account"}
          </h1>
        </header>

        {loading && <p>Loading…</p>}
        {err && <p className="text-red-600">{err}</p>}

        {account && (
          <section className="space-y-6">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Current:{" "}
                  {formatCurrency(
                    Number(account.currentBalance ?? 0),
                    account.currency
                  )}{" "}
                  • Forecast:{" "}
                  {formatCurrency(
                    Number(account.forecastBalance ?? 0),
                    account.currency
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => setIsEditOpen(true)}>
                  Edit Account
                </Button>

                <DeleteAccountButton id={account.id} />
              </div>
            </header>
            <AccountBalanceChart
              accountId={account.id}
              refreshKey={refreshKey}
            />
            {isEditOpen && (
              <PopupModal
                label="Edit Account"
                close={() => setIsEditOpen(false)}
              >
                <EditAccountForm
                  account={{
                    id: account.id,
                    name: account.name,
                    currency: account.currency,
                    description: account.description,
                    notes: account.notes
                  }}
                  onSaved={() => {
                    // refresh data and close modal after successful save
                    setRefreshKey((k) => k + 1);
                    setIsEditOpen(false);
                  }}
                  close={() => setIsEditOpen(false)}
                />
              </PopupModal>
            )}
          </section>
        )}

        {isAddOpen && (
          <PopupModal label="Add Transaction" close={() => setIsAddOpen(false)}>
            <AddTransactionForm
              accountId={accountId}
              onCreated={() => {
                setIsAddOpen(false);
                setRefreshKey((k) => k + 1);
              }}
              close={() => setIsAddOpen(false)}
            />
          </PopupModal>
        )}

        {/* Add transaction button + modal */}
        <div className="flex justify-end">
          <Button onClick={() => setIsAddOpen(true)}>Add Transaction</Button>
        </div>

        <TransactionsList
          key={refreshKey}
          accountId={accountId}
          currency={account?.currency || "USD"}
        />
      </main>
    </RequireAuth>
  );
}
