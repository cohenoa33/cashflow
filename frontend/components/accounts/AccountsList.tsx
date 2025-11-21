"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/types/api";
import { handleError } from "@/lib/error";

export default function AccountsList() {
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
  if (err) return <p className="text-red-600">{err}</p>;

  if (items.length === 0) {
    return <p className="text-gray-500">No accounts yet.</p>;
  }

  return (
    <ul className="divide-y rounded-xl border">
      {items.map((a) => (
        <li key={a.id} className="flex items-center justify-between p-4">
          <div>
            <div className="font-medium">{a.name}</div>
            <div className="text-sm text-gray-500">
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
  );
}
