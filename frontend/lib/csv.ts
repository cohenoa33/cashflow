// lib/csv.ts
import { SortByNoError } from "@/types/api";
import Papa from "papaparse";

export type CsvTransactionRow = {
  date: string;
  amount: number;
  description: string;
  category?: string;
  id: number;
};

export function parseTransactionsCsv(
  file: File,
  maps: Map<SortByNoError, (string | number)[]>,
  hasHeader: boolean
): Promise<CsvTransactionRow[]> {
  function getIndex(num?: string | number): number {
    return isNaN(Number(num)) ? -1 : Number(num);
  }
  const dateIndex = getIndex(maps.get("date")?.[0]);
  const amountIndex = getIndex(maps.get("amount")?.[0]);
  const descIndex = getIndex(maps.get("description")?.[0]);
  const catIndex = getIndex(maps.get("category")?.[0]);

  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        try {
 
          const rows: CsvTransactionRow[] = [];

          for (let i = hasHeader ? 1 : 0; i < result.data.length; i++) {
            const row = result.data[i];
            if (!row || row.length === 0) continue;
            const dateRaw = row[dateIndex];
            const amountRaw = row[amountIndex];
            const descRaw = row[descIndex];
            const catRaw = row[catIndex];

            function parseMoney(str: string): number {
              if (!str) return 0;
              const trimmed = str.trim();
              const hasParens =
                trimmed.startsWith("(") && trimmed.endsWith(")");

              // Remove $ ( ) , characters
              const cleaned = trimmed.replace(/[$(),]/g, "");

              const value = Number(cleaned);

              if (Number.isNaN(value)) return 0;

              return hasParens ? -value : value;
            }

            function parseDate(str: string): string {
              if (!str) return "";
              const date = new Date(str);
              if (isNaN(date.getTime())) return "";

              return date.toISOString().split("T")[0];
            }

            const date = parseDate(dateRaw);
            const description = (descRaw || "").trim();
            const amount = parseMoney(amountRaw);
            const category = (catRaw || "").trim() || undefined;
            if (!amount) {
              continue; // skip empty lines
            }

            rows.push({ date, amount, description, category, id: i + 1 });
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
export function getFileHeader(
  file: File
): Promise<Map<string, (string | number)[]>> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        try {
          const map = new Map<string, (string | number)[]>();
          result.data[0].forEach((header, index) => {
            const char = indexToColumnChar(index);
            const headerStr = header.length === 0 ? char : header;
            map.set(headerStr, [index, char]);
          });

          

          resolve(map);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
}

export function indexToColumnChar(index: number): string {
  let column = "";
  let num = index + 1;

  while (num > 0) {
    num--;
    column = String.fromCharCode(65 + (num % 26)) + column;
    num = Math.floor(num / 26);
  }

  return column;
}
