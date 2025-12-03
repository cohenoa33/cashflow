"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import { CurrencyList } from "@/lib/currency";

type EditableAccount = {
  id: number;
  name: string;
  currency: string;
  description?: string | null;
  notes?: string | null;
};

export default function EditAccountForm({
  account,
  onSaved,
  close
}: {
  account: EditableAccount;
  onSaved?: (updated: EditableAccount) => void;
  close: () => void;
}) {
  const [name, setName] = useState(account.name);
  const [currency, setCurrency] = useState(account.currency ?? "USD");
  const [description, setDescription] = useState(account.description ?? "");
  const [notes, setNotes] = useState(account.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const updated = await api<EditableAccount>(`/accounts/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          currency,
          description: description || null,
          notes: notes || null
        })
      });
      onSaved?.(updated);
    } catch (e) {
      setErr(handleError(e, 3));
    } finally {
      setBusy(false);
    }
  }

  const currencyInList = CurrencyList.some((c) => c.code === currency);

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Name</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm">Currency</label>
          <select
            className="mt-1 w-full rounded-lg border p-2 bg-white"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {/* If an existing account has a non-standard currency, still show it */}
            {!currencyInList && currency && (
              <option value={currency}>{currency}</option>
            )}
            {CurrencyList.map((c) => (
              <option key={c.code} value={c.code}>
             {c.name} ({c.symbol} {c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm">Description</label>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Account description"
        />
      </div>

      <div>
        <label className="text-sm">Notes</label>
        <textarea
          className="mt-1 w-full rounded-lg border p-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes…"
        />
      </div>

      {err && <p className="text-sm text-danger">{err}</p>}

      <Button disabled={busy} type="submit" className="w-full text-base">
        {busy ? "Saving…" : "Save Changes"}
      </Button>

      <Button
        type="button"
        onClick={close}
        className="w-full mt-2"
        variant="accent"
      >
        Cancel
      </Button>
    </form>
  );
}
