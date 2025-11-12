"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { handleError } from "@/lib/error";

export default function RegisterPage() {
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
      const res = await api<{ token: string }>("/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      saveToken(res.token);
      router.push("/");
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
        <h1 className="text-2xl font-semibold">Create account</h1>

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
          <input
            className="mt-1 w-full rounded-lg border p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {busy ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <a className="underline" href="/login">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
