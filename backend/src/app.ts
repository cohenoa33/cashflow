import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { registerRoute } from "./routes/register";
import { loginRoute } from "./routes/login";
import { forgotPasswordRoute } from "./routes/forgot-password";
import { resetPasswordRoute } from "./routes/reset-password";
import transactionRouter from "./routes/transactions";
import accountRouter from "./routes/accounts";
import { requireAuth } from "./authentication";
import { userRoute, updateUserRoute, changePasswordRoute } from "./routes/user";

const app = express();

const isTest = process.env.NODE_ENV === "test";

// Rate limiters — applied per IP before route handlers; skipped in test env
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,     // Return RateLimit-* headers
  legacyHeaders: false,
  skip: () => isTest,
  message: { error: "Too many attempts, please try again later" }
});

export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { error: "Too many password reset attempts, please try again later" }
});

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(helmet());
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// protected routers
app.use("/transactions", requireAuth, transactionRouter);
app.use("/accounts", requireAuth, accountRouter);
app.get("/user", requireAuth, userRoute);
app.patch("/user", requireAuth, updateUserRoute);
app.post("/user/change-password", requireAuth, passwordLimiter, changePasswordRoute);
// public
app.get("/health", (_req, res) => res.json({ ok: true }));
app.post("/register", authLimiter, registerRoute);
app.post("/login", authLimiter, loginRoute);
app.post("/forgot-password", passwordLimiter, forgotPasswordRoute);
app.post("/reset-password", passwordLimiter, resetPasswordRoute);
app.post("/logout", (_req, res) => {
  const secure = process.env.NODE_ENV === "production";
  res.clearCookie("cf_token",   { path: "/", httpOnly: true,  secure, sameSite: "strict" });
  res.clearCookie("cf_session", { path: "/", httpOnly: false, secure, sameSite: "strict" });
  res.json({ ok: true });
});

export default app;
