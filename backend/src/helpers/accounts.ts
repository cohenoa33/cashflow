import { Decimal } from "@prisma/client/runtime/library";

type TxForHistory = {
  date: Date;
  amount: Decimal;
};

type BalancePoint = {
  date: string; // YYYY-MM-DD
  balance: number;
};

/**
 * Build cumulative balance per day from starting balance + ordered transactions
 */
export function buildBalanceHistory(
  startingBalance: number,
  transactions: TxForHistory[]
): BalancePoint[] {

  let running = startingBalance;
  const byDate = new Map<string, number>();

  for (const tx of transactions) {
    const isoDate = tx.date.toISOString().slice(0, 10); // YYYY-MM-DD
    const rawAmount = Number(tx.amount ?? 0);

    running += rawAmount;
    byDate.set(isoDate, running); // last tx of the day wins
  }

  // convert map back to a sorted array of { date, balance }
  const points: BalancePoint[] = Array.from(byDate.entries())
    .sort(([d1], [d2]) => (d1 < d2 ? -1 : d1 > d2 ? 1 : 0))
    .map(([date, balance]) => ({ date, balance }));

  return points;
}
