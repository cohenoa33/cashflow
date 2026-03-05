"use client";

import { AccountRow } from "@/types/api";
import { useRouter } from "next/navigation";
import AccountsByTypeTable from "./AccountsByTypeTable";


export default function AccountsOverviewTable({
  accounts
}: {
  accounts: Record<string, AccountRow[]>;
}) {

  const router = useRouter();



  return (
    <>
      <section>
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
{Object.keys(accounts).length === 0 ? (
          <div className="p-4 text-center text-gray-500">No accounts yet.</div>
        ) : (
          Object.keys(accounts).map((type) => (
            <AccountsByTypeTable key={type} accounts={accounts[type]} type={type} />
          ))
        )}
      </section>
    </>
  );
}
