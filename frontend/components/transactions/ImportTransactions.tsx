"use client";

import { useState, DragEvent, SyntheticEvent } from "react";
import {
  parseTransactionsCsv,
  CsvTransactionRow,
  getFileHeader
} from "@/lib/csv";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import {
  SPENDING_CATEGORIES,
  INCOME_CATEGORIES,
  suggestCategoryFromRules
} from "@/lib/categories";
import { sortItems } from "@/lib/sort";
import {
  RowWithState,
  SortByWithError,
  SortDirection,
  SortByNoError
} from "@/types/api";
import DragDropComponent from "./DragDrop";
import EditImportTransactions from "./EditImportTransactions";
import Button from "../ui/Button";

export default function ImportTransactions({
  accountId,
  onComplete
}: {
  accountId: number;
  onComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RowWithState[]>([]);

  const [categories, setCategories] = useState<Set<string>>(
    new Set([...SPENDING_CATEGORIES, ...INCOME_CATEGORIES])
  );
  const [err, setErr] = useState<string | null>(null);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [sortBy, setSortBy] = useState<SortByWithError>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [headerMap, setHeaderMap] = useState<
    Map<string, (string | number)[]>
  >(new Map());
  const [headerFromFileMap, setHeaderFromFileMap] = useState<
    Map<SortByNoError, (string | number)[]>
  >(new Map());
  const [headerSet, setHeaderSet] = useState(false);
  const [hasHeader, setHasHeader] = useState(false);


function startOver() {  setFile(null);
    setRows([]);
    setErr(null);
    setErrors(new Set());
    setBusy(false);
    setSortBy("date");
    setSortDirection("asc");
    setHeaderMap(new Map());
    setHeaderFromFileMap(new Map());
    setHeaderSet(false);
    setHasHeader(false);
  }


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
  function validateAndMapHeaders(
    headerMap: Map<string, (string | number)[]>
  ) {
    const expectedColumns = ["date", "amount", "description", "category"];
    const mappedHeaders = new Map<SortByNoError, (string | number)[]>();

    for (const expected of expectedColumns) {
      for (const [key] of headerMap.entries()) {
        if (key.toLowerCase().includes(expected.toLowerCase())) {
          mappedHeaders.set(expected as SortByNoError, headerMap.get(key)!);
          break;
        }
      }
    }
    if (mappedHeaders.size !== expectedColumns.length) {
      expectedColumns.forEach((col) => {
        if (!mappedHeaders.has(col as SortByNoError)) {
          mappedHeaders.set(col as SortByNoError, [-1, ""]);
        }
      });
    }

    setHeaderFromFileMap(mappedHeaders);
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
        let suggested = map[key];
        if (!suggested ) {


          const suggestedFromRules = suggestCategoryFromRules(key);
  
          if(!suggestedFromRules){ return r; }
          suggested = suggestedFromRules;
        }
    
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
  async function handleFile() {

    if(!file) return;
    try {
      setErr(null);
      const errors = new Set<number>();
      const parsed = await parseTransactionsCsv(file, headerFromFileMap, hasHeader);
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
      setHeaderSet(false)
    } catch (e) {
      setErr(handleError(e, 4));
    }
  }
  async function mapHeaderRow(file: File) {
    try {
      setErr(null);
      const mappedHeader = await getFileHeader(file);
      setHeaderMap(mappedHeader);

      validateAndMapHeaders(mappedHeader);
      setHeaderSet(true);
      setFile(file)
    } catch (e) {
      setErr(handleError(e, 4));
      setHeaderSet(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void mapHeaderRow(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void mapHeaderRow(file);
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

  function handleSort(column: SortByWithError) {
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
      return sortItems(aVal, bVal, direction);
    });

    setRows(sorted);
  }

  return (
    <section className="space-y-4">
      <p className="text-sm font-bold">
        Import a CSV file with date, amount, description, and category. You can
        review and edit rows before saving.
      </p>
      <form onSubmit={onSubmit} className="space-y-4 ">
        {!file ? (
          <DragDropComponent
            onDrop={onDrop}
            onDragOver={onDragOver}
            handleDivClick={handleDivClick}
            onFileInputChange={onFileInputChange}
          />
        ) : (
          <div className="space-y-2 flex flex-col h-[calc(100vh-200px)]">
            {err && <p className="text-sm font-medium text-red-600">{err}</p>}
            {/* Table section */}
            {headerSet ? (
              <>
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasHeader"
                        checked={hasHeader}
                        onChange={(e) => setHasHeader(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="hasHeader"
                        className="ml-2 text-sm font-medium"
                      >
                        My file has header
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Date Column
                        </label>
                        <select
                          onClick={(e: SyntheticEvent) => {
                            setHeaderFromFileMap((prev) => {
                              const next = new Map(prev);
                              next.set("date", [
                                (e.target as HTMLSelectElement).value,
                                ""
                              ]);
                              return next;
                            });
                          }}
                          defaultValue={headerFromFileMap.get("date")?.[0] ?? 0}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {Array.from(headerMap.entries()).map(
                            ([key, value]) => (
                              <option key={key} value={value[0]}>
                                {hasHeader ? key : `${value[1]}`}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Amount Column
                        </label>
                        <select
                          onClick={(e: SyntheticEvent) => {
                            setHeaderFromFileMap((prev) => {
                              const next = new Map(prev);
                              next.set("amount", [
                                (e.target as HTMLSelectElement).value,
                                ""
                              ]);
                              return next;
                            });
                          }}
                          defaultValue={
                            headerFromFileMap.get("amount")?.[0] ?? 1
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {Array.from(headerMap.entries()).map(
                            ([key, value]) => (
                              <option key={key} value={value[0]}>
                                {hasHeader ? key : `${value[1]}`}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description Column
                        </label>
                        <select
                          defaultValue={
                            headerFromFileMap.get("description")?.[0] ?? -1
                          }
                          className="w-full px-3 py-2 border rounded-md"
                          onClick={(e: SyntheticEvent) => {
                            setHeaderFromFileMap((prev) => {
                              const next = new Map(prev);
                              next.set("description", [
                                (e.target as HTMLSelectElement).value,
                                ""
                              ]);
                              return next;
                            });
                          }}
                        >
                          {Array.from(headerMap.entries()).map(
                            ([key, value]) => (
                              <option key={key} value={value[0]}>
                                {hasHeader ? key : `${value[1]}`}
                              </option>
                            )
                          )}
                          <option value={-1}>N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category Column
                        </label>
                        <select
                          defaultValue={
                            headerFromFileMap.get("category")?.[0] ?? -1
                          }
                          className="w-full px-3 py-2 border rounded-md"
                          onClick={(e: SyntheticEvent) => {
                            setHeaderFromFileMap((prev) => {
                              const next = new Map(prev);
                              next.set("category", [
                                (e.target as HTMLSelectElement).value,
                                ""
                              ]);
                              return next;
                            });
                          }}
                        >
                          {Array.from(headerMap.entries()).map(
                            ([key, value]) => (
                              <option key={key} value={value[0]}>
                                {hasHeader ? key : `${value[1]}`}
                              </option>
                            )
                          )}{" "}
                          <option value={-1}>N/A</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button
                        onClick={
                          () => {
                          console.log("Continue to import rows", headerFromFileMap)
                          handleFile()}
                        }
                        className="px-3"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <EditImportTransactions
                rows={rows}
                startOver={startOver}
                sortBy={sortBy}
                sortDirection={sortDirection}
                handleSort={handleSort}
                updateRow={updateRow}
                handleCategoryChange={handleCategoryChange}
                applyCategoryToValue={applyCategoryToValue}
                deleteRow={deleteRow}
                categories={categories}
                addCategoryToSuggestions={addCategoryToSuggestions}
                busy={busy}
                errors={errors.size > 0}
              />
            )}
          </div>
        )}
      </form>
    </section>
  );
}
