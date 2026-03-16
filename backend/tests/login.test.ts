import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

describe("POST /login", () => {
  it("logs in with valid credentials and sets httpOnly cookies", async () => {
    const plain = "pass123";
    const hash = await bcrypt.hash(plain, 10);

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "me@example.com",
      password: hash,
      name: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    const res = await request(app)
      .post("/login")
      .send({ email: "me@example.com", password: plain });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    // token must NOT be in the response body
    expect(res.body.token).toBeUndefined();

    const cookies: string[] = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    // httpOnly token cookie
    const tokenCookie = cookies.find((c) => c.startsWith("cf_token="));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toMatch(/HttpOnly/i);
    // readable session-presence flag
    expect(cookies.some((c) => c.startsWith("cf_session=1"))).toBe(true);
  });

  it("rejects invalid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any);

    const res = await request(app)
      .post("/login")
      .send({ email: "x@example.com", password: "nope" });

    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});

describe("POST /logout", () => {
  it("clears auth cookies", async () => {
    const res = await request(app).post("/logout");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const cookies: string[] = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    // Both cookies should be cleared (Max-Age=0 or Expires in the past)
    const clearedToken = cookies.find((c) => c.startsWith("cf_token="));
    const clearedSession = cookies.find((c) => c.startsWith("cf_session="));
    expect(clearedToken).toBeDefined();
    expect(clearedSession).toBeDefined();
  });
});
