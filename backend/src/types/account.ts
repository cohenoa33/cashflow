export type DailyBalancePoint = {
  date: string; // "YYYY-MM-DD"
  balance: number;
};

export type BalanceSummary = {
  currentBalance: number;
  forecastBalance: number;
  dailySeries: DailyBalancePoint[];
};
