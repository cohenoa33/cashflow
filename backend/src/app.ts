import "dotenv/config";
import express from "express";
import cors from "cors";
import { registerRoute } from "./routes/register";
import { loginRoute } from "./routes/login";
import { forgotPasswordRoute } from "./routes/forgot-password";
import { resetPasswordRoute } from "./routes/reset-password";
import transactionRouter from "./routes/transactions";
import accountRouter from "./routes/accounts";
import { requireAuth } from "./authentication";
import { userRoute, updateUserRoute, changePasswordRoute } from "./routes/user";

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(express.json());

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// protected routers
app.use("/transactions", requireAuth, transactionRouter);
app.use("/accounts", requireAuth, accountRouter);
app.get("/user", requireAuth, userRoute);
app.patch("/user", requireAuth, updateUserRoute);
app.post("/user/change-password", requireAuth, changePasswordRoute);
// public
app.get("/health", (_req, res) => res.json({ ok: true }));
app.post("/register", registerRoute);
app.post("/login", loginRoute);
app.post("/forgot-password", forgotPasswordRoute);
app.post("/reset-password", resetPasswordRoute);

export default app;
