
import Button from "@/components/ui/Button";
import { TransactionsFilters } from "@/types/api";
import { useState } from "react";

/* TYPES: */

type Props = {
  filters: TransactionsFilters;
  close: (filters: TransactionsFilters,) => void;
};




export default function FilterTransactions({ filters, close }: Props) {
const [category, setCategory] = useState(filters.category);
const [description, setDescription] = useState(filters.description);
const [dateFrom, setDateFrom] = useState(filters.dateFrom);
const [dateTo, setDateTo] = useState(filters.dateTo);
const [amountMin, setAmountMin] = useState(filters.amountMin);
const [amountMax, setAmountMax] = useState(filters.amountMax);  

  
  return (
    <div className="gap-4 rounded-lg border bg-white/70 p-4 text-sm mb-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          close({
            category,
            description,
            dateFrom,
            dateTo,
            amountMin,
            amountMax
          });
        }}
      >
        <div className="font-bold ">Search by any of these transaction details.</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-600">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded border px-2 py-1 outline-none"
              placeholder="e.g. Groceries"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded border px-2 py-1 outline-none"
              placeholder="Search description"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-600">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                const value = e.target.value;
                setDateFrom(
                  value === "" || !isNaN(new Date(value).getTime()) ? value : ""
                );
              }}
              className="rounded border px-2 py-1 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                const value = e.target.value;
                setDateTo(
                  value === "" || !isNaN(new Date(value).getTime()) ? value : ""
                );
              }}
              className="rounded border px-2 py-1 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-600">Min amount</label>
            <input
              type="number"
              value={amountMin}
              onChange={(e) => {
                const value = e.target.value;
                setAmountMin(
                  value === "" || !isNaN(Number(value)) ? value : ""
                );
              }}
              className="rounded border px-2 py-1 outline-none"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600">Max amount</label>
            <input
              type="number"
              value={amountMax}
              onChange={(e) => {
                const value = e.target.value;
                setAmountMax(
                  value === "" || !isNaN(Number(value)) ? value : ""
                );
              }}
              className="rounded border px-2 py-1 outline-none"
              placeholder="1000"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col justify-end">
            <Button
              type="submit"
              onClick={() =>
                close({
                  category,
                  description,
                  dateFrom,
                  dateTo,
                  amountMin,
                  amountMax
                })
              }
              className="px-3"
            >
              Search
            </Button>
          </div>
          <div className="flex flex-col justify-end">
            <Button
              onClick={() =>
                close({
                  category: "",
                  description: "",
                  dateFrom: "",
                  dateTo: "",
                  amountMin: "",
                  amountMax: ""
                })
              }
              className="px-3"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
