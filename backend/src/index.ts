import "dotenv/config";
import express from "express";
import cors from "cors";
import { registerRoute } from "./routes/register";
import { loginRoute } from "./routes/login";


const app = express();

const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";


app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());


app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/register", registerRoute);
app.post("/login", loginRoute);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

