"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";

type Transaction = {
  id: number;
  amount: number | string;
  type: string; // kept in type for PATCH payload, even if not displayed
  description?: string | null;
  category?: string | null;
  date: string; // ISO string
  createdAt: string;
  updatedAt: string;
  accountId: number;
};

type Props = { accountId: number };

export default function TransactionsList({ accountId }: Props) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{
    amount: string;
    category: string;
    description: string;
    date: string; // yyyy-mm-dd
  }>({ amount: "", category: "", description: "", date: "" });
  const [busyRow, setBusyRow] = useState<number | null>(null);
  const [disabled, setDisabled] = useState(
    busyRow !== null ||
      !form.amount ||
      Number(form.amount) === 0 ||
      !form.category ||
      !form.description ||
      !form.date
  );

    useEffect(() => {
      setDisabled(
        busyRow !== null ||
          !form.amount ||
          Number(form.amount) === 0 ||
          !form.category ||
          !form.description ||
          !form.date
      );
    }, [busyRow, form]);
  useEffect(() => {
    if (!Number.isFinite(accountId)) return;

    async function loadTransactions() {
      setErr(null);
      setLoading(true);
      try {
        const res = await api<Transaction[]>(
          `/transactions/by-account/${accountId}`
        );
        setItems(res);
      } catch (e) {
        setErr(handleError(e, 5));
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [accountId]);

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setForm({
      amount: String(t.amount ?? ""),
      category: t.category ?? "",
      description: t.description ?? "",
      date: isoToYmd(t.date) // yyyy-mm-dd
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ amount: "", category: "", description: "", date: "" });
  }

  async function saveEdit(id: number) {
    if (disabled) return;
      try {
        setBusyRow(id);
        setErr(null);

        await api(`/transactions/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            amount: Number(form.amount),
            category: form.category || undefined,
            description: form.description || undefined,
            date: ymdAtTenAMLocal(form.date) // normalize to 10:00 local
          })
        });

        // refresh list (simple approach)
        const res = await api<Transaction[]>(
          `/transactions/by-account/${accountId}`
        );
        setItems(res);
        cancelEdit();
      } catch (e) {
        setErr(handleError(e, 4));
      } finally {
        setBusyRow(null);
      }
  }

  async function remove(id: number) {
    if (!confirm("Delete this transaction?")) return;
    try {
      setBusyRow(id);
      setErr(null);
      await api(`/transactions/${id}`, { method: "DELETE" });

      // update local list
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setErr(handleError(e, 4));
    } finally {
      setBusyRow(null);
    }
  }

  if (loading) return <p>Loading transactions…</p>;
  if (err) return <p className="text-red-600">{err}</p>;
  if (items.length === 0)
    return <p className="text-gray-500">No transactions yet.</p>;

  return (
    <section className="space-y-2 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">Transactions</h2>

      <div className="grid grid-cols-5 gap-2 px-2 text-xs font-medium text-gray-600">
        <span>Amount</span>
        <span>Category</span>
        <span>Description</span>
        <span>Date</span>
        <span className="text-right">Actions</span>
      </div>

      <ul className="divide-y">
        {items.map((t) => {
          const isEditing = editingId === t.id;
          return (
            <li
              key={t.id}
              className="grid grid-cols-5 gap-2 py-2 text-sm items-center"
            >
              {/* Amount */}
              <div className="col-span-1">
                {isEditing ? (
                  <input
                    className="w-full rounded border p-1"
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                ) : (
                  <span>{String(t.amount)}</span>
                )}
              </div>

              {/* Category */}
              <div className="col-span-1">
                {isEditing ? (
                  <input
                    className="w-full rounded border p-1"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  />
                ) : (
                  <span>{t.category || "-"}</span>
                )}
              </div>

              {/* Description */}
              <div className="col-span-1">
                {isEditing ? (
                  <input
                    className="w-full rounded border p-1"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                ) : (
                  <span>{t.description || "-"}</span>
                )}
              </div>

              {/* Date (yyyy-mm-dd) */}
              <div className="col-span-1">
                {isEditing ? (
                  <input
                    className="w-full rounded border p-1"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                ) : (
                  <span>{isoToYmd(t.date)}</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveEdit(t.id)}
                      disabled={busyRow === t.id}
                      // rounded bg-black px-3 py-1 text-white disabled:opacity-60    ? "bg-blue-300 text-white cursor-not-allowed"
                      // : "bg-blue-600 text-white hover:bg-blue-700"
                      className={`rounded bg-black px-3 py-1 text-white disabled:opacity-60 border`}
                    >
                      {busyRow === t.id ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded border px-3 py-1"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(t)}
                      className="rounded border px-3 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      disabled={busyRow === t.id}
                      className="rounded bg-red-500 px-3 py-1 text-white disabled:opacity-60"
                    >
                      {busyRow === t.id ? "Deleting…" : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------ helpers ------------ */

// to yyyy-mm-dd (local)
function isoToYmd(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// from yyyy-mm-dd to ISO at 10:00 local
function ymdAtTenAMLocal(ymd?: string): string | undefined {
  if (!ymd) return undefined;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 10, 0, 0, 0);
  return dt.toISOString();
}
