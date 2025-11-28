// tests/register.test.ts
import request from "supertest";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

describe("POST /register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates user and returns token when password is strong", async () => {
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
      // Strong password: 8+ chars, lower, upper, number, special
      password: "Strong1!"
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
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
  });

  it("returns 400 if password does not meet complexity requirements", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/register").send({
      email: "weakpass@example.com",
      name: "Weak User",
      password: "weak" // too weak for regex
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    // user.create should not be called with an invalid password
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});
