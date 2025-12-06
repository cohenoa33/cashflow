"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import { dateAtTenAMLocal, getTodayDateString } from "@/lib/date";
import Button from "@/components/ui/Button";

export default function AddTransactionForm({
  accountId,
  onCreated,
}: {
  accountId: number;
  onCreated?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
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
    const type = Number(amount) >= 0 ? "income" : "expense";
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
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl  p-4">
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
      <Button disabled={disabled} type="submit" className="w-full text-base">
        {busy ? "Adding…" : "Add"}
      </Button>
    </form>
  );
}
