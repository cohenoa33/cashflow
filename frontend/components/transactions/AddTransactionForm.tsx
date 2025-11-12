"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";

export default function AddTransactionForm({
  accountId,
  onCreated
}: {
  accountId: number;
  onCreated?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState("EXPENSE");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function dateAtTenAMLocal(d: string): string | undefined {
    if (!d) return undefined;
    const [y, m, day] = d.split("-").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, day ?? 1, 10, 0, 0, 0);
    return dt.toISOString();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api(`/transactions`, {
        method: "POST",
        body: JSON.stringify({
          accountId,
          amount: Number(amount),
          type,
          description: description || undefined,
          category: category || undefined,
          date: dateAtTenAMLocal(date)
        })
      });
      setAmount("");
      setType("EXPENSE");
      setDescription("");
      setCategory("");
      setDate("");
      onCreated?.();
    } catch (e) {
      setErr(handleError(e, 4));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">Add transaction</h2>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm">Amount</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="-45.50"
            required
          />
        </div>
        <div>
          <label className="text-sm">Type</label>
          <select
            className="mt-1 w-full rounded-lg border p-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="EXPENSE">EXPENSE</option>
            <option value="INCOME">INCOME</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Date</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Category</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Food / Salary / Fees"
          />
        </div>
        <div>
          <label className="text-sm">Description</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Groceries, Coffee…"
          />
        </div>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {busy ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
