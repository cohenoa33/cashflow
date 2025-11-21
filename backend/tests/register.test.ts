import request from "supertest";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

describe("POST /register", () => {
  it("creates user and returns token", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any); // no conflict
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email: "new@example.com",
      password: "hashed",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    // starter account creation
    prismaMock.account.create.mockResolvedValue({
      id: 1,
      name: "Main",
      currency: "USD",
      ownerId: 1,
      description: null,
      notes: null,
      startingBalance: "0.00" as any,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    const res = await request(app)
      .post("/register")
      .send({ email: "new@example.com", password: "pass123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(prismaMock.user.create).toHaveBeenCalled();
  });

  it("409 if email exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 7 } as any);

    const res = await request(app)
      .post("/register")
      .send({ email: "dup@example.com", password: "pass123" });

    expect(res.status).toBe(409);
  });
});

