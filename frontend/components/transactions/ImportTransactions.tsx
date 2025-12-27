"use client";

import { useState, DragEvent } from "react";
import { parseTransactionsCsv, CsvTransactionRow } from "@/lib/csv";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import TableInput from "../ui/TableInput";
import { SPENDING_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import CategoryInput from "./CategoryInput";

/* TYPES: */
type RowWithState = CsvTransactionRow & { id: number; error?: string | null };
type SortBy = "date" | "amount" | "category" | "description" | "error";
type SortDirection = "asc" | "desc";

export default function ImportTransactions({
  accountId,
  onComplete
}: {
  accountId: number;
  onComplete: () => void;
}) {
  const [rows, setRows] = useState<RowWithState[]>([]);

  const [categories, setCategories] = useState<Set<string>>(
    new Set([...SPENDING_CATEGORIES, ...INCOME_CATEGORIES])
  );
  const [err, setErr] = useState<string | null>(null);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

    rows.forEach((r) => {
      let updated = r;
      let error = r.error;
      if (
        r.description.trim().toLowerCase() === value.trim().toLowerCase() &&
        r.description.length > 0
      ) {
        error = rowError(updated);
        updated = {
          ...r,
          category: trimmedCategory,
          error
        };
      }

      updatedRows.push(updated);
      if (error) updatedErrors.add(updated.id);
    });
    setRows(updatedRows);
    setErrors(updatedErrors);
  }

  async function suggestCategories(
    current: RowWithState[],
    errors: Set<number>
  ) {
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
        setCategories((prev) => new Set([...prev, ...existing]));
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
      const updatedRows = current.map((r) => {
        if (r.category?.trim()) return r;
        const key = r.description.trim().toLowerCase();
        const suggested = map[key];
        if (!suggested) return r;
        updatedErrors.delete(r.id);
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
      return "*";
    }
    return null;
  }
  async function handleFile(file: File) {
    try {
      setErr(null);
      const errors = new Set<number>();
      const parsed = await parseTransactionsCsv(file);

      const withState: RowWithState[] = parsed.map((r) => {
        const error = rowError(r);
        if (error) {
          errors.add(r.id);
        }
        return {
          ...r,
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

  function handleDivClick() {
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null;
    input?.click();
  }

  function updateRow(id: number, patch: Partial<RowWithState>) {
    const updatedErrors = new Set(errors); // or recompute from prev if you want it fully derived
    setRows((prev) => {
      const next = prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        const error = rowError(updated);

        if (error) updatedErrors.add(id);
        else updatedErrors.delete(id);

        return { ...updated, error };
      });

      return next;
    });

    setErrors(updatedErrors);
  }

  function handleCategoryChange(id: number, value: string) {
    updateRow(id, { category: value });
  }

  function deleteRow(id: number) {
    const updatedErrors = new Set(errors);
    updatedErrors.delete(id);

    setErrors(updatedErrors);
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
    const cleanRows: {
      date: string;
      amount: number;
      description: string;
      category?: string;
    }[] = rows.map((r) => ({
      date: r.date,
      amount: r.amount,
      description: r.description,
      category: r.category
    }));

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

  function handleSort(column: SortBy) {
    if (sortBy === column) {
      // Flip direction if already sorting by this column
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // New column, sort ascending
      setSortBy(column);
      setSortDirection("asc");
    }

    const sorted = [...rows].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (column) {
        case "error":
          aVal = a.error ? 1 : 0;
          bVal = b.error ? 1 : 0;
          break;
        case "date":
          aVal = a.date;
          bVal = b.date;
          break;
        case "amount":
          aVal = Number(a.amount);
          bVal = Number(b.amount);
          break;
        case "category":
          aVal = a.category || "";
          bVal = b.category || "";
          break;
        case "description":
          aVal = a.description;
          bVal = b.description;
          break;
      }

      const direction = sortBy === column && sortDirection === "asc" ? -1 : 1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * direction;
      }

      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });

    setRows(sorted);
  }

  function generateArrows() {
    return sortDirection === "asc" ? (
      <svg className="inline w-4 h-4" viewBox="0 0 14 14" fill="currentColor">
        <path d="M6 3 L9 9 L3 9 Z" />
      </svg>
    ) : (
      <svg className="inline w-4 h-4" viewBox="0 0 14 14" fill="currentColor">
        <path d="M6 9 L9 3 L3 3 Z" />
      </svg>
    );
  }

  return (
    <section className="space-y-4">
      <p className="text-sm font-bold">
        Import a CSV file with date, amount, description, and category. You can
        review and edit rows before saving.
      </p>
      <form onSubmit={onSubmit} className="space-y-4 ">
        {!rows.length ? (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={handleDivClick}
            className="rounded-lg border border-dashed p-8 text-center cursor-pointer"
          >
            {/* Upload section */}
            <p className="text-md font-bold text-white">
              Drag & drop a CSV file or click below
            </p>
            <input
              type="file"
              accept=".csv"
              className="mt-3 hidden"
              onChange={onFileInputChange}
            />
          </div>
        ) : (
          <div className="space-y-2 flex flex-col h-[calc(100vh-200px)]">
            {err && <p className="text-sm font-medium text-red-600">{err}</p>}
            {/* Table section */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex text-sm font-medium ">
                <p>Parsed rows: {rows.length}</p>
                <div className="flex-grow" />
                <button
                  type="button"
                  onClick={() => setRows([])}
                  className={"hover:underline"}
                >
                  Start Over
                </button>
              </div>

              <div className="flex-1 overflow-auto rounded text-xs mt-4">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="border px-2 py-1 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("date")}
                      >
                        Date {sortBy === "date" && generateArrows()}
                      </th>
                      <th
                        className="border px-2 py-1 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("amount")}
                      >
                        Amount {sortBy === "amount" && generateArrows()}
                      </th>
                      <th
                        className="border px-2 py-1 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("description")}
                      >
                        Description{" "}
                        {sortBy === "description" && generateArrows()}
                      </th>
                      <th
                        className="border px-2 py-1 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("category")}
                      >
                        Category {sortBy === "category" && generateArrows()}
                      </th>
                      <th
                        className="border px-2 py-1 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("error")}
                      >
                        Error {sortBy === "error" && generateArrows()}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={`row-${r.id}`}
                        className={r.error ? "bg-gray-50/50" : "bg-gray-50/75"}
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
                            value={r.description}
                            onChange={(v) =>
                              updateRow(r.id, { description: v })
                            }
                          />
                        </td>

                        <td className="border px-2 py-1">
                          <CategoryInput
                            value={r.category || ""}
                            onChange={(v) => handleCategoryChange(r.id, v)}
                            onPick={(v) => {
                              applyCategoryToValue(r.description, v);
                              addCategoryToSuggestions(v);
                            }}
                            options={[...categories]}
                          />
                        </td>

                        <td className="border px-2 py-1 text-right">
                          <div
                            className={
                              r.error
                                ? "flex items-center justify-between gap-2"
                                : "flex justify-end"
                            }
                          >
                            {r.error && (
                              <div className="text-red-600 text-[10px]">
                                {r.error}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteRow(r.id)}
                              className="text-red-600 underline text-xs whitespace-nowrap"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Submit */}
            <div className="flex justify-center m-4">
              <Button
                disabled={busy || rows.length === 0 || errors.size > 0}
                className="w-1/2 min-w-[200px]"
                type="submit"
              >
                {busy ? "Importing…" : "Import Transactions"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
