"use client";

import { logout } from "@/lib/auth";

export default function LogoutButton() {
  return (
    <button
      onClick={logout}
      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
    >
      Logout
    </button>
  );
}
