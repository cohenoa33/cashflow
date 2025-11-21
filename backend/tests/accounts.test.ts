// backend/tests/accounts.test.ts
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

jest.mock("../src/helpers", () => ({
  canViewAccount: jest.fn().mockResolvedValue(true),
  isOwner: jest.fn().mockResolvedValue(true)
}));

const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "test_secret");
prismaMock.$transaction.mockResolvedValue([
  { _sum: { amount: 50 } }, // past transactions sum
  { _sum: { amount: 75 } } // all transactions sum
]);
describe("Accounts routes with balance summary", () => {
prismaMock.$transaction.mockResolvedValue([
  { _sum: { amount: 50 } }, // past transactions sum
  { _sum: { amount: 75 } } // all transactions sum
]);

  it("POST /accounts creates one", async () => {
    prismaMock.account.create.mockResolvedValue({
      id: 2,
      name: "Savings",
      currency: "USD",
      ownerId: 1,
      description: "desc",
      notes: "notes",
      startingBalance: "100.00" as any,
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
    expect(res.body).toHaveProperty("name", "Savings");
    expect(res.body).toHaveProperty("startingBalance");
  });

  it("GET /accounts/:id returns account with full dailySeries", async () => {
    // Account with transactions so buildBalanceSummary can do its thing
    prismaMock.account.findUnique.mockResolvedValue({
      id: 5,
      name: "DailyAcc",
      currency: "USD",
      ownerId: 1,
      startingBalance: "100.00" as any,
      description: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      transactions: [
        {
          amount: 20 as any,
          date: new Date("2025-01-01T10:00:00Z")
        },
        {
          amount: -10 as any,
          date: new Date("2025-01-02T10:00:00Z")
        }
      ]
    } as any);

    const res = await request(app)
      .get("/accounts/5")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const body = res.body;

    expect(body).toHaveProperty("id", 5);
    expect(body).toHaveProperty("currentBalance");
    expect(body).toHaveProperty("forecastBalance");
    expect(body).toHaveProperty("dailySeries");

    expect(Array.isArray(body.dailySeries)).toBe(true);
    expect(body.dailySeries.length).toBe(2);
    expect(body.dailySeries[0]).toHaveProperty("date");
    expect(body.dailySeries[0]).toHaveProperty("balance");
  });
});
