import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/express";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const JWT_SECRET: string = process.env.JWT_SECRET;

export function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function setAuthCookies(res: Response, userId: number) {
  const token = signToken(userId);
  const secure = process.env.NODE_ENV === "production";
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  // httpOnly — JS cannot read this; carries the actual JWT
  res.cookie("cf_token", token, { httpOnly: true, secure, sameSite: "strict", path: "/", maxAge });
  // readable flag — lets the frontend know a session exists without touching the token
  res.cookie("cf_session", "1", { httpOnly: false, secure, sameSite: "strict", path: "/", maxAge });
}


export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.cf_token ?? null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { userId: number };



    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}