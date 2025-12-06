// lib/api.ts
import { getToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
    // 401: special-case auth redirect
    if (res.status === 401 && typeof window !== "undefined") {
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthPage) {
        localStorage.removeItem("cf_token");
        window.location.href = "/login";
      }
    }

    let message = res.statusText;
    try {
      const j = await res.json();
      // backend usually returns { error: "..." }
      if (j && typeof j.error === "string") {
        message = j.error;
      }
    } catch {
      // ignore JSON parse error, keep statusText
    }

    throw new ApiError(message, res.status);
  }

  return (await res.json()) as T;
}
