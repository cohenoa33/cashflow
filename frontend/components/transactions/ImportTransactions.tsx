"use client";

import { useState, DragEvent } from "react";
import { parseTransactionsCsv, CsvTransactionRow } from "@/lib/csv";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import TableInput from "../ui/TableInput";

type RowWithState = CsvTransactionRow & { id: number; error?: string | null };

export default function ImportTransactions({
  accountId,
  onComplete
}: {
  accountId: number;
  onComplete: () => void;
}) {
  const [rows, setRows] = useState<RowWithState[]>([]);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

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
function applyCategoryToValue(value: string, category: string) {
  const trimmedCategory = category.trim();
  if (!trimmedCategory) {
    // user clicked in and out without choosing/typing a category → keep error
    return;
  }

  const updatedRows: RowWithState[] = [];
  const updatedErrors = new Set<number>();

  rows.forEach((r, idx) => {
    if (r.description.trim().toLowerCase() === value.trim().toLowerCase() && r.description.length > 0) {
      const updated: RowWithState = {
        ...r,
        category: trimmedCategory
      };
      const error = rowError(updated);
      updatedRows.push({ ...updated, error });

      if (error) {
        updatedErrors.add(idx);
      }
    } else {
      updatedRows.push(r);
      if (r.error) {
        updatedErrors.add(idx);
      }
    }
  });

  setRows(updatedRows);
  setErrors(updatedErrors);
}

  async function suggestCategories(current: RowWithState[], errors: Set<number>) {

    try {
      setErr(null);
      const rowsNeedingCategory = current.filter(
        (r) => !r.category?.trim() && r.description?.trim()
      );
      if (rowsNeedingCategory.length === 0) {
        // still update categories from any existing categories in rows
        const existing = Array.from(
          new Set(
            current
              .map((r) => r.category?.trim())
              .filter((c): c is string => !!c)
          )
        );
        setCategories((prev) => (new Set([...prev, ...existing])));
        return;
      }

      const res = await api<{
        suggestions: Record<string, string>;
      }>("/transactions/suggest-categories", {
        method: "POST",
        body: JSON.stringify({
          rows: rowsNeedingCategory.map((r) => ({
            description: r.description
          }))
        })
      });

      const map = res.suggestions || {};
      const updatedErrors = new Set(errors);

      // apply suggestions to rows
      const updatedRows = current.map((r, id) => {
        if (r.category?.trim()) return r;
        const key = r.description.trim().toLowerCase();
        const suggested = map[key];
        if (!suggested) return r;
        updatedErrors.delete(id);
        return {
          ...r,
          category: suggested,
          error: null
        };
      });

      setRows(updatedRows);
      setErrors(updatedErrors);

      // collect all categories from suggestions + existing rows
      const suggestedValues = Object.values(map).filter(
        (c): c is string => !!c
      );
      const fromRows = updatedRows
        .map((r) => r.category?.trim())
        .filter((c): c is string => !!c);

   setCategories((prev) => {
     const all = new Set(prev);
     for (const c of suggestedValues) all.add(c);
     for (const c of fromRows) all.add(c);
     return all;
   });
    } catch (e) {
      setErr(handleError(e, 5));
    }
  }

  function cellError(value: string | undefined): boolean {
    return !(value && value.trim());
  }
function rowError(r: CsvTransactionRow | RowWithState): string | null {
  const amountNum = Number(r.amount);

  if (
    cellError(r.description) ||
    cellError(r.category) ||
    cellError(r.date) ||
    cellError(String(r.amount)) || // empty / whitespace
    Number.isNaN(amountNum) // not a valid number
  ) {
    return "all fields are required";
  }
  return null;
}
  async function handleFile(file: File) {
    try {
      setErr(null);
      const errors = new Set<number>();
      const parsed = await parseTransactionsCsv(file);

      const withState: RowWithState[] = parsed.map((r, idx) => {
        const error = rowError(r);
        if (error) {
          errors.add(idx);
        }
        return {
          ...r,
          id: idx,
          error
        };
      });

      setRows(withState);

      // seed category suggestions from CSV itself
      const initialCategories = Array.from(
        new Set(
          withState
            .map((r) => r.category?.trim())
            .filter((c): c is string => !!c)
        )
      );
      if (initialCategories.length > 0) {

         setCategories((prev) => {
           const next = new Set(prev);
           for (const c of initialCategories) next.add(c);
           return next;
         });
       }

      await suggestCategories(withState, errors);
    } catch (e) {
      setErr(handleError(e, 4));
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

function updateRow(id: number, patch: Partial<RowWithState>) {
  setRows((prev) => {
    const updatedErrors = new Set(errors); // or recompute from prev if you want it fully derived
    const next = prev.map((r) => {
      if (r.id !== id) return r;
      const updated = { ...r, ...patch };
      const error = rowError(updated);

      if (error) updatedErrors.add(id);
      else updatedErrors.delete(id);

      return { ...updated, error };
    });

    setErrors(updatedErrors);
    return next;
  });
}

  function handleCategoryChange(id: number, value: string) {
    updateRow(id, { category: value });
  }

  function deleteRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
  
    if (errors.size > 0) {
      setErr("Please fix errors before importing");
      setBusy(false);
      return;
    } 
const cleanRows: CsvTransactionRow[] = rows.map((r) => ({
  date: r.date,
  amount: r.amount,
  description: r.description,
  category: r.category
}));

await api("/transactions/import", {
  method: "POST",
  body: JSON.stringify({ accountId, rows: cleanRows })
});
    try {
      await api("/transactions/import", {
        method: "POST",
        body: JSON.stringify({ accountId, rows })
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
      <p className="text-sm">
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

            <div className="max-h-72 overflow-auto rounded border text-xs ">
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
                      className={r.error ? "bg-red-50/35" : undefined}
                    >
                      <td className="border px-2 py-1">
                        <TableInput
                          type="date"
                          value={r.date}
                          onChange={(v) => updateRow(r.id, { date: v })}
                        />
                      </td>

                      <td className="border px-2 py-1">
                        <TableInput
                          type="number"
                          value={r.amount}
                          onChange={(v) =>
                            updateRow(r.id, { amount: Number(v) })
                          }
                        />
                      </td>

                      <td className="border px-2 py-1">
                        <TableInput
                          list="category-options"
                          value={r.category || ""}
                          onChange={(v) => handleCategoryChange(r.id, v)}
                          onBlur={(v) => {
                            applyCategoryToValue(r.description, v);
                            addCategoryToSuggestions(v);
                          }}
                        />
                      </td>

                      <td className="border px-2 py-1">
                        <TableInput
                          value={r.description}
                          onChange={(v) => updateRow(r.id, { description: v })}
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

        {/* Shared datalist for all category inputs */}
        <datalist id="category-options">
          {[...categories]
            .sort((a, b) => a.localeCompare(b))
            .map((c) => (
              <option key={c} value={c} />
            ))}
        </datalist>

        {/* Submit */}
        <Button
          disabled={busy || rows.length === 0 || errors.size > 0}
          className="w-full"
          type="submit"
        >
          {busy ? "Importing…" : "Import Transactions"}
        </Button>
      </form>
    </section>
  );
}
