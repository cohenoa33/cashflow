"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import { CurrencyList } from "@/lib/currency";
import DeleteAccountButton from "@/components/accounts/DeleteAccountButton";

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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currencyInList = CurrencyList.some((c) => c.code === currency);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccessMsg(null);
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
      setSuccessMsg("Account information saved successfully.");
    } catch (e) {
      setErr(handleError(e, 3));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Box 1: Account information (GitHub-style) */}
      <div className="rounded-md border border-slate-200 bg-white p-6">
        {/* Section title, like "General" / "Repository name" */}
        <h2 className="text-base font-semibold">Account information</h2>

        {/* Thin divider line, then content */}
        <div className="mt-4 border-t border-slate-200 pt-4 space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name row */}
            <div>
              <label className="block text-sm font-medium">Name</label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="w-full sm:max-w-sm rounded-lg border p-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Currency row */}
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <div className="mt-1 w-full sm:max-w-sm">
                <select
                  className="w-full rounded-lg border p-2 bg-white text-sm"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input
                className="mt-1 w-full rounded-lg border p-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Account description"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <textarea
                className="mt-1 w-full rounded-lg border p-2 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes…"
              />
            </div>

            {/* Status message inside the box */}
            {err && <p className="text-sm text-danger">{err}</p>}
            {successMsg && !err && (
              <p className="text-sm text-success">{successMsg}</p>
            )}

            {/* Actions row */}
            <div className="flex flex-wrap gap-2 justify-end">
              <Button disabled={busy} type="submit" className="text-sm">
                {busy ? "Saving…" : "Save changes"}
              </Button>
        
            </div>
          </form>
        </div>
      </div>

      {/* Box 2: Delete account (unchanged idea, slightly tweaked to match style) */}
      <div className="rounded-md border border-red-200 bg-red-50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="md:w-2/3">
            <h2 className="text-base font-semibold text-danger">
              Delete account
            </h2>
            <p className="mt-1 text-sm text-danger">
              Delete this account. Once you delete an account, there is no going
              back. Please be certain.
            </p>
          </div>
          <div className="md:w-1/3 flex md:justify-end">
            <DeleteAccountButton id={account.id} name={account.name} />
          </div>
        </div>
      </div>
    </section>
  );
}
