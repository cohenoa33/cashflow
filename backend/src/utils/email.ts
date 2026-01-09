
import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  });

    if (error) {
      throw new Error(error.message || "Failed to send email");
    }
}

export function generatePasswordResetEmail(
  email: string,
  resetToken: string,
  frontendUrl: string
): EmailOptions {
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #b8c3db; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested to reset your password for your Cashflow account.</p>
          <p>Click the button below to create a new password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <div class="footer">
            <p>This is an automated message from Cashflow. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

You requested to reset your password for your Cashflow account.

Click this link to create a new password:
${resetLink}

This link will expire in 15 minutes.

If you didn't request a password reset, you can safely ignore this email.
  `.trim();

  return {
    to: email,
    subject: "Reset Your Cashflow Password",
    html,
    text
  };
}
