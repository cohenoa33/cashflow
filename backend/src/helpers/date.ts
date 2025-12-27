export function toYmd(d: Date): string {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function endOfToday(): Date {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end;
}

