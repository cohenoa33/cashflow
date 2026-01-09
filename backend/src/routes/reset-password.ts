import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { Request, Response } from "express";
import { PASSWORD_REGEX } from "../helpers/password";

export async function resetPasswordRoute(req: Request, res: Response) {
  const { token, newPassword } = req.body || {};

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include a lowercase letter, an uppercase letter, a number, and a special character"
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date() 
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.json({
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred processing your request" });
  }
}
