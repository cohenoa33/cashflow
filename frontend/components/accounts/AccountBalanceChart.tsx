"use client";
import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ComposedChart,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Bar,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import { api } from "@/lib/api";
import type { BalancePoint } from "@/types/api";
import { handleError } from "@/lib/error";
import { moneyTick } from "@/lib/money";

export default function AccountBalanceChart({
  accountId,
  currency,
  refreshKey
}: {
  accountId: number;
  currency: string;
  refreshKey: number;
}) {
  const [data, setData] = useState<BalancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Loads the account balance history from the API.
     * 
     * Fetches the balance history for the current account and stores the last 90 days of data.
     * 
     * @async
     * @returns {Promise<void>}
     * 
     * @remarks
     * Currently slices the response to the last 90 days of data. This should be updated to 30 days
     * once the backend response is modified to only return the last 30 days. The `.slice(-90)` call
     * can then be removed.
     * 
     * @throws Will set error state if the API request fails, with error duration of 5 seconds.
     */
    async function loadHistory() {
      setLoading(true);
      try {
        const res = await api<BalancePoint[]>(
          `/accounts/${accountId}/balance-history`
        );
        setData(res.slice(-90)); 
      } catch (e: unknown) {
        setError(handleError(e, 5));
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [accountId, refreshKey]);
  if (loading) return <p>Loading chart…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (data.length === 0) return <></>;

  return (
    <div className="h-96 w-full focus:outline-none focus-visible:outline-none ">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(n) => moneyTick(n, currency)} />
          <Tooltip formatter={(v) => moneyTick(Number(v), currency)} />

          {/* dashed zero baseline */}
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="6 4" />

          {/* bars */}
          <Bar
            dataKey="income"
            fill="#d7ac61"
            radius={[6, 6, 0, 0]}
            barSize={18}
          />
          <Bar
            dataKey="expense"
            fill="#d76161"
            radius={[6,6,0,0]}
            barSize={18}
          />

          {/* line */}
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#22946e"
            strokeWidth={3}
            dot={false}
          />
          <RechartsDevtools />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
