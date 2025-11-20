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

  useEffect(() => {
    // This runs only on the client after hydration
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [router]);

  // Always render children; if the user is not logged in, they’ll be
  // redirected right after hydration. Backend still enforces auth.
  return <>{children}</>;
}
