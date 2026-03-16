// Auth state is driven by two cookies set by the backend:
//   cf_token    — httpOnly, holds the JWT (JS cannot read it)
//   cf_session  — readable flag that confirms a session exists

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function isLoggedIn(): boolean {
  return getCookieValue("cf_session") === "1";
}

export async function logout() {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/logout`,
    { method: "POST", credentials: "include" }
  );
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
