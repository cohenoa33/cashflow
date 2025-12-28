"use client";

import AppShell from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/types/api";
import { handleError } from "@/lib/error";

import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";
import { accountUrl } from "@/lib/slug";
import AccountsOverviewChart from "@/components/accounts/AccountsOverviewChart";

export default function AccountsPage() {

  const router = useRouter();
  const [items, setItems] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await api<Account[]>("/accounts");
      setItems(res);
    } catch (error: unknown) {
      setErr(handleError(error, 3))
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  
  if (loading) return <p>Loading…</p>;
  if (err) return <p className="text-danger">{err}</p>;
  
  if (items.length === 0) {
    return    <div>
      <div className="flex items-center mt-4">
        <Button onClick={()=>{
          router.push("/accounts/add")
        }} className="ml-auto">
          Add Account
        </Button>
      </div>
        <div> No accounts yet</div>

    </div>;
  }
  return (
   <AppShell  >
      
       <>
            <AccountsOverviewChart
              accounts={items.map((a) => ({
                id: a.id,
                name: a.name,
                currency: a.currency,
                dailySeries: a?.dailySeries||[],
                currentBalance: Number(a.currentBalance ?? 0),
                forecastBalance:
                  a.forecastBalance !== undefined
                    ? Number(a.forecastBalance)
                    : undefined
              }))}
            />
            <div className="flex flex-col">
              <div className="flex items-center mt-4">
                <Button onClick={()=>{
                  router.push("/accounts/add")
                }} className="ml-auto">
                  Add Account
                </Button>
              </div>
      
              <ul className="divide-y rounded-xl border mt-4">
                {items.map((a) => (
                  <li key={a.id} className="flex items-center justify-between p-4 ">
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-sm text-primary">
                        Current:{" "}
                        {formatCurrency(Number(a.currentBalance ?? 0), a.currency)} •
                        Forecast:{" "}
                        {formatCurrency(Number(a.forecastBalance ?? 0), a.currency)}
                      </div>
                    </div>
                    <a
                      className="text-sm underline"
                      href={accountUrl(a.id, a.name)}
                      title="View account"
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        </AppShell>
    );
}
