// backend/src/routes/user.ts
import { Response } from "express";
import { prisma } from "../prisma/client";
import type { AuthenticatedRequest } from "../types/express";

export async function userRoute(req: AuthenticatedRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.json(user);
}
