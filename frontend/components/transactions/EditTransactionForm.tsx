"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import { dateAtTenAMLocal, getTodayDateString } from "@/lib/date";
import Button from "@/components/ui/Button";
import { Tx } from "@/types/api";
import { getAmountInputValue, getAmountKeyDownValue } from "@/lib/amount";
import CategoryInput from "./CategoryInput";
import { INCOME_CATEGORIES, SPENDING_CATEGORIES } from "@/lib/categories";

export default function EditTransactionForm({
  tx,
  accountId,
  onCreated,
  close
}: {
  accountId: number;
  tx: Tx;
  onCreated: (txs: Tx[]) => void;
  close: () => void;
}) {
  const [amount, setAmount] = useState<string>(tx.amount.toString());
  const [description, setDescription] = useState(tx.description || "");
  const [category, setCategory] = useState(tx.category || "");
  const [date, setDate] = useState<string>(getTodayDateString(tx.date));
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(
    busy ||
      !amount ||
      Number(amount) === 0 ||
      !category ||
      !description ||
      !date
  );

    const [categories, setCategories] = useState<Set<string>>(
      new Set([...SPENDING_CATEGORIES, ...INCOME_CATEGORIES])
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
    if (disabled) return;
    try {
      setBusy(true);
      setErr(null);

      await api(`/transactions/${tx.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          amount: Number(amount),
          category: category || undefined,
          description: description || undefined,
          date: dateAtTenAMLocal(date) // normalize to 10:00 local
        })
      });

      // refresh list (simple approach)
      const res = await api<Tx[]>(`/transactions/by-account/${accountId}`);
      onCreated(res);
    } catch (e) {
      setErr(handleError(e, 4));
    } finally {
      close();
    }
  }

  async function remove() {
    if (!confirm("Delete this transaction?")) return;
    if(busy) return;
    try {
      setBusy(true);
      setErr(null);
      await api(`/transactions/${tx.id}`, { method: "DELETE" });
      // refresh list (simple approach)
      const res = await api<Tx[]>(`/transactions/by-account/${accountId}`);
      onCreated(res);
    } catch (e) {
      setErr(handleError(e, 4));
    } finally {
     close();
    }
  }

   function addCategoryToSuggestions(value: string) {
     const trimmed = value.trim();

     if (!trimmed) return;

     setCategories((prev) => {
       if (prev.has(trimmed)) return prev;
       const next = new Set(prev);

       next.add(trimmed);
       return next;
     });
   }
  return (
    <section className="space-y-6">
      {/* Box 1: */}
      <div className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold">Transaction information</h2>

        {/* Thin divider line, then content */}
        <div className="mt-4 border-t border-slate-200 pt-4 space-y-4"></div>
        <form onSubmit={onSubmit} className="">
          <div className="grid grid-cols-2 gap-3 mt-2 mb-2 ">
            {/* Date row */}
            <div>
              <label className="block text-sm font-medium">Date:</label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="w-full sm:max-w-sm rounded-lg border p-2 text-sm outline-none"
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

            {/* Amount row */}
            <div>
              <label className="block text-sm font-medium">Amount:</label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="w-full sm:max-w-sm rounded-lg border p-2 text-sm outline-none"
                  value={amount}
                  type="text"
                  inputMode="decimal"
                  maxLength={15}
                  onChange={(e) => {
                    const v = e.target.value;
                    const newValue = getAmountInputValue(v);
                    if (newValue !== undefined) {
                      setAmount(newValue);
                    }
                  }}
                  onKeyDown={(e) => {
                    const key = e.key;
                    if (
                      key === "ArrowUp" ||
                      key === "ArrowDown" ||
                      key === "Backspace"
                    ) {
                      e.preventDefault();
                      const newValue = getAmountKeyDownValue(
                        key as "ArrowUp" | "ArrowDown" | "Backspace",
                        amount
                      );
                      if (newValue !== undefined) {
                        setAmount(newValue);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2 mb-2 ">
            {/* Description row */}
            <div>
              <label className="block text-sm font-medium">Description:</label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="w-full sm:max-w-sm rounded-lg border p-2 text-sm outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Groceries, Coffee…"
                />
              </div>
            </div>
            {/* Category row */}
            <div>
              <label className="block text-sm font-medium">Category:</label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* <input
                  className="w-full sm:max-w-sm rounded-lg border p-2 text-sm outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Food / Salary / Fees"
                  required
                /> */}
                <CategoryInput
                  value={category}
                  onChange={(v) => setCategory(v)}
                  className={[
                    "w-full sm:max-w-sm rounded-lg border p-2 text-sm outline-none"
                  ]}
                  onPick={(v) => {
                    addCategoryToSuggestions(v);
                  }}
                  options={[...categories]}
                />
              </div>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex justify-center mt-4">
            <Button
              disabled={busy}
              type="submit"
              className="w-1/2 min-w-[200px]"
            >
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
      <div className="rounded-md border border-red-200 bg-red-50 p-6">
        <div className="gap-4 md:flex-row md:items-center md:justify-between">
          <div className="md:w-2/3">
            <h2 className="text-base font-semibold text-danger">
              Delete account
            </h2>
            <p className="mt-1 text-sm text-danger">
              Delete this account. Once you delete an account, there is no going
              back. Please be certain.
            </p>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={remove}
              disabled={busy}
              className="w-1/2 min-w-[200px]"
              variant="danger"
            >
              I want to delete this account{" "}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
