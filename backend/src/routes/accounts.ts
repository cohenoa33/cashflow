import { Response, Request } from "express";
import { prisma } from "../prisma";
import { canViewAccount, isOwner, totalUpToToday } from "../helpers";
import { Router } from "express";

export const accountRouter = Router();

/**
 * POST /accounts
 * Create account — requester becomes the owner
 */
accountRouter.post("/", async (req: Request, res: Response) => {

  const {
    name,
    currency = "USD",
    description,
    notes,
    startingBalance = 0
  } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });

  const account = await prisma.account.create({
    data: {
      name,
      currency,
      description,
      notes,
      startingBalance,
      currentBalance: startingBalance,
      ownerId: req.userId
    }
  });

  res.status(201).json({account});
});

/**
 * GET /accounts
 * List accounts where the user is owner OR authorized
 */
accountRouter.get("/", async (req: Request, res: Response) => {
  const accounts = await prisma.account.findMany({
    where: {
      OR: [
        { ownerId: req.userId },
        { authorizedUsers: { some: { userId: req.userId } } }
      ]
    },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      currency: true,
      ownerId: true,
      description: true,
      notes: true,
      startingBalance: true,
      currentBalance: true,
      createdAt: true,
      updatedAt: true, transactions: true
    }
  });



  res.json(accounts);
});

/**
 * GET /accounts/:id
 * Get single account (owner or authorized)
 */
accountRouter.get("/:id", async (req: Request, res: Response) => {
  const accountId = Number(req.params.id);
  if (Number.isNaN(accountId))
    return res.status(400).json({ error: "invalid id" });

  if (!(await canViewAccount(req.userId, accountId))) {
    return res.status(404).json({ error: "account not found" });
  }

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      authorizedUsers: { select: { userId: true } },
      transactions: true
    }
  });

  if (!account) return res.status(404).json({ error: "account not found" });



  res.json(account);
});

/**
 * PATCH /accounts/:id
 * Edit account — owner only
 */
accountRouter.patch("/:id", async (req: Request, res: Response) => {
  const accountId = Number(req.params.id);
  if (Number.isNaN(accountId))
    return res.status(400).json({ error: "invalid id" });

  if (!(await isOwner(req.userId, accountId))) {
    return res.status(403).json({ error: "only owner can edit this account" });
  }

  const { name, currency , notes, description} = req.body || {};
  const data: any = {};
  if (notes !== undefined) data.notes = notes;
  if (description !== undefined) data.description = description;
  if (name !== undefined) data.name = name;
  if (currency !== undefined) data.currency = currency;

  const updated = await prisma.account.update({
    where: { id: accountId },
    data, include: {transactions: true}
  });

  res.json(updated);
});

/**
 * DELETE /accounts/:id
 * Delete account — owner only
 */
accountRouter.delete("/:id", async (req: Request, res: Response) => {
  const accountId = Number(req.params.id);
  if (Number.isNaN(accountId))
    return res.status(400).json({ error: "invalid id" });

  if (!(await isOwner(req.userId, accountId))) {
    return res
      .status(403)
      .json({ error: "only owner can delete this account" });
  }

  // ensure cleanup of related data (join table has onDelete: Cascade; transactions we delete explicitly)
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { accountId } }),
    prisma.accountAuthorizedUser.deleteMany({ where: { accountId } }),
    prisma.account.delete({ where: { id: accountId } })
  ]);

  res.json({ ok: true });
});

export default accountRouter;

