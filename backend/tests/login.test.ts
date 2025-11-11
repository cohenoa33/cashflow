
import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

describe("POST /login", () => {
  it("logs in with valid credentials", async () => {
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
    expect(res.body.token).toBeDefined();
  });

  it("rejects invalid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any);

    const res = await request(app)
      .post("/login")
      .send({ email: "x@example.com", password: "nope" });

    expect(res.status).toBe(401);
  });
});
