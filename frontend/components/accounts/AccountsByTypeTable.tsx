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
    <div className="overflow-auto rounded-lg border bg-white/60 mt-5">
      <table className="min-w-full text-sm border border-white">
        <thead className="bg-gray-50 text-left">
          <tr className=" text-gray-600">
            <th className="px-3 py-2">{type}</th>
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {accounts.map((r) => {
            const sign = r.delta > 0 ? "up" : r.delta < 0 ? "down" : "flat";
            const deltaLabel =
              r.delta === 0
                ? ""
                : (r.delta > 0 ? "+" : "") +
                  formatCurrency(r.delta, r.currency);

            const dirClass =
              sign === "up"
                ? "text-green-700"
                : sign === "down"
                  ? "text-blue-700"
                  : "text-gray-500";

            return (
              <tr
                key={r.id}
                className="hover:bg-gray-50/60 align-top h-[50px]"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  router.push(accountUrl(r.id, r.name));
                }}
              >
                <td className="px-3 py-2 max-w-[250px]">
                  <div className="text-xl leading-tight break-words hover:underline">
                    {r.name}
                  </div>
                  <div className="text-ms text-gray-500 break-words mt-1">
                    {r.description}
                  </div>
                </td>

                <td className="px-3 py-2 whitespace-nowrap align-bottom w-[250px]">
                  <div className="flex flex-row sm:flex-row  ">
                    <div className="flex items-end ">Current Balance: </div>
                    <div className="text-xl   break-words mt-1 ml-1 sm:mt-0 ">
                      {formatCurrency(r.currentBalance, r.currency)}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-2 whitespace-nowrap align-bottom w-[250px]">
                  <div className="flex flex-row sm:flex-row  ">
                    <div className="flex items-end">Forecast: </div>
                    <div className="text-sm text-gray-500 break-words mt-1 ml-1 sm:mt-0">
                      {formatCurrency(r.forecastBalance, r.currency)}
                    </div>
                  </div>
                </td>

                <td
                  className={`px-3 py-2 whitespace-nowrap font-medium ${dirClass} align-bottom`}
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
