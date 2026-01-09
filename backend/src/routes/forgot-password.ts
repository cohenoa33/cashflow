import "dotenv/config";
import crypto from "crypto";
import { prisma } from "../prisma/client";
import { Request, Response } from "express";
import { sendEmail, generatePasswordResetEmail } from "../utils/email";


export async function forgotPasswordRoute(req: Request, res: Response) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return res.json({
        message:
          "If an account with that email exists, a password reset link has been sent."
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 15 minutes
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send email with reset link
    const emailOptions = generatePasswordResetEmail(
      email,
      resetToken,
      "http://localhost:3000"
    );
    await sendEmail(emailOptions);

    return res.json({
      message:
        "If an account with that email exists, a password reset link has been sent."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred processing your request" });
  }
}
