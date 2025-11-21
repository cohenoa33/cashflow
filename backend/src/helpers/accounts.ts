import { startOfTomorrow, toYmd } from "./date";
import { BalanceSummary, DailyBalancePoint, TransactionLike } from "../types";
import { Decimal } from "@prisma/client/runtime/library";
import { Account } from "@prisma/client";


export function buildBalanceSummary(
  startingBalance: number | string | Decimal,
  txs: {amount: Decimal, date:Date}[],
  options?: {
    today?: Date;
    fillGaps?: boolean;
    ignoreTx?: boolean;
  }
): BalanceSummary {
  const start = Number(startingBalance ?? 0);

  const today = options?.today ?? new Date();
  const tomorrowStart = startOfTomorrow(today);

  let currentBalance = start;
  let running = start; // running balance over all transactions

  const dailyMap = new Map<string, number>();

  for (const tx of txs) {
    const value = Number(tx.amount ?? 0);

    // For "current": include only tx strictly before tomorrowStart (i.e., <= today)
    if (tx.date < tomorrowStart) {
      currentBalance += value;
    }

    // For forecast + daily series: include all tx
    running += value;

    const dayKey = toYmd(tx.date); // YYYY-MM-DD
    // Last transaction of the day wins as end-of-day balance
    dailyMap.set(dayKey, running);
  }

  const forecastBalance = running;

  // Build sorted daily series
  const dailySeries: DailyBalancePoint[] = options?.ignoreTx ? [] : Array.from(dailyMap.entries())
    .sort(([d1], [d2]) => (d1 < d2 ? -1 : d1 > d2 ? 1 : 0))
    .map(([date, balance]) => ({ date, balance }));

  // Later, if you want to fill gaps, you can add option here:
  // const finalSeries = options?.fillGaps ? fillMissingDays(dailySeries) : dailySeries;

  return {
    currentBalance,
    forecastBalance,
    dailySeries
  };
}



export function makeAccountWithSummary(account: Account, summary: BalanceSummary) {
  return {
    ...account,
    currentBalance: summary.currentBalance,
    forecastBalance: summary.forecastBalance,
    dailySeries: summary.dailySeries
  };
}