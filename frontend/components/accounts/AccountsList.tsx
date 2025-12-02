"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/types/api";
import { handleError } from "@/lib/error";
import AccountsOverviewChart from "./AccountsOverviewChart";
import Button from "@/components/ui/Button";
export default function AccountsList({openPopup}:{openPopup:()=>void}) {
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
        <Button onClick={openPopup} className="ml-auto">
          Add Account
        </Button>
      </div>
        <div> No accounts yet</div>

    </div>;
  }

  return (
    <>
      <AccountsOverviewChart
        accounts={items.map((a) => ({
          id: a.id,
          name: a.name,
          currentBalance: Number(a.currentBalance ?? 0),
          forecastBalance:
            a.forecastBalance !== undefined
              ? Number(a.forecastBalance)
              : undefined
        }))}
      />
      <div className="flex flex-col">
        <div className="flex items-center mt-4">
          <Button onClick={openPopup} className="ml-auto">
            Add Account
          </Button>
        </div>

        <ul className="divide-y rounded-xl border mt-4">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between p-4 ">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-primary">
                  {a.currency} • Current: {String(a.currentBalance)} • Forecast:{" "}
                  {String(a.forecastBalance)}
                </div>
              </div>
              <a
                className="text-sm underline"
                href={`/accounts/${a.id}`}
                title="View account"
              >
                Open
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
