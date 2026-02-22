
import Button from "@/components/ui/Button";
import { TransactionsFilters } from "@/types/api";
import { useState } from "react";

/* TYPES: */

type Props = {
  filters: TransactionsFilters;
  close: (filters: TransactionsFilters) => void;
};

export default function FilterTransactions({ filters, close }: Props) {
  const [category, setCategory] = useState(filters.category);
  const [description, setDescription] = useState(filters.description);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [amountMin, setAmountMin] = useState(filters.amountMin);
  const [amountMax, setAmountMax] = useState(filters.amountMax);
  const [dateError, setDateError] = useState("");

  const validateDates = () => {
    setDateError("");

    // If both are empty, no validation needed
    if (!dateFrom && !dateTo) return true;
    // Check if dates are valid
    const fromTime = new Date(dateFrom).getTime();
    const toTime = new Date(dateTo).getTime();
    
    console.log("Validating dates:", { dateFrom, dateTo, fromTime, toTime });
    if (dateFrom && isNaN(fromTime) || dateTo && isNaN(toTime)) {
      setDateError("Invalid date format");
      return false;
    }

    // Check if dateTo is before dateFrom
    if (toTime < fromTime) {
      setDateError("Check your selected date range");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    close({
      category,
      description,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
    });
  };

  return (
    <div className="gap-6 text-sm m-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-2">Search by any of these transaction details:</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-bold">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded border px-2 py-1 outline-none"
              placeholder="e.g. Groceries"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-bold">Description</label>
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
            <label className="text-gray-600 font-bold">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded border px-2 py-1 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-bold">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded border px-2 py-1 outline-none"
            />
          </div>
        </div>
        {dateError && <div className="text-red-500 text-sm mt-2">{dateError}</div>}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-bold">Min amount</label>
            <input
              type="number"
              value={amountMin}
              onChange={(e) => {
                const value = e.target.value;
                setAmountMin(value === "" || !isNaN(Number(value)) ? value : "");
              }}
              className="rounded border px-2 py-1 outline-none"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-bold">Max amount</label>
            <input
              type="number"
              value={amountMax}
              onChange={(e) => {
                const value = e.target.value;
                setAmountMax(value === "" || !isNaN(Number(value)) ? value : "");
              }}
              className="rounded border px-2 py-1 outline-none"
              placeholder="1000"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col justify-end">
            <Button
              onClick={() =>
                close({
                  category: "",
                  description: "",
                  dateFrom: "",
                  dateTo: "",
                  amountMin: "",
                  amountMax: "",
                })
              }
              className="px-3"
            >
              Cancel
            </Button>
          </div>
          <div className="flex flex-col justify-end">
            <Button type="submit" className="px-3">
              Search
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
