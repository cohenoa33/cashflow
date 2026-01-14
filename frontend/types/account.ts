import type { DailyBalancePoint } from "./balance";
import type { Tx } from "./transaction";

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
