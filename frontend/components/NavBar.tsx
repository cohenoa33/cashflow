"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import Button from  "@/components/ui/Button"

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm text-primary ${
      pathname === href ? " font-extrabold" : " hover:text-accent "
    }`;

  return (
    <nav className="w-full bg-gray shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/accounts" className="text-lg font-semibold text-success">
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
        {/* TODO: change this to be dropdown with option to profile/ logout */}
    
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </nav>
  );
}
