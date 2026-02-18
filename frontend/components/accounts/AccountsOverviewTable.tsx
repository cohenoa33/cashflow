"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { AccountRow } from "@/types/api";
import { accountUrl } from "@/lib/slug";
import { useRouter } from "next/navigation";
import { SortButton } from "../ui/Button";

type SortKey = "name" | "current" | "forecast" | "delta";

export default function AccountsOverviewTable({
  accounts
}: {
  accounts: AccountRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("delta");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const router = useRouter();
  const rows = useMemo(() => {
    const cmp = (a: AccountRow, b: AccountRow) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          return dir * String(a.name).localeCompare(String(b.name));
        case "current":
          return dir * (a.currentBalance - b.currentBalance);
        case "forecast":
          return (
            dir *
            ((a.forecastBalance ?? a.currentBalance) -
              (b.forecastBalance ?? b.currentBalance))
          );
        case "delta":
        default:
          return dir * (a.delta - b.delta);
      }
    };

    return accounts.sort(cmp);
  }, [accounts, sortKey, sortDir]);

  function toggleSort(next: SortKey) {
    if (sortKey === next) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(next);
      setSortDir(next === "name" ? "asc" : "desc");
    }
  }

  return (
    <>
      <section >
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Accounts overview</h2>{" "}
          <div className="text-gray-600 flex justify-between mt-2 align-middle">
            <div className="text-xs">Current vs forecast per account</div>
            <button
              type="button"
              className={"underline font-semibold text-ml ml-2"}
              onClick={() => {
                router.push("/accounts/add");
              }}
            >
              Add account
            </button>
          </div>
        </div>

        <div className="overflow-auto rounded-lg border bg-white/60 ">
          <table className="min-w-full text-sm border border-white">
            <thead className="bg-gray-50 text-left">
              <tr className=" text-gray-600">
                <th className="px-3 py-2">
                  <SortButton
                    active={sortKey === "name"}
                    dir={sortDir}
                    onClick={() => toggleSort("name")}
                  >
                    Account
                  </SortButton>
                </th>
                <th className="px-3 py-2 whitespace-nowrap">
                  <SortButton
                    active={sortKey === "current"}
                    dir={sortDir}
                    onClick={() => toggleSort("current")}
                  >
                    Current
                  </SortButton>
                </th>
                <th className="px-3 py-2 whitespace-nowrap">
                  <SortButton
                    active={sortKey === "forecast"}
                    dir={sortDir}
                    onClick={() => toggleSort("forecast")}
                  >
                    Forecast
                  </SortButton>
                </th>
                <th className="px-3 py-2 whitespace-nowrap">
                  <SortButton
                    active={sortKey === "delta"}
                    dir={sortDir}
                    onClick={() => toggleSort("delta")}
                  >
                    Change
                  </SortButton>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {rows.map((r) => {
                const sign = r.delta > 0 ? "up" : r.delta < 0 ? "down" : "flat";
                const deltaLabel =
                  r.delta === 0
                    ? "0"
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
                  >
                    <td className="px-3 py-2 max-w-[250px]">
                      <div
                        className="font-medium leading-tight break-words hover:underline"
                        onClick={() => {
                          router.push(accountUrl(r.id, r.name));
                        }}
                      >
                        {r.name}
                      </div>
                      <div className="text-xs text-gray-500 break-words">
                        {r.description}
                      </div>
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatCurrency(r.currentBalance, r.currency)}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatCurrency(r.forecastBalance, r.currency)}
                    </td>

                    <td
                      className={`px-3 py-2 whitespace-nowrap font-medium ${dirClass}`}
                    >
                      {sign === "up" ? "↑ " : sign === "down" ? "↓ " : "• "}
                      {deltaLabel}
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-8 text-center text-gray-500"
                    colSpan={5}
                  >
                    No accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
