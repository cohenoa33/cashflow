export function sortItems(
  aVal: string | number,
  bVal: string | number,
  direction: 1| -1
): number {
  if (typeof aVal === "string" && typeof bVal === "string") {
    return aVal.localeCompare(bVal) * direction;
  }

  if (aVal < bVal) return -1 * direction;
  if (aVal > bVal) return 1 * direction;
  return 0;
}