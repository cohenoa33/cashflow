"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";


export default function DeleteAccountButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onDelete() {
    if (!isOpen) return;
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
      {/* conform delete modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-label={"Delete account " + name}
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop (dismissable by click) */}
          <div className="absolute inset-0 bg-gray-500/50 -mt-[50px]" />

          {/* Dialog */}
          <div
            className="relative z-10 w-full max-w-xl rounded-xl bg-accent p-4 shadow-xl text-primary"
            // prevent closing when clicking inside
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Delete account {name}</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-8 text-primary">
              <p>
                Are you sure you want to delete the account {name}?
                <br />
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={onDelete}
                  disabled={!isOpen || busy}
                  className="w-full"
                  variant="danger"
                >
                  I want to delete this account{" "}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(true)}
        disabled={busy}
        className="bg-danger"
      >
        {busy ? "Deleting…" : "Delete account"}
      </Button>

      {err && <p className="text-sm text-danger">{err}</p>}
    </div>
  );
}
