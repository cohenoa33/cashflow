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
};


export type BalancePoint = {
  date: string; 
  balance: number;
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

type Tx = {
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
