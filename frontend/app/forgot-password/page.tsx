"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import { validEmail } from "@/lib/email";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
   if (!validEmail(email) ) {
      setErr("Please enter a valid email");
      return;
     }
    
    setErr(null);
    setSuccess(false);
    setBusy(true);

    try {
    await api<{ token: string }>("/forgot-password", {
              method: "POST",
              body: JSON.stringify({ email })
            });

      setSuccess(true);
      setEmail("");
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
        <h1 className="text-2xl font-semibold">Forgot Password</h1>

        <p className="text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>

        <label className="block">
          <span className="text-sm">Email</span>
          <input
            className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-0"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="me@example.com"
            required
            disabled={busy || success}
          />
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-800">
              If an account with that email exists, a password reset link has
              been sent. Please check your email.
            </p>
          </div>
        )}

        <Button
          disabled={busy || success}
          type="submit"
          className="w-full text-base"
        >
          {busy ? "Sending..." : "Send Reset Link"}
        </Button>

        <p className="text-sm text-center">
          Remember your password?{" "}
          <a className="underline" href="/login">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
