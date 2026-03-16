import request from "supertest";
import bcrypt from "bcrypt";
import app, { authLimiter, passwordLimiter } from "../src/app";
import prismaMock from "./__mocks__/prisma";

const TEST_IP = "::ffff:127.0.0.1";

beforeEach(() => {
  // Reset rate-limit counters between tests so they don't bleed into each other
  authLimiter.resetKey(TEST_IP);
  passwordLimiter.resetKey(TEST_IP);
  jest.clearAllMocks();
});

describe("Rate limiting on /login", () => {
  it("returns 429 after exceeding 10 attempts within the window", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any);

    // Exhaust the limit (10 allowed)
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post("/login")
        .send({ email: "x@example.com", password: "wrong" });
    }

    // 11th request must be rate-limited
    const res = await request(app)
      .post("/login")
      .send({ email: "x@example.com", password: "wrong" });

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
  });

  it("includes RateLimit headers in the response", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any);

    const res = await request(app)
      .post("/login")
      .send({ email: "x@example.com", password: "wrong" });

    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });
});

describe("Rate limiting on /register", () => {
  it("returns 429 after exceeding 10 attempts within the window", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any);
    prismaMock.user.create.mockResolvedValue({
      id: 1, email: "t@e.com", password: "h", name: null,
      createdAt: new Date(), updatedAt: new Date()
    } as any);

    for (let i = 0; i < 10; i++) {
      await request(app)
        .post("/register")
        .send({ email: `u${i}@example.com`, password: "Strong1!" });
    }

    const res = await request(app)
      .post("/register")
      .send({ email: "over@example.com", password: "Strong1!" });

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
  });
});

describe("Rate limiting on /forgot-password", () => {
  it("returns 429 after exceeding 5 attempts within the window", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any);

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/forgot-password")
        .send({ email: "x@example.com" });
    }

    const res = await request(app)
      .post("/forgot-password")
      .send({ email: "x@example.com" });

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
  });
});
