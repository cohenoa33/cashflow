"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import { dateAtTenAMLocal, getTodayDateString } from "@/lib/date";

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
  const [date, setDate] = useState<string>(getTodayDateString())
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(
    busy ||
    !amount ||
    Number(amount) === 0 ||
    !category ||
    !description ||
    !date
  );

  // Update disabled state when relevant inputs change
  useEffect(() => {
    setDisabled(
      busy ||
      !amount ||
      Number(amount) === 0 ||
      !category ||
      !description ||
      !date
    );
  }, [busy, amount, category, description, date]);
  const [err, setErr] = useState<string | null>(null);


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
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm">Amount</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="00.00"
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
            onFocus={() => {
              if (!date) {
                setDate(getTodayDateString());
              }
            }}
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
            required
          />
        </div>
        <div>
          <label className="text-sm">Description</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Groceries, Coffee…"
            required
          />
        </div>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={disabled}
        className={`inline-flex items-center rounded-md px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled
            ? "bg-blue-300 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {busy ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
