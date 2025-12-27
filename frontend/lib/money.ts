import { CurrencyList } from "./currency";

export function moneyTick(n: number, currency: string = "USD") {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  const currencyObj = CurrencyList.find((c) => c.code === currency);
  const symbol = currencyObj?.symbol ?? "$";

  if (abs >= 1000) return `${sign}${symbol}${Math.round(abs / 1000)}K`;
  return `${sign}${symbol}${abs}`;
}
