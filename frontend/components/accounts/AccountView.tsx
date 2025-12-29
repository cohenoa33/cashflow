"use client";

import { useState } from "react";
import PopupModal from "@/components/ui/Modal";
import AccountBalanceChart from "@/components/accounts/AccountBalanceChart";
import TransactionsList from "@/components/transactions/TransactionsList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import { formatCurrency } from "@/lib/currency";
import type { AccountDetail, } from "@/types/api";


type AccountViewProps = {
  account: AccountDetail;
  accountId: number;
  refreshKey: number;
  onRefresh: () => void;
};

export default function AccountView({
  account,
  accountId,
  refreshKey,
  onRefresh
}: AccountViewProps) {


  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const notes = account.notes && account.notes.length > 0 ? account.notes : null;
  const description =
    account.description && account.description.length > 0
      ? account.description
      : null;

  return (
    <section className="space-y-6">
      {/* Top row: balances + actions */}
      <header className="flex items-center justify-between text-sm">
        <div>
          <p className="flex items-start gap-2">
           {description && <span>{description}</span>}
            {notes && (
              <button
                className="text-gray-500 underline "
                onClick={() => setIsNoteOpen(true)}
              >
              notes
              </button>
            )}
          </p>{" "}
          <p className="text-gray-600">
            Current{" "}
            {formatCurrency(
              Number(account.currentBalance ?? 0),
              account.currency
            )}{" "}
            • Forecast{" "}
            {formatCurrency(
              Number(account.forecastBalance ?? 0),
              account.currency
            )}
          </p>
        </div>
      </header>

      <AccountBalanceChart
        currency={account.currency}
        accountId={account.id}
        refreshKey={refreshKey}
      />

      {/* Add transaction modal */}
      {isAddOpen && (
        <PopupModal label="Add Transaction" close={() => setIsAddOpen(false)}>
          <AddTransactionForm
            accountId={accountId}
            onCreated={() => {
              setIsAddOpen(false);
              onRefresh();
            }}
          />
        </PopupModal>
      )}
      {/* note view modal */}
      {isNoteOpen && notes && (
        <PopupModal label={`Notes:`} close={() => setIsNoteOpen(false)}>
          <div className="prose max-h-[70vh] overflow-y-auto p-4">
            {notes.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </PopupModal>
      )}

      <TransactionsList
        key={refreshKey}
        accountId={accountId}
        currency={account.currency}
        setIsAddOpen={setIsAddOpen}
        onRefresh={onRefresh}
      />
    </section>
  );
}
