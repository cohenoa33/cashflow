"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { handleError } from "@/lib/error";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await api<{ token: string }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      saveToken(res.token);
      router.push("/accounts"); 
    } catch (error: unknown) { 
      setErr(handleError(error, 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <label className="block">
          <span className="text-sm">Email</span>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="me@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <PasswordInput
            maxHeight
            value={password}
            onChange={(v) => {
              setPassword(v);
            }}
            invalid={false}
            placeholder="••••••••"
          />
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Button
          disabled={busy}
          type="submit"
          className="w-full text-base"
        >
          {busy ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-sm text-center">
          No account?{" "}
          <a className="underline" href="/register">
            Create one
          </a>
        </p>
      </form>
    </main>
  );
}
