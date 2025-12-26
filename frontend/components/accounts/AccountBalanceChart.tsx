"use client";
import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ComposedChart,
  Bar
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import { api } from "@/lib/api";
import type { BalancePoint } from "@/types/api";
import { handleError } from "@/lib/error";

export default function AccountBalanceChart({
  accountId,
  refreshKey
}: {
  accountId: number;
  refreshKey: number;
}) {
  const [data, setData] = useState<BalancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const res = await api<BalancePoint[]>(
          `/accounts/${accountId}/balance-history`
        );
        setData(res);
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
    <div className="h-96 w-full">
      <ComposedChart
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "70vh",
          aspectRatio: 1.618
        }}
        responsive
        data={data}
        margin={{
          top: 0,
          right: 0,
          bottom: 35,
          left: 0
        }}
      >
        <XAxis dataKey="date" scale="band" />
        <YAxis width="auto" />
        <Tooltip />
        <Bar dataKey="balance" fill="#8da397" />
        <Line type="monotone" dataKey="balance" stroke="#d7ac61" />
        <RechartsDevtools />
      </ComposedChart>
    </div>
  );
}
