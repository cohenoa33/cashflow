"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";

type User = {
  id: number;
  email: string;
  name?: string | null;
  createdAt?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setError(null);
      setLoading(true);
      try {
        const data = await api<User>("/user");
        setUser(data);
      } catch (e) {
        // pick any new id for this error (e.g. 6)
        setError(handleError(e, 6));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);



  return (
    <RequireAuth>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>

        {loading && <p className="text-sm text-slate-500">Loading profile…</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {user && (
          <div className="space-y-1 ">
            {user.name && (
              <p>
                <span className="font-medium">Name:</span> {user.name}
              </p>
            )}
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
