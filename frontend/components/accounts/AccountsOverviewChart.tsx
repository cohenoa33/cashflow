"use client";

import { moneyTick } from "@/lib/money";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export type AccountOverviewItem = {
  id: number;
  name: string;
  currency: string;
  currentBalance: number;
  forecastBalance?: number;
};

type Props = {
  accounts: AccountOverviewItem[];
};

export default function AccountsOverviewChart({ accounts }: Props) {
  if (!accounts || accounts.length === 0) {
    return null;
  }

  // Shape data for recharts
  const data = accounts.map((a) => ({
    name: a.name,
    currency: a.currency,
    current: a.currentBalance,
    forecast: a.forecastBalance ?? a.currentBalance
  }));

  return (
    <div className="rounded-md border p-4">
      <h2 className="mb-2 text-lg font-bold">Accounts overview</h2>
      <p className="mb-4 text-xs text-accent">
        Current vs forecast balances per account
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 20, bottom: 30 }}
          >
            <XAxis
              dataKey="name"
              angle={-20}
              textAnchor="end"
              height={40}
              tickFormatter={(name, idx) =>
                `${name} (${data[idx]?.currency ?? "USD"})`
              }
            />
            <YAxis />

            <Tooltip
              formatter={(value, _name, props) => {
                const rowCurrency = props?.payload?.currency ?? "USD";
                return moneyTick(Number(value), rowCurrency);
              }}
              labelFormatter={(label, payload) => {
                const rowCurrency =
                  Array.isArray(payload) && payload[0]?.payload?.currency
                    ? payload[0].payload.currency
                    : "USD";
                return `${label} (${rowCurrency})`;
              }}
            />

            <Legend />

            <Bar dataKey="current" name="Current" fill="#5f6160" />
            <Bar dataKey="forecast" name="Forecast" fill="#919392" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
