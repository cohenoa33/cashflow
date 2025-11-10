import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_fallback_secret";

export function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
