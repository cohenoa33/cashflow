"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";

type EditableAccount = {
  id: number;
  name: string;
  currency: string;
  description?: string | null;
  notes?: string | null;
};

export default function EditAccountForm({
  account,
  onSaved
}: {
  account: EditableAccount;
  onSaved?: (updated: EditableAccount) => void;
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
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="USD"
          />
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

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
