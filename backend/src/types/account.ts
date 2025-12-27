export type DailyBalancePoint = {
  date: string;
  balance: number;
  income: number;
  expense: number;
};


export type BalanceSummary = {
  currentBalance: number;
  forecastBalance: number;
  dailySeries: DailyBalancePoint[];
};
