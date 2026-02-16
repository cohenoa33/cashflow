"use client";

import Button, { SortButton } from "@/components/ui/Button";
import TableInput from "../ui/TableInput";
import CategoryInput from "./CategoryInput";
import { SortDirection, RowWithState, SortByWithError } from "@/types/api";

export default function EditImportTransactions({
  rows,
  startOver,
  sortBy,
  sortDirection,
  handleSort,
  updateRow,
  handleCategoryChange,
  applyCategoryToValue,
  deleteRow,
  categories,
  addCategoryToSuggestions,
  busy,
  errors
}: {
  rows: RowWithState[];
  startOver: () => void;
  sortBy: SortByWithError;
  sortDirection: SortDirection;
  handleSort: (by: SortByWithError) => void;
  updateRow: (id: number, patch: Partial<RowWithState>) => void;
  handleCategoryChange: (id: number, category: string) => void;
  applyCategoryToValue: (value: string, category: string) => void;
  deleteRow: (id: number) => void;
  categories: Set<string>;
  addCategoryToSuggestions: (value: string) => void;
  busy: boolean;
  errors: boolean;
}) {
  return (
    <div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex text-sm font-medium">
          <p>Parsed rows: {rows.length}</p>
          <div className="flex-grow" />
          <button type="button" onClick={startOver} className="hover:underline">
            Start Over
          </button>
        </div>

        <div className="flex-1 overflow-auto rounded text-xs mt-4">
          <table className="min-w-full border-collapse table-fixed">
            <colgroup>
              <col className="w-[130px]" />
              <col className="w-[120px]" /> 
              <col className="w-[350px]" />
              <col className="w-[220px]" /> 
              <col className="w-[120px]" />
            </colgroup>

            <thead className="bg-gray-50">
              <tr>
                <th className="border px-2 py-1 text-left hover:bg-gray-100">
                  <SortButton
                    active={sortBy === "date"}
                    dir={sortDirection}
                    onClick={() => handleSort("date")}
                  >
                    Date
                  </SortButton>
                </th>

                <th className="border px-2 py-1 text-left hover:bg-gray-100">
                  <SortButton
                    active={sortBy === "amount"}
                    dir={sortDirection}
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                  </SortButton>
                </th>

                <th className="border px-2 py-1 text-left hover:bg-gray-100">
                  <SortButton
                    active={sortBy === "description"}
                    dir={sortDirection}
                    onClick={() => handleSort("description")}
                  >
                    Description
                  </SortButton>
                </th>

                <th className="border px-2 py-1 text-left hover:bg-gray-100">
                  <SortButton
                    active={sortBy === "category"}
                    dir={sortDirection}
                    onClick={() => handleSort("category")}
                  >
                    Category
                  </SortButton>
                </th>

                <th className="border px-2 py-1 text-left hover:bg-gray-100">
                  <SortButton
                    active={sortBy === "error"}
                    dir={sortDirection}
                    onClick={() => handleSort("error")}
                  >
                    Error
                  </SortButton>
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
                      onChange={(v) => updateRow(r.id, { amount: Number(v) })}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <TableInput
                    multiline
                      value={r.description}
                      onChange={(v) => updateRow(r.id, { description: v })}
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

                  <td className="border px-2 py-1">
                    <div
                      className={
                        r.error
                          ? "flex items-center justify-between gap-2"
                          : "flex justify-end"
                      }
                    >
                      {r.error && (
                        <div className="text-red-600 text-[10px] truncate">
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

      <div className="flex justify-center m-4">
        <Button
          disabled={busy || errors}
          className="w-1/2 min-w-[200px]"
          type="submit"
        >
          {busy ? "Importing…" : "Import Transactions"}
        </Button>
      </div>
    </div>
  );
}
