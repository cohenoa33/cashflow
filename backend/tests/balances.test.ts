import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";
import { Decimal } from "@prisma/client/runtime/binary";
import {
  buildAccountDailySummaries,
  makeAccountWithSummary
} from "../src/helpers/accounts";

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
describe("makeAccountWithSummary", () => {
  it("should merge account with balance summary", () => {
    const account = {
      id: 1,
      name: "Checking",
      currency: "USD",
      ownerId: 1,
      description: null,
      notes: null,
      startingBalance: "1000.00" as any,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    const summary = {
      currentBalance: 1500,
      forecastBalance: 2000,
      dailySeries: [
        { date: "2025-01-01", balance: 1000, income: 0, expense: 0 },
        { date: "2025-01-02", balance: 1500, income: 500, expense: 0 }
      ]
    };

    const result = makeAccountWithSummary(account, summary);

    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("name", "Checking");
    expect(result).toHaveProperty("currentBalance", 1500);
    expect(result).toHaveProperty("forecastBalance", 2000);
    expect(result.dailySeries).toHaveLength(2);
  });
});

describe("buildAccountDailySummaries", () => {
  it("should build daily summaries with starting balance", () => {
    const txs = [
      {
        amount: new Decimal(100),
        date: new Date("2025-01-01T12:00:00Z"),
        type: "income"
      },
      {
        amount: new Decimal(-30),
        date: new Date("2025-01-02T12:00:00Z"),
        type: "expense"
      }
    ];

    const result = buildAccountDailySummaries(txs, 1000);

    expect(result.currentBalance).toBe(1070);
    expect(result.forecastBalance).toBe(1070);
    expect(result.dailySeries).toHaveLength(2);
    expect(result.dailySeries[0]).toEqual({
      date: "2025-01-01",
      balance: 1100,
      income: 100,
      expense: 0
    });
  });

  it("should distinguish current vs forecast balance", () => {
    const txs = [
      { amount: new Decimal(50), date: new Date("2025-01-01"), type: "income" },
      { amount: new Decimal(75), date: new Date("2030-01-01"), type: "income" }
    ];

    const result = buildAccountDailySummaries(txs, 100);

    expect(result.currentBalance).toBe(150);
    expect(result.forecastBalance).toBe(225);
  });

  it("should handle empty transactions", () => {
    const result = buildAccountDailySummaries([], 500);

    expect(result.currentBalance).toBe(500);
    expect(result.forecastBalance).toBe(500);
    expect(result.dailySeries).toHaveLength(0);
  });

  it("should aggregate multiple transactions on same day", () => {
    const txs = [
      {
        amount: new Decimal(100),
        date: new Date("2025-01-01T10:00:00Z"),
        type: "income"
      },
      {
        amount: new Decimal(50),
        date: new Date("2025-01-01T15:00:00Z"),
        type: "income"
      },
      {
        amount: new Decimal(-20),
        date: new Date("2025-01-01T18:00:00Z"),
        type: "expense"
      }
    ];

    const result = buildAccountDailySummaries(txs, 200);

    expect(result.dailySeries).toHaveLength(1);
    expect(result.dailySeries[0]).toEqual({
      date: "2025-01-01",
      balance: 330,
      income: 150,
      expense: -20
    });
  });
});
