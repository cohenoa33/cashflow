import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "test_secret");

describe("Transactions routes", () => {
  it("POST /transactions creates and adjusts balance", async () => {
    // authorize user on account
    prismaMock.account.findFirst.mockResolvedValue({ id: 1 } as any);

    prismaMock.transaction.create.mockResolvedValue({
      id: 10,
      accountId: 1,
      amount: -20.5,
      type: "EXPENSE",
      description: "coffee",
      category: "Food",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    prismaMock.account.update.mockResolvedValue({} as any);

    const res = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        accountId: 1,
        amount: -20.5,
        type: "EXPENSE",
        description: "coffee"
      });

    expect(res.status).toBe(201);
    expect(prismaMock.account.update).toHaveBeenCalled(); // balance updated
  });

  it("GET /transactions/by-account/:id returns list", async () => {
    prismaMock.account.findFirst.mockResolvedValue({ id: 1 } as any);
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        id: 10,
        accountId: 1,
        amount: -20,
        type: "EXPENSE",
        date: new Date()
      } as any
    ]);

    const res = await request(app)
      .get("/transactions/by-account/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
