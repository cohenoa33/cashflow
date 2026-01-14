import { CsvTransactionRow } from "@/lib/csv";

export type SortDirection = "asc" | "desc";

export type RowWithState = CsvTransactionRow & { id: number; error?: string | null };
export type SortByWithError = "date" | "amount" | "category" | "description" | "error";
export type SortByNoError = "date" | "amount" | "category" | "description" 