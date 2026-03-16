"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { handleError } from "@/lib/error";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { validEmail } from "@/lib/email";
import { validPassword } from "@/lib/password";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail(email) || !validPassword(password)) {
      setErr("Please enter a valid email and password.");
      return;
    }
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
    <main className="min-h-dvh grid place-items-center p-6 bg-bg">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-fg">Cashflow</h1>
          <p className="text-sm text-fg/60">Sign in to your account</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-medium text-fg/80">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="me@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-fg/80">Password</span>
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

          <div className="text-right">
            <a
              className="text-sm text-fg/60 hover:text-fg underline underline-offset-2 transition-colors"
              href="/forgot-password"
            >
              Forgot password?
            </a>
          </div>

          {err && <p className="text-sm text-danger">{err}</p>}

          <Button disabled={busy} type="submit" className="w-full text-sm py-2.5">
            {busy ? "Signing in…" : "Sign in"}
          </Button>

          <p className="text-sm text-center text-fg/60">
            No account?{" "}
            <a className="text-fg font-medium underline underline-offset-2 hover:text-fg/80 transition-colors" href="/register">
              Create one
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
