// tests/register.test.ts
import request from "supertest";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

describe("POST /register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates user and sets httpOnly cookies when password is strong", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email: "new@example.com",
      password: "hashed-strong-pass",
      name: "New User",
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    const res = await request(app).post("/register").send({
      email: "new@example.com",
      name: "New User",
      password: "Strong1!"
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    // token must NOT be in the response body
    expect(res.body.token).toBeUndefined();

    const cookies: string[] = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find((c) => c.startsWith("cf_token="));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toMatch(/HttpOnly/i);
    expect(cookies.some((c) => c.startsWith("cf_session=1"))).toBe(true);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "new@example.com" }
    });
    expect(prismaMock.user.create).toHaveBeenCalled();
  });

  it("returns 409 if email already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "exists@example.com",
      password: "hashed"
    } as any);

    const res = await request(app).post("/register").send({
      email: "exists@example.com",
      name: "Existing User",
      password: "Strong1!"
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("returns 400 if password does not meet complexity requirements", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/register").send({
      email: "weakpass@example.com",
      name: "Weak User",
      password: "weak"
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});
