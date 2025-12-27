import {  toYmd } from "./date";
import { BalanceSummary, DailyBalancePoint } from "../types";
import { Decimal } from "@prisma/client/runtime/library";
import { Account } from "@prisma/client";



export function makeAccountWithSummary(
  account: Account,
  summary: BalanceSummary
) {
  return {
    ...account,
    currentBalance: summary.currentBalance,
    forecastBalance: summary.forecastBalance,
    dailySeries: summary.dailySeries
  };
}

export function buildAccountDailySummaries(
  txs: { amount: Decimal; date: Date; type: string }[],
  startingBalance: number | string | Decimal
): BalanceSummary {
  const start = Number(startingBalance ?? 0);

  const dailySeries: DailyBalancePoint[] = [];
  let balance = start;

  let currentDateKey: string | null = null;
  let currentIncome = 0;
  let currentExpense = 0;

  const todayKey = toYmd(new Date());

  let currentBalance = start;


  const finalizeDay = (dayKey: string) => {
    balance = balance + currentIncome + currentExpense;
    dailySeries.push({
      date: dayKey,
      balance,
      income: currentIncome,
      expense: currentExpense
    });
    if (dayKey <= todayKey) {
      currentBalance = balance;
    }
    currentIncome = 0;
    currentExpense = 0;
  };

  for (const tx of txs) {
    const dayKey = toYmd(tx.date);
    const value = Number(tx.amount ?? 0);

    if (currentDateKey === null) {
      currentDateKey = dayKey;
    }

    if (dayKey !== currentDateKey) {
      finalizeDay(currentDateKey);
      currentDateKey = dayKey;
    }

    if (tx.type === "income") currentIncome += value;
    else if (tx.type === "expense") currentExpense += value;
    
  }

  // finalize last day
  if (currentDateKey !== null) {
    finalizeDay(currentDateKey);
  }

  const forecastBalance =
    dailySeries.length > 0
      ? dailySeries[dailySeries.length - 1].balance
      : start;


  return {
    currentBalance,
    forecastBalance,
    dailySeries
  };
}
