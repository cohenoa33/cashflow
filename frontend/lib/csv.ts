 // lib/csv.ts
import Papa from "papaparse";

export type CsvTransactionRow = {
  date: string;
  amount: number;
  description: string;
  category?: string;
};

export function parseTransactionsCsv(file: File): Promise<CsvTransactionRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        try {
          // Expecting columns:
          // Col A: date
          // Col B: amount
          // Col C: description
          // Col D: category (optional)
          const rows: CsvTransactionRow[] = [];

          for (let i = 0; i < result.data.length; i++) {
            const row = result.data[i];
            if (!row || row.length === 0) continue;

            const [dateRaw, amountRaw, descRaw, catRaw] = row;

function parseMoney(str: string): number {
  if (!str) return 0;

  const trimmed = str.trim();
  const hasParens = trimmed.startsWith("(") && trimmed.endsWith(")");

  // Remove $ ( ) , characters
  const cleaned = trimmed.replace(/[$(),]/g, "");

  const value = Number(cleaned);

  if (Number.isNaN(value)) return 0;

  return hasParens ? -value : value;
}
            
            const date = (dateRaw || "").trim();
            const description = (descRaw || "").trim();
            const amount = parseMoney(amountRaw);
            const category = (catRaw || "").trim() || undefined;
            // We’ll do deeper validation in the component; here we just map.
            if (!amount) {
              continue; // skip empty lines
            }

            rows.push({ date, amount, description, category });
          }

          resolve(rows);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
}