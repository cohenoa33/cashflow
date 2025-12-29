"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import { dateAtTenAMLocal, getTodayDateString } from "@/lib/date";
import Button from "@/components/ui/Button";
import { INCOME_CATEGORIES, SPENDING_CATEGORIES } from "@/lib/categories";
import { getAmountInputValue, getAmountKeyDownValue } from "@/lib/amount";
import CategoryInput from "./CategoryInput";

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
      const [categories, setCategories] = useState<Set<string>>(
        new Set([...SPENDING_CATEGORIES, ...INCOME_CATEGORIES])
      );
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
    <section className="space-y-6">
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
                <CategoryInput
                  value={category}
                  onChange={(v) => setCategory(v)}
                  className={[
                    "w-full sm:max-w-sm rounded-lg border p-2 text-sm outline-none"
                  ]}
                  onPick={(v) => {
                    const trimmed = v.trim();
                    if (!trimmed) return;
                    setCategories((prev) => {
                      if (prev.has(trimmed)) return prev;
                      const next = new Set(prev);

                      next.add(trimmed);
                      return next;
                    });
                  }}
                  options={[...categories]}
                />
              </div>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex justify-center mt-4">
            <Button
              disabled={busy || disabled}
              type="submit"
              className="w-1/2 min-w-[200px]"
            >
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
