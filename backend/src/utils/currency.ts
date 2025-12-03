// Common currencies with symbol + name
export const CurrencyList = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "ILS", symbol: "₪", name: "Israeli New Shekel" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" }
] as const;

// Fast lookup dictionaries
export const CurrencySymbols: Record<string, string> = Object.fromEntries(
  CurrencyList.map((c) => [c.code, c.symbol])
);

export const CurrencyNames: Record<string, string> = Object.fromEntries(
  CurrencyList.map((c) => [c.code, c.name])
);

// A safe formatter using Intl.NumberFormat
export function formatCurrency(
  amount: number,
  currency: string,
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      ...options
    }).format(amount);
  } catch {
    // fallback if currency code is invalid
    const symbol = CurrencySymbols[currency] || "";
    return `${symbol}${amount}`;
  }
}
