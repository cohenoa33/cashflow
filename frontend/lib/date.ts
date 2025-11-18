/**
 * Returns today's date formatted as YYYY-MM-DD for date inputs
 */
export function getTodayDateString(date?: Date | string): string {
  const today = date ? new Date(date) : new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Converts a YYYY-MM-DD date string to an ISO string at 10 AM local time
 */
export function dateAtTenAMLocal(dateString: string): string | undefined {
  if (!dateString) return undefined;
  const [y, m, day] = dateString.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, day ?? 1, 10, 0, 0, 0);
  return dt.toISOString();
}
