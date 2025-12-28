"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { sortItems } from "@/lib/sort";
import { ArrowDown, ArrowUp } from "../ui/Arrows";
import { Tx } from "@/types/api";
import { getTodayDateString } from "@/lib/date";
import PopupModal from "../ui/Modal";
import EditTransactionForm from "./EditTransactionForm";


/* TYPES: */

type Props = {
  accountId: number;
  currency: string;
  setIsAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onRefresh: () => void;
};

 type SortBy = "date" | "amount" | "category" | "description" 
 type SortDirection = "asc" | "desc";

 export default function TransactionsList({
  accountId,
  currency,
onRefresh,
  setIsAddOpen,
}: Props) {

  const [tx, setTx] = useState<Tx| null>(null);
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();


  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
   function handleSort(column: SortBy) {
      if (sortBy === column) {
        // Flip direction if already sorting by this column
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        // New column, sort ascending
        setSortBy(column);
        setSortDirection("asc");
      }
  
      const sorted = [...items].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (column) {
   
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
        }

        const direction = sortBy === column && sortDirection === "asc" ? -1 : 1;
        return sortItems(aVal, bVal, direction);
      });
  
      setItems(sorted);
    }


  useEffect(() => {
    if (!Number.isFinite(accountId)) return;

    async function loadTransactions() {
      setErr(null);
      setLoading(true);
      try {
        const res = await api<Tx[]>(`/transactions/by-account/${accountId}`);
        setItems(res);
      } catch (e) {
        setErr(handleError(e, 5));
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [accountId]);







  // async function remove(id: number) {
  //   if (!confirm("Delete this transaction?")) return;
  //   try {
  //     setBusyRow(id);
  //     setErr(null);
  //     await api(`/transactions/${id}`, { method: "DELETE" });

  //     // update local list
  //     setItems((prev) => prev.filter((x) => x.id !== id));
  //   } catch (e) {
  //     setErr(handleError(e, 4));
  //   } finally {
  //     setBusyRow(null);
  //   }
  // }


  function generateArrows() {
    return sortDirection === "asc" ? <ArrowUp /> : <ArrowDown />;
  }

  if (loading) return <p>Loading transactions…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  if (items.length === 0)
    return (
      <section className="space-y-2 rounded-xl border p-4">
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
            onClick={
    
              () => router.push(`/accounts/${accountId}/import`)
            }
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
    <section className="space-y-2 rounded-xl border p-4 bg-white">

      {/* Add transaction modal */}
      {isEditOpen && tx && (
        <PopupModal label="Edit transaction" close={() => setIsEditOpen(false)}>
          <EditTransactionForm
            accountId={accountId}
            tx={tx}
            onCreated={(txs: Tx[]) => {
              setItems(txs);
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
      </div>
      <div className="grid grid-cols-5 gap-2 px-2 text-xs font-bold text-primary/70 uppercase border-b pb-2">
        <span onClick={() => handleSort("date")}>
          {" "}
          Date {sortBy === "date" && generateArrows()}
        </span>
        <span onClick={() => handleSort("amount")}>
          {" "}
          Amount {sortBy === "amount" && generateArrows()}
        </span>
        <span onClick={() => handleSort("description")}>
          {" "}
          Description {sortBy === "description" && generateArrows()}
        </span>
        <span onClick={() => handleSort("category")}>
          {" "}
          Category {sortBy === "category" && generateArrows()}
        </span>
        <span className="text-right">Actions</span>
      </div>
      <ul className="divide-y">
        {items.map((t) => {
  
          return (
            <li
              key={t.id}
              className="grid grid-cols-5 gap-2 py-2 text-sm items-center"
            >
              {/* Date (yyyy-mm-dd) */}
              <div className="col-span-1">
                
                  <span>{getTodayDateString(t.date)}</span>
      
              </div>
              {/* Amount */}
              <div className="col-span-1">
              
                  <span>
                    {" "}
                    {formatCurrency(Number(t.amount ?? 0), currency)}
                  </span>
           
              </div>
              {/* Description */}
              <div className="col-span-1">
           
                  <span>{t.description || "-"}</span>
        
              </div>
              {/* Category */}
              <div className="col-span-1">
                  <span>{t.category || "-"}</span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end gap-2">
              
                  <>
                    <Button
                      className="px-1.5"
                      onClick={() => {
                        setTx(t);
                        setIsEditOpen(true)}}
                    >
                      Edit
                    </Button>
  
                  </>
  
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}


