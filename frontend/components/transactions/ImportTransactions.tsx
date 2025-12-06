"use client";

import { useState, DragEvent } from "react";
import { parseTransactionsCsv, CsvTransactionRow } from "@/lib/csv";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";

type RowWithState = CsvTransactionRow & { id: number; error?: string | null };

export default function ImportTransactions({
  accountId,
  onComplete
}: {
  accountId: number;
  onComplete: () => void;
}) {
  const [rows, setRows] = useState<RowWithState[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    try {
      setErr(null);
      const parsed = await parseTransactionsCsv(file);

      const withState = parsed.map((r, idx) => ({
        ...r,
        id: idx,
        error: !r.description?.trim() ? "Description is required" : null
      }));

      setRows(withState);
    } catch (e) {
      setErr(handleError(e, 4));
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function updateRow(id: number, patch: Partial<RowWithState>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function deleteRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    const errors: { index: number; message: string }[] = [];
    const cleanRows: CsvTransactionRow[] = [];

    rows.forEach((r, idx) => {
      const desc = r.description.trim();
      const cat = (r.category || "").trim();
      const amount = Number(r.amount);
      const date = r.date;

      let error: string | null = null;

      if (!desc) error = "Description is required";
      else if (!cat) error = "Category is required";
      else if (Number.isNaN(amount)) error = "Amount must be a number";
      else if (!date) error = "Date is required";

      if (error) {
        errors.push({ index: idx, message: error });
        return;
      }

      cleanRows.push({ date, amount, description: desc, category: cat });
    });

    if (errors.length) {
      setRows((prev) =>
        prev.map((r, idx) => {
          const found = errors.find((e) => e.index === idx);
          return found ? { ...r, error: found.message } : r;
        })
      );
      setErr("Please fix the errors.");
      setBusy(false);
      return;
    }

    try {
      await api("/transactions/import", {
        method: "POST",
        body: JSON.stringify({ accountId, rows: cleanRows })
      });

      onComplete();
    } catch (e) {
      setErr(handleError(e, 6));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <p className="text-sm ">
        Import a CSV file with date, amount, description, and category. You can
        review and edit rows before saving.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Upload section */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="rounded-lg border border-dashed p-6 text-center cursor-pointer"
        >
          <p>Drag & drop a CSV file or click below:</p>
          <input
            type="file"
            accept=".csv"
            className="mt-3"
            onChange={onFileInputChange}
          />
        </div>

        {/* Table section */}
        {rows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Parsed rows: {rows.length}</p>

            <div className="max-h-72 overflow-auto rounded border text-xs">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-2 py-1 text-left">Date</th>
                    <th className="border px-2 py-1 text-left">Amount</th>
                    <th className="border px-2 py-1 text-left">Category</th>
                    <th className="border px-2 py-1 text-left">Description</th>
                    <th className="border px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className={r.error ? "bg-red-50" : undefined}
                    >
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border rounded px-1"
                          value={r.date}
                          onChange={(e) =>
                            updateRow(r.id, { date: e.target.value })
                          }
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border rounded px-1"
                          value={r.amount}
                          onChange={(e) =>
                            updateRow(r.id, { amount: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border rounded px-1"
                          value={r.category || ""}
                          onChange={(e) =>
                            updateRow(r.id, { category: e.target.value })
                          }
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border rounded px-1"
                          value={r.description}
                          onChange={(e) =>
                            updateRow(r.id, { description: e.target.value })
                          }
                        />
                      </td>

                      <td className="border px-2 py-1 text-right">
                        <button
                          type="button"
                          onClick={() => deleteRow(r.id)}
                          className="text-red-600 underline text-xs"
                        >
                          Delete
                        </button>
                        {r.error && (
                          <div className="text-red-600 text-[10px]">
                            {r.error}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        )}

        {/* Submit */}
        <Button disabled={busy || rows.length === 0} className="w-full">
          {busy ? "Importing…" : "Import Transactions"}
        </Button>
      </form>
    </section>
  );
}
