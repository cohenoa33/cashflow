"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";

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
      <Button onClick={onDelete} disabled={busy} className="bg-danger">
        {busy ? "Deleting…" : "Delete account"}
      </Button>
     
      {err && <p className="text-sm text-danger">{err}</p>}
    </div>
  );
}
