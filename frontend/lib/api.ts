// lib/api.ts
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

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store"
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/forgot-password";

      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    let message = res.statusText;
    try {
      const j = await res.json();
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
