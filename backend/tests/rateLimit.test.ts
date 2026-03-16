import express from "express";
import request from "supertest";
import rateLimit from "express-rate-limit";

// Build a minimal Express app with fresh limiters (not the skip:true ones from app.ts)
// so we can test the rate-limit logic without affecting other test suites.

function buildApp(max: number, windowMs = 15 * 60 * 1000) {
  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later" }
  });

  const server = express();
  server.use(express.json());
  server.post("/test", limiter, (_req, res) => res.json({ ok: true }));
  return server;
}

describe("Rate limiter middleware", () => {
  it("allows requests under the limit", async () => {
    const server = buildApp(3);
    const res = await request(server).post("/test");
    expect(res.status).toBe(200);
  });

  it("returns 429 after exceeding max attempts", async () => {
    const server = buildApp(3);

    for (let i = 0; i < 3; i++) {
      await request(server).post("/test");
    }

    const res = await request(server).post("/test");
    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
  });

  it("includes RateLimit-Limit and RateLimit-Remaining headers", async () => {
    const server = buildApp(5);
    const res = await request(server).post("/test");

    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });

  it("decrements RateLimit-Remaining with each request", async () => {
    const server = buildApp(5);

    const first = await request(server).post("/test");
    const second = await request(server).post("/test");

    const remainingAfterFirst = Number(first.headers["ratelimit-remaining"]);
    const remainingAfterSecond = Number(second.headers["ratelimit-remaining"]);

    expect(remainingAfterSecond).toBe(remainingAfterFirst - 1);
  });
});
