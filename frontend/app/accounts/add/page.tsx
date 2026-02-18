"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import type { Account } from "@/types/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import { CurrencyList } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { accountUrl } from "@/lib/slug";
import { getAmountInputValue, getAmountKeyDownValue } from "@/lib/amount";

export default function AddAccountPage() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [startingBalance, setStartingBalance] = useState<string>("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  

  const [nameInvalid, setNameInvalid] = useState(false);
  const [numberInvalid, setNumberInvalid] = useState(false);  

  useEffect(() => {
    setNameInvalid(name.trim().length < 2);
  }, [name]);

  useEffect(() => {
    const num = Number(startingBalance);
    setNumberInvalid(
      startingBalance !== "" &&
        startingBalance !== "-" &&
        startingBalance !== "." &&
        Number.isNaN(num)
    );
  }, [startingBalance]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nameInvalid || numberInvalid) {
      return;
    }
  
    setErr(null);
    setBusy(true);
    try {
      const account = await api<Account>("/accounts", {
        method: "POST",
        body: JSON.stringify({
          name,
          currency,
          description: description || undefined,
          notes: notes || undefined,
          startingBalance:
            startingBalance === "" ||
            startingBalance === "-" ||
            startingBalance === "."
              ? undefined
              : Number(startingBalance)
        })
      });
      if (account.id && account.name) {
        router.push(accountUrl(account.id, account.name));
      } else {
        setErr(handleError("Failed to create account", 2));
      }
    } catch (error: unknown) {
      setErr(handleError(error, 2));
    } finally {
      setBusy(false);
    }
  }


  return (
    <AppShell>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Account</h1>
        <button
          type="button"
          aria-label="Close"
          onClick={() => router.push("/accounts")}
          className="rounded-md p-1 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </header>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl p-4">
        <div>
          <label className="text-sm">Name</label>
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. personal / savings"
              required
              className={`mt-1 w-full rounded-lg border p-2 outline-none  ${
                nameInvalid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300"
              }`}
            />
            {nameInvalid && (
              <p className="text-xs text-red-600 mt-1">
                Account name is required.
              </p>
            )}
          </>
        </div>

        <div>
          <label className="text-sm">Description</label>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="optional, account no. 1234 "
            className={`mt-1 w-full rounded-lg border p-2 outline-none border-slate-300 `}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Currency</label>

            <select
              className="mt-1 w-full rounded-lg border outline-none p-2 bg-white"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CurrencyList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Initial Deposit</label>
            <input
              className="mt-1 w-full rounded-lg border p-2 outline-none border-slate-300 "
              type="text"
              inputMode="decimal"
              value={startingBalance}
              maxLength={15}
              onChange={(e) => {
                const v = e.target.value;
                const newValue = getAmountInputValue(v);
                if (newValue !== undefined) {
                  setStartingBalance(newValue);
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
                    startingBalance
                  );
                  if (newValue !== undefined) {
                    setStartingBalance(newValue);
                  }
                }
              }}
              placeholder="0.00"
            />
          </div>
          {numberInvalid && (
            <p className="text-xs text-red-600 mt-1">
              number is required. {startingBalance}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm">Notes</label>
          <textarea
            className="mt-1 w-full rounded-lg border p-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any details…"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex justify-center m-4">
          <Button disabled={busy} type="submit" className="w-1/2 min-w-[200px]">
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
