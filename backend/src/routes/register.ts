import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { Request, Response } from "express";
import { signToken } from "../authentication";


export async function registerRoute(req:Request, res:Response) {
  const { email, password, name } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email & password required" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "email already in use" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, name }
  });
    return res.json({ token: signToken(user.id) });
}


