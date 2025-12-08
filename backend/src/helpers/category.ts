// backend/src/helpers/category.ts
import { prisma } from "../prisma/client";

/**
 * Given a userId and a list of descriptions,
 * returns a map from normalized description -> suggested category,
 * based on existing transactions in the DB.
 *
 * Normalization: trim + lowercase.
 */
export async function suggestCategoriesFromHistory(
  userId: number,
  descriptions: string[]
): Promise<Record<string, string>> {
  if (!descriptions.length) return {};

  // Normalize input descriptions: trim + lowercase + unique
  const normalizedList = Array.from(
    new Set(
      descriptions
        .map((d) => (d || "").trim())
        .filter(Boolean)
        .map((d) => d.toLowerCase())
    )
  );

  if (!normalizedList.length) return {};

  // Query any transaction owned by this user whose description matches (case-insensitive)
  const txs = await prisma.transaction.findMany({
    where: {
      description: {
        in: normalizedList,
        mode: "insensitive"
      },
      category: { not: null },
      account: {
        ownerId: userId
      }
    },
    select: {
      description: true,
      category: true
    }
  });

  const suggestions: Record<string, string> = {};

  for (const tx of txs) {
    if (!tx.description || !tx.category) continue;
    const key = tx.description.trim().toLowerCase();
    // first one wins; you can make this smarter (e.g. frequency) later
    if (!suggestions[key]) {
      suggestions[key] = tx.category;
    }
  }

  return suggestions;
}
