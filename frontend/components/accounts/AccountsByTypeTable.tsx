"use client";

import { formatCurrency } from "@/lib/currency";
import { AccountRow } from "@/types/api";
import { accountUrl } from "@/lib/slug";
import { useRouter } from "next/navigation";

export default function AccountsByTypeTable({
  accounts,
  type
}: {
  accounts: AccountRow[];
  type: string;
}) {
  const router = useRouter();

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="overflow-auto rounded-lg border border-black/10 bg-white/70 mt-5">
      <table className="min-w-full text-sm">
        <thead className="bg-black/5 text-left">
          <tr className="text-fg/60">
            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">{type}</th>
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-black/5">
          {accounts.map((r) => {
            const sign = r.delta > 0 ? "up" : r.delta < 0 ? "down" : "flat";
            const deltaLabel =
              r.delta === 0
                ? ""
                : (r.delta > 0 ? "+" : "") +
                  formatCurrency(r.delta, r.currency);

            const dirClass =
              sign === "up"
                ? "text-success"
                : sign === "down"
                  ? "text-danger"
                  : "text-fg/40";

            return (
              <tr
                key={r.id}
                className="hover:bg-black/5 align-top h-[50px] cursor-pointer transition-colors duration-100"
                onClick={() => {
                  router.push(accountUrl(r.id, r.name));
                }}
              >
                <td className="px-3 py-2 max-w-[250px]">
                  <div className="text-base font-medium leading-tight break-words hover:underline">
                    {r.name}
                  </div>
                  <div className="text-xs text-fg/50 break-words mt-0.5">
                    {r.description}
                  </div>
                </td>

                <td className="px-3 py-2 whitespace-nowrap align-bottom w-[220px]">
                  <div className="text-xs text-fg/50 mb-0.5">Current</div>
                  <div className="text-base font-semibold">
                    {formatCurrency(r.currentBalance, r.currency)}
                  </div>
                </td>

                <td className="px-3 py-2 whitespace-nowrap align-bottom w-[220px]">
                  <div className="text-xs text-fg/50 mb-0.5">Forecast</div>
                  <div className="text-sm text-fg/70">
                    {formatCurrency(r.forecastBalance, r.currency)}
                  </div>
                </td>

                <td
                  className={`px-3 py-2 whitespace-nowrap font-medium text-sm ${dirClass} align-bottom`}
                >
                  {sign === "up" ? "↑ " : sign === "down" ? "↓ " : " "}
                  {deltaLabel}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
