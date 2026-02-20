"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button, { SortButton } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { sortItems } from "@/lib/sort";
import { TransactionsFilters, Tx } from "@/types/api";
import { getTodayDateString } from "@/lib/date";
import PopupModal from "../ui/Modal";
import EditTransactionForm from "./EditTransactionForm";
import FilterTransactions from "./FilterTransactions";
import { SortDirection } from "@/types/api";

/* TYPES: */
type Props = {
  accountId: number;
  currency: string;
  setIsAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onRefresh: () => void;
};

type SortBy = "date" | "amount" | "category" | "description";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

export default function TransactionsList({
  accountId,
  currency,
  onRefresh,
  setIsAddOpen
}: Props) {
  const [tx, setTx] = useState<Tx | null>(null);
  const [allItems, setAllItems] = useState<Tx[]>([]);
  const [filteredItems, setFilteredItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();

  const [filters, setFilters] = useState<TransactionsFilters>({
    category: "",
    description: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: ""
  });

  const [sortBy, setSortBy] = useState<SortBy>(getSortFromStorage());
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    getDirectionFromStorage()
  );
  const [includeFuture, setIncludeFuture] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("transactionsIncludeFuture") || "true")
  );

  function getSortFromStorage(): SortBy {
    return (localStorage.getItem("transactionsSortBy") as SortBy) || "date";
  }
  function getDirectionFromStorage(): SortDirection {
    return (
      (localStorage.getItem("transactionsSortDirection") as SortDirection) ||
      "desc"
    );
  }

  useEffect(() => {
    localStorage.setItem("transactionsSortBy", sortBy);
  }, [sortBy]);
  useEffect(() => {
    localStorage.setItem("transactionsSortDirection", sortDirection);
  }, [sortDirection]);
  useEffect(() => {
    localStorage.setItem(
      "transactionsIncludeFuture",
      JSON.stringify(includeFuture)
    );
  }, [includeFuture]);

  const totalPages =
    filteredItems.length === 0
      ? 1
      : Math.ceil(filteredItems.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  function toggleSort(next: SortBy) {
    if (sortBy === next) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(next);
    }
  }

  const applyFilters = useCallback(
    (base: Tx[]): Tx[] => {
      const fromTs = filters.dateFrom
        ? new Date(filters.dateFrom).getTime()
        : null;
      const toTs = filters.dateTo
        ? new Date(filters.dateTo).getTime()
        : !includeFuture
          ? new Date(getTodayDateString(new Date())).getTime()
          : null;
      const minAmount =
        filters.amountMin.trim() === "" ? null : Number(filters.amountMin);
      const maxAmount =
        filters.amountMax.trim() === "" ? null : Number(filters.amountMax);

      return base.filter((t) => {
        const category = (t.category || "").toLowerCase();
        const description = (t.description || "").toLowerCase();
        const txDate = new Date(t.date).getTime();
        const amount = Number(t.amount);

        if (
          filters.category.length &&
          !category.includes(filters.category.toLowerCase())
        ) {
          return false;
        }

        if (
          filters.description.length &&
          !description.includes(filters.description.toLowerCase())
        ) {
          return false;
        }

        if (fromTs !== null && !Number.isNaN(txDate) && txDate < fromTs)
          return false;
        if (toTs !== null && !Number.isNaN(txDate) && txDate > toTs)
          return false;

        if (minAmount !== null && !Number.isNaN(amount) && amount < minAmount)
          return false;
        if (maxAmount !== null && !Number.isNaN(amount) && amount > maxAmount) {
          return false;
        }
        return true;
      });
    },
    [filters, includeFuture]
  );

  const applySort = useCallback(
    (list: Tx[]): Tx[] => {
      const direction = sortDirection === "asc" ? 1 : -1;
      return [...list].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sortBy) {
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
            aVal = a.description || "";
            bVal = b.description || "";
            break;
          default:
            aVal = "";
            bVal = "";
            break;
        }

        return sortItems(aVal, bVal, direction);
      });
    },
    [sortBy, sortDirection]
  );

  useEffect(() => {
    if (!Number.isFinite(accountId)) return;

    async function loadTransactions() {
      setErr(null);
      setLoading(true);
      try {
        const res = await api<Tx[]>(`/transactions/by-account/${accountId}`);
        setAllItems(res);
        setFilteredItems(res);
        setCurrentPage(1);
      } catch (e) {
        setErr(handleError(e, 5));
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [accountId]);
  useEffect(() => {
    if (!Number.isFinite(accountId)) return;

    async function loadTransactions() {
      setErr(null);
      setLoading(true);
      try {
        const res = await api<Tx[]>(`/transactions/by-account/${accountId}`);
        setAllItems(res);
        setCurrentPage(1);
      } catch (e) {
        setErr(handleError(e, 5));
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [accountId]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const filtered = applyFilters(allItems);
      const sorted = applySort(filtered);
      setFilteredItems(sorted);
      setCurrentPage(1);
    }, 300);

    return () => {
      window.clearTimeout(handler);
    };
  }, [allItems, applyFilters, applySort]);

  if (loading) return <p>Loading transactions…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  if (allItems.length === 0)
    return (
      <section>
        <h2 className="text-lg font-semibold"></h2>
        <div className="flex justify-end gap-4 text-sm pb-4">
          <button
            type="button"
            className={"text-gray-500 hover:underline"}
            onClick={() => setIsAddOpen(true)}
          >
            Add transaction
          </button>
          <span className="text-gray-400">|</span>
          <button
            type="button"
            className={"text-gray-500 hover:underline"}
            onClick={() => router.push(`/accounts/${accountId}/import`)}
          >
            Import transactions
          </button>
        </div>
        <p className="text-gray-500">
          No transactions yet (balance is set based on initial deposit)
        </p>
      </section>
    );

  return (
    <section>
      {isEditOpen && tx && (
        <PopupModal label="Edit transaction" close={() => setIsEditOpen(false)}>
          <EditTransactionForm
            accountId={accountId}
            tx={tx}
            onCreated={(txs: Tx[]) => {
              setAllItems(txs);
              setIsEditOpen(false);
              onRefresh();
            }}
            close={() => setIsEditOpen(false)}
          />
        </PopupModal>
      )}
      <h2 className="text-lg font-semibold"></h2>
      <div className="flex justify-end gap-4 text-sm pb-4">
        <button
          type="button"
          className={"text-gray-500 hover:underline"}
          onClick={() => setIsAddOpen(true)}
        >
          Add transaction
        </button>
        <span className="text-gray-400">|</span>
        <button
          type="button"
          className={"text-gray-500 hover:underline"}
          onClick={() => router.push(`/accounts/${accountId}/import`)}
        >
          Import transactions
        </button>
        <span className="text-gray-400">|</span>
        <button
          type="button"
          className={"text-gray-500 hover:underline"}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          Filter transactions
        </button>
        <span className="text-gray-400">|</span>
        <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={includeFuture}
            onChange={(e) => setIncludeFuture(e.target.checked)}
            className="rounded accent-black"
          />
          Include future transactions
        </label>
      </div>
      {/* Filter options */}
      {isFilterOpen && (
        <PopupModal
          label="Filter transactions"
          close={() => setIsFilterOpen(false)}
        >
          <FilterTransactions
            filters={filters}
            close={(updated) => {
              setFilters(updated);
              const reset = Object.values(updated).every((v) => v === "");
              const filtered = reset ? allItems : applyFilters(allItems);
              const sorted = applySort(filtered);
              setFilteredItems(sorted);
              setCurrentPage(1);
              setIsFilterOpen(false);
            }}
          />
        </PopupModal>
      )}

      <div className="overflow-auto rounded-lg border bg-white/60 w-[850px]">
      
        <table className="w-[850px] text-sm border border-white table-fixed">
          <colgroup>
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[325px]" />
            <col className="w-[160px]" />
            <col className="w-[90px]" />
          </colgroup>

          <thead className="bg-gray-50 text-left">
            <tr className=" text-gray-600">
              <th className="px-3 py-2 w-[120px]">
                <SortButton
                  active={sortBy === "date"}
                  dir={sortDirection}
                  onClick={() => toggleSort("date")}
                >
                  Date
                </SortButton>
              </th>
              <th className="px-3 py-2 whitespace-nowrap w-[120px]">
                <SortButton
                  active={sortBy === "amount"}
                  dir={sortDirection}
                  onClick={() => toggleSort("amount")}
                >
                  Amount
                </SortButton>
              </th>
              <th className="px-3 py-2 whitespace-normal break-words w-[325px]">
                <SortButton
                  active={sortBy === "description"}
                  dir={sortDirection}
                  onClick={() => toggleSort("description")}
                >
                  Description
                </SortButton>
              </th>
              <th className="px-3 py-2 whitespace-normal break-words w-[160px]">
                <SortButton
                  active={sortBy === "category"}
                  dir={sortDirection}
                  onClick={() => toggleSort("category")}
                >
                  Category
                </SortButton>
              </th>
              <th className="px-3 py-2 whitespace-nowrap w-[90px]"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginatedItems.map((t) => {
              return (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50/60 align-top"
                  style={{ cursor: "pointer" }}
                >
                  <td className="px-3 py-2 w-[120px]">
                    {getTodayDateString(t.date)}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap w-[120px]">
                    {formatCurrency(Number(t.amount ?? 0), currency)}
                  </td>

                  <td className="px-3 py-2 whitespace-normal break-words w-[325px]">
                    {t.description || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-normal break-words w-[160px]">
                    {t.category || "-"}
                  </td>

                  <td className="px-3 py-2 w-[90px]">
                    <Button
                      className="px-1.5"
                      onClick={() => {
                        setTx(t);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}

            {paginatedItems.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-gray-500" colSpan={5}>
                  No transactions match the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between gap-4 pt-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border rounded text-sm outline-none"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-gray-600">per page</span>
        </div>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3"
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
