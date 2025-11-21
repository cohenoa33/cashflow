// src/services/balances.ts

export type TransactionLike = {
  date: Date;
  amount: number | string; // signed amount (expenses negative)
};

