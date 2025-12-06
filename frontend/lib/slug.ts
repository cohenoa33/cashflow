// lib/slug.ts
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove weird chars
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/-+/g, "-"); // collapse multiple dashes
}

export function accountUrl(id: number, name: string): string {
  return `/accounts/${id}-${slugifyName(name)}`;
}
