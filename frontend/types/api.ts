export type Account = {
  id: number;
  name: string;
  currency: string;
  ownerId: number;
  description?: string | null;
  notes?: string | null;
  startingBalance: number | string;
  currentBalance: number | string;
  forecastBalance: number | string;
  createdAt: string;
  updatedAt: string;
  dailySeries?: DailyBalancePoint[];
};

export type AccountRow = {
  id: number;
  name: string;
  currency: string;
  description: string;
  currentBalance: number;
  forecastBalance: number;
  delta: number;
};
export type BalancePoint = {
  date: string; 
  balance: number;
};

export type DailyBalancePoint = {
  date: string;
  balance: number;
  income: number;
  expense: number;
};


export type AccountDetail = {
  id: number;
  name: string;
  currency: string;
  description?: string | null;
  notes?: string | null;
  startingBalance: number | string;
  currentBalance: number | string;
  forecastBalance: number | string;
  transactions: Tx[];
};

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


export type SortDirection = "asc" | "desc";
export type TransactionsFilters = {
  category: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
};