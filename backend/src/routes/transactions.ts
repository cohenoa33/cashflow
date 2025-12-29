import {  Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { prisma } from "../prisma/client";
import { canViewAccount, isOwner, affectsBalance } from "../helpers";
import { suggestCategoriesFromHistory } from "../helpers/category";


import { Router } from "express";


type ImportTransactionRow = {
  date: string; // ISO or something parseable
  amount: number; // number, positive or negative
  description: string;
  category: string;
  type?: string;
};

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
  const nextDate = req.body.date ? new Date(req.body.date) : existing.date;


    let nextType = undefined;
    if (req.body.type) {
    nextType = req.body.type;
    } else if (req.body.amount !== undefined) {
    if (req.body.amount === 0) {
      return res.status(400).json({ error: "amount cannot be 0" });
    }
    nextType = req.body.amount > 0 ? "income" : "expense";
    }



  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      amount: req.body.amount ?? undefined,
      type: nextType,
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
// existing export const transactionRouter = Router();

transactionRouter.post("/import", async (req: AuthenticatedRequest, res: Response) => {
  const { accountId, rows } = (req.body || {}) as {
    accountId?: number;
    rows?: ImportTransactionRow[];
  };

  if (!accountId || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "accountId and rows are required" });
  }

  const userId = req.userId as number;

  // Ensure user can import to this account
  if (!(await canViewAccount(userId, accountId))) {
    return res.status(403).json({ error: "not allowed for this account" });
  }

  const errors: { index: number; message: string }[] = [];
  const parsedRows: ImportTransactionRow[] = [];

  rows.forEach((row, index) => {
    const date = new Date(row.date);
    const amount = Number(row.amount);
    const description = (row.description || "").trim();
    const category = (row.category || "").trim();

    if (!description) {
      errors.push({ index, message: "Description is required" });
      return;
    }
    if (!category) {
      errors.push({ index, message: "Category is required" });
      return;
    }
    if (Number.isNaN(amount)) {
      errors.push({ index, message: "Amount must be a valid number" });
      return;
    }
    if (isNaN(date.getTime())) {
      errors.push({ index, message: "Date is invalid" });
      return;
    }
const type = amount >= 0 ? "income" : "expense";
    parsedRows.push({
      date: date.toISOString(),
      amount,
      description,
      category,
      type
    });
  });

  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid rows", details: errors });
  }

  // Write to DB
  await prisma.$transaction(async (tx) => {
    await tx.transaction.createMany({
      data: parsedRows.map((row) => ({
        accountId,
        amount: row.amount,
        date: new Date(row.date),
        description: row.description,
        category: row.category, type: row.type || "expense"
      }))
    });

    // If you have account balance recomputation logic,
    // you can call it here for this account.
  });

  return res.json({ ok: true, imported: parsedRows.length });
});

transactionRouter.post(
  "/suggest-categories",
  async (req: AuthenticatedRequest, res: Response) => {
    const { rows } = (req.body || {}) as {
      rows?: { description?: string }[];
    };

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "rows required" });
    }

    const descriptions = rows
      .map((r) => r.description || "")
      .map((d) => d.trim())
      .filter(Boolean);

    const userId = req.userId as number;

    // Suggest from history for now. Later you can:
    // - Plug in an OpenAI call here
    // - Combine DB + AI suggestions
    const suggestions = await suggestCategoriesFromHistory(
      userId,
      descriptions
    );

    return res.json({ suggestions });
  }
);


export default transactionRouter;
