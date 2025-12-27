"use client";

import type { ReactNode } from "react";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";

type AppShellProps = {
  children?: ReactNode;
  className?: string;
};

export default function AppShell({ children, className = "" }: AppShellProps) {
  return (
    <RequireAuth>
      <NavBar />
      <main
        className={[
          "mx-auto max-w-4xl min-h-screen p-6 space-y-6",
          className
        ].join(" ")}
      >
        {children}
      </main>
    </RequireAuth>
  );
}
