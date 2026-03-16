import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { Request, Response } from "express";
import { setAuthCookies } from "../authentication";


export async function loginRoute(req:Request, res:Response) {
    const { email, password } = req.body || {};


    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
  
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  
    setAuthCookies(res, user.id);
    return res.json({ ok: true });
}


