"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import type { Account } from "@/types/api";
import { handleError } from "@/lib/error";
import Button from "@/components/ui/Button";
import { CurrencyList } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { accountUrl } from "@/lib/slug";

export default function AddAccountPage() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [startingBalance, setStartingBalance] = useState<string>("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  

  const [nameInvalid, setNameInvalid] = useState(false);
  const [numberInvalid, setNumberInvalid] = useState(false);  

  useEffect(() => {
    setNameInvalid(name.trim().length < 2);
  }, [name]);

  useEffect(() => {
    const num = Number(startingBalance);
    setNumberInvalid(
      startingBalance !== "" &&
        startingBalance !== "-" &&
        startingBalance !== "." &&
        Number.isNaN(num)
    );
  }, [startingBalance]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nameInvalid || numberInvalid) {
      return;
    }
  
    setErr(null);
    setBusy(true);
    try {
      const account = await api<Account>("/accounts", {
        method: "POST",
        body: JSON.stringify({
          name,
          currency,
          description: description || undefined,
          notes: notes || undefined,
          startingBalance:
            startingBalance === "" ||
            startingBalance === "-" ||
            startingBalance === "."
              ? undefined
              : Number(startingBalance)
        })
      });
      if (account.id && account.name) {
        router.push(accountUrl(account.id, account.name));
      } else {
        setErr(handleError("Failed to create account", 2));
      }
    } catch (error: unknown) {
      setErr(handleError(error, 2));
    } finally {
      setBusy(false);
    }
  }

  function numberOrNull(value: string): number | null {
    const num = Number(value);
    return !Number.isNaN(num) ? num : null;
  }

  function updateValue(sign?: "-" | "+"): string {
    const num = numberOrNull(startingBalance);
    if (num === null) return "";
    const str = sign === "+" ? num + 1 : num - 1
    return str.toString();
  }


  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Add Account</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl p-4">
        <div>
          <label className="text-sm">Name</label>
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. personal / savings"
              required
              className={`mt-1 w-full rounded-lg border p-2 outline-none  ${
                nameInvalid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300"
              }`}
            />
            {nameInvalid && (
              <p className="text-xs text-red-600 mt-1">
                Account name is required.
              </p>
            )}
          </>
        </div>

        <div>
          <label className="text-sm">Description</label>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="optional, account no. 1234 "
            className={`mt-1 w-full rounded-lg border p-2 outline-none border-slate-300 `}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Currency</label>

            <select
              className="mt-1 w-full rounded-lg border outline-none p-2 bg-white"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CurrencyList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Initial Deposit</label>
            <input
              className="mt-1 w-full rounded-lg border p-2 outline-none border-slate-300 "
              type="text"
              inputMode="decimal"
              value={startingBalance}
              maxLength={15}
              onChange={(e) => {
                let v = e.target.value;

                if (!/^[\d.-]*$/.test(v)) return;
                if (v.length > 15) return;

                const dashCount = (v.match(/-/g) || []).length;
                if (dashCount > 1) return;
                if (dashCount === 1 && v.indexOf("-") !== 0) return;

                const dotCount = (v.match(/\./g) || []).length;
                if (dotCount > 1) return;

                if (v === "" || v === "-" || v === ".") {
                  setStartingBalance(v);
                  return;
                }
                if (v === "-.") {
                  setStartingBalance("-0.");
                  return;
                }

                // Normalize ".x" to "0.x" and "-.x" to "-0.x"
                if (v.startsWith(".")) v = "0" + v;
                if (v.startsWith("-.")) v = v.replace("-.", "-0.");
                if (v.length > 1 && v[0] === "0" && !v.includes(".")) {
                  setStartingBalance(v.slice(1));
                  return;
                }
                if (v.length >= 3 && v.startsWith("-0") && !v.startsWith("-0.")) {
                  const split = v.split(".");
                  const whole = Number(split[0]);
                  if(split.length===1 ) {
                    setStartingBalance(whole.toString());
                    return;
                  } else {
                    setStartingBalance([whole.toString(), split[1]].join("."));
                  }
                  return;
                }

                // IMPORTANT: keep trailing dot while typing (e.g. "12.")
                if (v.endsWith(".")) {
                  setStartingBalance(v);
                  return;
                }
                const num = Number(v);
         
                if (!Number.isNaN(num)) {
                  // 
                  setStartingBalance(v);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (
                    startingBalance === "" ||
                    startingBalance === "-" ||
                    startingBalance === "."
                  ) {
                    setStartingBalance("");
                  } else {
                    setStartingBalance(updateValue("+"));
                    return;
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (
                    startingBalance === "" ||
                    startingBalance === "-" ||
                    startingBalance === "."
                  ) {
                    setStartingBalance("-1");
                  } else {
                    setStartingBalance(updateValue("-"));
                  }
                } else if (e.key === "Backspace") {
                  e.preventDefault();
                  const s = String(startingBalance);
                  if (s.length <= 1) {
                    setStartingBalance("");
                  } else {
                    const newS = s.slice(0, -1);
             
                    if (
                      newS === "-" ||
                      newS === "." ||
                      newS === "0." ||
                      newS === "-0"
                    ) {
                      setStartingBalance(newS);
                    } else {
                      const num = Number(newS);
                      setStartingBalance(Number.isNaN(num) ? "" : String(num));

      
                    }
                  }
                }
              }}
              placeholder="0.00"
            />
          </div>
          {numberInvalid && (
            <p className="text-xs text-red-600 mt-1">number is required. {startingBalance}</p>
          )}
        </div>

        <div>
          <label className="text-sm">Notes</label>
          <textarea
            className="mt-1 w-full rounded-lg border p-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any details…"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Button disabled={busy} type="submit" className=" w-full ">
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="accent"
          type="button"
          onClick={close}
          className="w-full mt-2"
        >
          Cancel
        </Button>
      </form>
    </AppShell>
  );
}
