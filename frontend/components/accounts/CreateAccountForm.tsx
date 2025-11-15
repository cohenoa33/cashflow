"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/types/api";
import { handleError } from "@/lib/error";

type Props = { onCreated?: (a: Account) => void };

export default function CreateAccountForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [startingBalance, setStartingBalance] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            startingBalance === "" ? undefined : Number(startingBalance)
        })
      });
      onCreated?.(account);
      // reset form
      setName("");
      setCurrency("USD");
      setStartingBalance("");
      setDescription("");
      setNotes("");
    } catch (error: unknown) {
      setErr(handleError(error, 2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl p-4">
      <div>
        <label className="text-sm">Name</label>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Main / Savings"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Currency</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="USD"
          />
        </div>
        <div>
          <label className="text-sm">Starting balance</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="number"
            step="0.01"
            value={startingBalance}
            onChange={(e) =>
              setStartingBalance(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="text-sm">Description</label>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Personal checking"
        />
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

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {busy ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
