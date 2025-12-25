export function suggestCategoriesHelper(
  all: string[],
  query: string,

): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return all

  const starts = [];
  const contains = [];

  for (const c of all) {
    const v = c.toLowerCase();
    if (v.startsWith(q)) starts.push(c);
    else if (v.includes(q)) contains.push(c);
  }

  return [...starts, ...contains]
}
