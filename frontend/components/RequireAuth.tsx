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
  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (!loggedIn) {
      router.replace("/login");
    }
  }, [loggedIn, router]);

  if (!loggedIn) return null;
  return <>{children}</>;
}
