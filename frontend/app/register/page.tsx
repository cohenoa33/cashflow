"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { handleError } from "@/lib/error";
import { PASSWORD_REGEX } from "@/lib/password";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [newTouched, setNewTouched] = useState(false);

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
      router.push("/accounts");
    } catch (error: unknown) {
      setErr(handleError(error, 1));
    } finally {
      setBusy(false);
      setNewTouched(false);
    }
  }
 const invalid =password.length > 0 && newTouched && !PASSWORD_REGEX.test(password);
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
            className="mt-1 w-full rounded-lg border p-2 focus:outline-none "
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
              setNewTouched(true);
            }}
            invalid={invalid}
            placeholder="Create password"
          />
        </label>{" "}
        <p
          className={`mt-1 text-xs ${
            invalid ? "text-danger" : "text-stale-500"
          }`}
        >
          At least 8 characters, with uppercase, lowercase, number, and a
          special character.
        </p>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button disabled={busy} type="submit" className="w-full text-base">
          {busy ? "Creating..." : "Create Account"}
        </Button>
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
