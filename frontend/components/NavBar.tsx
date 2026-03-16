"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import Button from  "@/components/ui/Button"

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
  }

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
      pathname === href
        ? "bg-black/10 font-semibold text-fg"
        : "text-fg/70 hover:text-fg hover:bg-black/5"
    }`;

  return (
    <nav className="w-full bg-brand/80 backdrop-blur-sm border-b border-black/10 sticky top-0 z-40">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/accounts" className="text-base font-bold tracking-tight text-fg">
            Cashflow
          </Link>

          <div className="flex gap-1">
            <Link href="/accounts" className={linkClass("/accounts")}>
              Accounts
            </Link>
            <Link href="/profile" className={linkClass("/profile")}>
              Profile
            </Link>
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
      </div>
    </nav>
  );
}
