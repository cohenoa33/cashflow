// backend/src/routes/user.ts

import type { AuthenticatedRequest } from "../types/express";
import { Response } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";
import { PASSWORD_REGEX } from "../helpers/password";

// GET /user – current profile
export async function userRoute(req: AuthenticatedRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.json(user);
}

// PATCH /user – update firstName / lastName (and optional name if you want)
export async function updateUserRoute(req: AuthenticatedRequest, res: Response) {
  const { firstName, lastName, id} = req.body || {};

  if (
    firstName === undefined &&
    lastName === undefined   ) {
    return res.status(400).json({ error: "no fields to update" });
  }

   const user = await prisma.user.findUnique({
     where: { id: req.userId },
     select: {
       firstName: true,
       lastName: true
     }
   });

   if (!user || req.userId !== id) {
     return res.status(404).json({ error: "user not found" });
   }


  // Helper function to create full name from firstName and lastName
function makeFullName(firstName: string, lastName: string): string {
  const parts = [
    firstName?.charAt(0).toUpperCase() + firstName?.slice(1).toLowerCase() ||
      "",
    lastName?.charAt(0).toUpperCase() + lastName?.slice(1).toLowerCase() || ""
  ];
  return parts.filter(Boolean).join(" ");
}
    const name = makeFullName(firstName, lastName);
  const updated = await prisma.user.update({
    where: { id },
    data: {
     firstName, lastName, name
    },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  return res.json(updated);
}

// POST /user/change-password
export async function changePasswordRoute(
  req: AuthenticatedRequest,
  res: Response
) {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "currentPassword and newPassword are required" });
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include a lowercase letter, an uppercase letter, a number, and a special character",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return res.status(401).json({ error: "current password is incorrect" });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hash },
  });

  return res.json({ ok: true });
}