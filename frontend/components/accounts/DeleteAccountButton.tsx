"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";

export default function DeleteAccountButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onDelete() {
    if (!confirm("Delete this account? This cannot be undone.")) return;
    try {
      setErr(null);
      setBusy(true);
      await api(`/accounts/${id}`, { method: "DELETE" });
      router.push("/accounts");
    } catch (e) {
      setErr(handleError(e, 3));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={onDelete}
        disabled={busy}
        className="rounded-lg bg-red-500 px-4 py-2 text-white disabled:opacity-60"
      >
        {busy ? "Deleting…" : "Delete account"}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
