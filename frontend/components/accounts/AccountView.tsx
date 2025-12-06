"use client";

import { useState } from "react";
import PopupModal from "@/components/ui/Modal";
import AccountBalanceChart from "@/components/accounts/AccountBalanceChart";
import TransactionsList from "@/components/transactions/TransactionsList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import ImportTransactions from "@/components/transactions/ImportTransactions";
import { formatCurrency } from "@/lib/currency";
import type { AccountDetail } from "@/types/api";


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
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleImported = () => {
    setIsImportOpen(false);
    onRefresh();
  };

  return (
    <section className="space-y-6">
      {/* Top row: balances + actions */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
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


   
          <AccountBalanceChart accountId={account.id} refreshKey={refreshKey} />

          {/* Add transaction modal */}
          {isAddOpen && (
            <PopupModal
              label="Add Transaction"
              close={() => setIsAddOpen(false)}
            >
              <AddTransactionForm
                accountId={accountId}
                onCreated={() => {
                  setIsAddOpen(false);
                  onRefresh();
                }}
              />
            </PopupModal>
          )}
          {/* Add transaction modal */}
          {isImportOpen && (
            <PopupModal
              label="Add Transaction"
              close={() => setIsImportOpen(false)}
            >
              <ImportTransactions
                accountId={account.id}
                onComplete={handleImported}
              />
            </PopupModal>
          )}

          <TransactionsList
            key={refreshKey}
            accountId={accountId}
            currency={account.currency}
            setIsImportOpen={setIsImportOpen}
            setIsAddOpen={setIsAddOpen}
          />

      
    </section>
  );
}
