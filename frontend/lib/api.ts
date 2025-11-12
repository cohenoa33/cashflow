import { getToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

 if (!res.ok) {
  if (res.status === 401) {

    if (typeof window !== "undefined") {
      localStorage.removeItem("cf_token");
      window.location.href = "/login";
    }
  }
  let message = res.statusText;
  try {
    const j = await res.json();
    message = j.error || message;
  } catch {}
  throw new Error(message);
}

return await res.json() as T;
}