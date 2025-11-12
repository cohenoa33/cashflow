"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function RequireAuth({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isClient = typeof window !== "undefined";


  useEffect(() => {
    if (!isClient) return;
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [isClient, router]);

  // Always render a stable placeholder on the server
  // and on the client until we know auth state.
  // The wrapper suppresses hydration differences.
  return (
    <div suppressHydrationWarning>
      {isClient && isLoggedIn() ? children : null}
    </div>
  );
}
