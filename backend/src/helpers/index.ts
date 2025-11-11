import { prisma } from "../prisma/client";

/** Helpers */
export async function canViewAccount(userId: number, accountId: number) {
  const acc = await prisma.account.findFirst({
    where: {
      id: accountId,
      OR: [{ ownerId: userId }, { authorizedUsers: { some: { userId } } }]
    },
    select: { id: true }
  });
  return Boolean(acc);
}

export async function isOwner(userId: number, accountId: number) {
  const acc = await prisma.account.findFirst({
    where: { id: accountId, ownerId: userId },
    select: { id: true }
  });
  return Boolean(acc);
}

function endOfToday(): Date {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end;
}
export async function totalUpToToday(accountId: number) {
  const { _sum } = await prisma.transaction.aggregate({
    where: {
      accountId,
      date: { lte: endOfToday() }
    },
    _sum: { amount: true }
  });
  return Number(_sum.amount ?? 0);
}
export function affectsBalance(date: Date): boolean {
  return date <= endOfToday();
}

export async function adjustBalance(accountId: number, delta: number) {
  await prisma.account.update({
    where: { id: accountId },
    data: { currentBalance: { increment: delta } }
  });
}