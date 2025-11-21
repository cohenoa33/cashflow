"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm text-slate-100 ${
      pathname === href ? " font-extrabold" : " hover:underline"
    }`;

  return (
    <nav className="w-full border-b bg-gray shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/accounts"
            className="text-lg font-semibold text-slate-400"
          >
            Cashflow
          </Link>

          <div className="flex gap-2">
            <Link href="/accounts" className={linkClass("/accounts")}>
              Accounts
            </Link>
            <Link href="/profile" className={linkClass("/profile")}>
              Profile
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border px-3 py-1 text-sm bg-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
