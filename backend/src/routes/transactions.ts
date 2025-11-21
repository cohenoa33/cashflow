import {  Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { prisma } from "../prisma/client";
import { canViewAccount, isOwner, affectsBalance } from "../helpers";



import { Router } from "express";

const transactionRouter = Router();
// POST /transactions
// body: { accountId, amount, type, description?, category?, date? }
transactionRouter.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const { accountId, amount, type, description, category, date } = req.body as {
    accountId: number;
    amount: number; 
    type: string;
    description?: string;
    category?: string;
    date?: string | Date;
  };

  if (!accountId || amount === undefined || !type) {
    return res.status(400).json({ error: "accountId, amount, type required" });
  }
  if (!(await canViewAccount(req.userId, accountId))) {
    return res.status(404).json({ error: "account not found" });
  }

  const txDate = date ? new Date(date) : new Date();
  const tx = await prisma.transaction.create({
    data: {
      accountId,
      amount,
      type,
      description,
      category,
      date: txDate
    }
  });



  res.status(201).json(tx);
});

// PATCH /transactions/:id
// body: any subset of { amount, type, description, category, date }
transactionRouter.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

  const existing = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true }
  });
  if (!existing)
    return res.status(404).json({ error: "transaction not found" });
  if (!(await canViewAccount(req.userId, existing.accountId))) {
    return res.status(403).json({ error: "forbidden" });
  }

  // compute balance delta according to your rule (date <= today)
  const prevAmt = Number(existing.amount);
  const prevAffects = affectsBalance(existing.date);

  const nextDate = req.body.date ? new Date(req.body.date) : existing.date;
  const nextAmt =
    req.body.amount !== undefined ? Number(req.body.amount) : prevAmt;
  const nextAffects = affectsBalance(nextDate);

  // If both affect balance → delta is (next - prev)
  // If only prev affected → subtract prev
  // If only next affects → add next
  let delta = 0;
  if (prevAffects && nextAffects) delta = nextAmt - prevAmt;
  else if (prevAffects && !nextAffects) delta = -prevAmt;
  else if (!prevAffects && nextAffects) delta = nextAmt;

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      amount: req.body.amount ?? undefined,
      type: req.body.type ?? undefined,
      description: req.body.description ?? undefined,
      category: req.body.category ?? undefined,
      date: req.body.date ? nextDate : undefined
    }
  });



  res.json(updated);
});


// DELETE /transactions/:id
transactionRouter.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

  const existing = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true }
  });
  if (!existing)
    return res.status(404).json({ error: "transaction not found" });
  if (!(await isOwner(req.userId, existing.accountId))) {
    return res.status(403).json({ error: "only owner can delete" });
  }

  await prisma.transaction.delete({ where: { id } });
  res.json({ ok: true });
});


// GET /transactions/by-account/:accountId
transactionRouter.get(
  "/by-account/:accountId",
  async (req: AuthenticatedRequest, res: Response) => {
    const accountId = Number(req.params.accountId);
    if (Number.isNaN(accountId))
      return res.status(400).json({ error: "invalid accountId" });

    if (!(await canViewAccount(req.userId, accountId))) {
      return res.status(404).json({ error: "account not found" });
    }

    const items = await prisma.transaction.findMany({
      where: { accountId },
      orderBy: { date: "desc" }
    });

    res.json(items);
  }
);


// GET /transactions/:id
transactionRouter.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { account: { select: { id: true, ownerId: true } } }, 
  });
  if (!tx) return res.status(404).json({ error: "transaction not found" });
  if (!(await canViewAccount(req.userId, tx.accountId))) {
    return res.status(403).json({ error: "forbidden" });
  }

  res.json(tx);
});

export default transactionRouter;
