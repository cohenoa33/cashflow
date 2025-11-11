import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "test_secret");

describe("Accounts routes", () => {
  it("GET /accounts returns list", async () => {
    prismaMock.account.findMany.mockResolvedValue([
      {
        id: 1,
        name: "Main",
        currency: "USD",
        ownerId: 1,
        description: null,
        notes: null,
        startingBalance: "0.00" as any,
        currentBalance: "0.00" as any,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    ]);

    // when your accounts route computes totals via aggregate
    prismaMock.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 100 }
    } as any);

    const res = await request(app)
      .get("/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /accounts creates one", async () => {
    prismaMock.account.create.mockResolvedValue({
      id: 2,
      name: "Savings",
      currency: "USD",
      ownerId: 1,
      description: "desc",
      notes: "notes",
      startingBalance: "100.00" as any,
      currentBalance: "100.00" as any,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    const res = await request(app)
      .post("/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Savings",
        startingBalance: 100,
        description: "desc",
        notes: "notes"
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Savings");
  });
});
