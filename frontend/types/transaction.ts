export type Tx = {
  id: number;
  amount: number | string;
  type: string;
  description?: string | null;
  category?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  accountId: number;
};

export type TransactionsFilters = {
  category: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
};
