"use client";

import AppShell from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Account, AccountRow } from "@/types/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import AccountsOverviewTable from "@/components/accounts/AccountsOverviewTable";

export default function AccountsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    async function load() {
      setErr(null);
      setLoading(true);
      try {
        const res = await api<Account[]>("/accounts");
        setItems(makeAccountsList(res));
      } catch (error: unknown) {
        setErr(handleError(error, 3));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return<AppShell>
    <section >
        <div className="p-4 space-y-4  items-center mt-4">
          <div>Loading...</div>
        </div>
      </section>
      </AppShell>
    }
  
  if (err) {
     return (
       <AppShell>
         <section>
           <div className="p-4 space-y-4  items-center mt-4">
             <div className="text-danger">{err}</div>
           </div>
         </section>
       </AppShell>
     );
    }

  if (items.length === 0) {
    return (
      <AppShell>
        <section >
        <div className="p-4 space-y-4  items-center mt-4">
          <div>Click the button above to add your first account!</div>
          <div className="flex items-center mt-4">
            <Button
              onClick={() => {
                router.push("/accounts/add");
              }}
              className="ml-auto"
            >
              Add Account
            </Button>
          </div>
        </div>
      </section>
      </AppShell>
    );
  }

  function makeAccountsList(accounts: Account[]): AccountRow[] {
    return accounts.map((a) => {
      const current = Number(a.currentBalance ?? 0);
      const forecast = Number(a.forecastBalance ?? a.currentBalance ?? 0);
      return {
        id: a.id,
        name: a.name,
        currency: a.currency,
        currentBalance: current,
        description: a.description ?? "",
        forecastBalance: forecast,
        delta: forecast - current
      };
    });
  }
  return (
    <AppShell>
      <AccountsOverviewTable accounts={items} />
    </AppShell>
  );
}
