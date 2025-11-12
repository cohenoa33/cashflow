"use client";

import RequireAuth from "@/components/RequireAuth";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function Home() {
  return (
    <RequireAuth>
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Welcome to Cashflow</h1>
          <p className="text-gray-500">You are logged in 🎉</p>
          <div className="flex items-center gap-3 justify-center">
            <Link href="/accounts" className="underline">
              Go to Accounts
            </Link>
            <LogoutButton />
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
