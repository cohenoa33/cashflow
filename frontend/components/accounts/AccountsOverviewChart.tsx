"use client";

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
    current: a.currentBalance,
    forecast: a.forecastBalance ?? a.currentBalance
  }));

  return (
    <div className="rounded-md border bg-white p-4">
      <h2 className="mb-2 text-lg font-medium">Accounts overview</h2>
      <p className="mb-4 text-xs text-slate-500">
        Current vs forecast balances per account
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 20, bottom: 30 }}
          >
            <XAxis dataKey="name" angle={-20} textAnchor="end" height={40} />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* ✅ Current = green */}
            <Bar dataKey="current" name="Current" fill="#47d5a6" />
            <Bar dataKey="forecast" name="Forecast" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
