import "dotenv/config";
import express from "express";
import cors from "cors";
import { registerRoute } from "./routes/register";
import { loginRoute } from "./routes/login";
import transactionRouter from "./routes/transactions";
import accountRouter from "./routes/accounts";
import { requireAuth } from "./authentication";
import { userRoute, updateUserRoute, changePasswordRoute } from "./routes/user";

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

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

export default app;
