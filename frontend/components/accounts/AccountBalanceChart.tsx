"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  CartesianGrid
} from "recharts";
import { api } from "@/lib/api";
import type { BalancePoint } from "@/types/api";
import { handleError } from "@/lib/error";

export default function AccountBalanceChart({ accountId }: { accountId: number }) {
  const [data, setData] = useState<BalancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api<BalancePoint[]>(
          `/accounts/${accountId}/balance-history`
        );
        setData(res);
      } catch (e: unknown) {
        setError( handleError(e, 5));
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [accountId]);

  if (loading) return <p>Loading chart…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="balance" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}