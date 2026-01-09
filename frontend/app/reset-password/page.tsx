"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { validPassword, validatePassword } from "@/lib/password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [disable, setDisable] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newTouched, setNewTouched] = useState(false);

  useEffect(() => {
    if (!token) {
      setErr("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);
  


  const invalid = password.length > 0 && newTouched && !validPassword(password);
  const same = password === confirmPassword;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!token) {
      setErr("Invalid reset link");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErr(passwordError);
      return;
    }

    setBusy(true);

    try {
      await api("/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password })
      });
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      setErr(handleError(error, 1));
      if (error instanceof Error && error.message === "Invalid or expired reset token") {
        setDisable(true)
        // If the token is invalid or expired, redirect to forgot-password page after showing the error
        setTimeout(() => {
          router.push("/forgot-password");
        }, 5000);
      }

    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold">Password Reset Successful</h1>
          <p className="text-sm text-gray-600">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow"
      >
        <h1 className="text-2xl font-semibold">Reset Password</h1>

        <p className="text-sm text-gray-600">Enter your new password below.</p>

        <label className="block">
          <span className="text-sm">New Password</span>
          <PasswordInput
            maxHeight
            value={password}
            onChange={(v) => {
              setPassword(v);
              setNewTouched(true);
            }}
            invalid={invalid}
            placeholder="••••••••"
            disabled={busy || !token || disable}
          />
        </label>

        <label className="block">
          <span className="text-sm">Confirm Password</span>
          <PasswordInput
            maxHeight
            value={confirmPassword}
            onChange={(v) => setConfirmPassword(v)}
            invalid={!same}
            placeholder="••••••••"
            disabled={busy || !token || disable}
          />
        </label>
        <p
          className={`mt-1 text-xs ${
            invalid ? "text-danger" : "text-stale-500"
          }`}
        >
          At least 8 characters, with uppercase, lowercase, number, and a
          special character.
        </p>
        {err && <p className="text-sm text-red-600">{err}</p>}

        <Button
          disabled={busy || !token || disable || !same}
          type="submit"
          className="w-full text-base"
        >
          {busy ? "Resetting..." : "Reset Password"}
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
