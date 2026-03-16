import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";

const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "test_secret");
const authCookie = `cf_token=${token}`;

// POST and PATCH now require isOwner; GET still uses canViewAccount
jest.mock("../src/helpers", () => ({
  canViewAccount: jest.fn().mockResolvedValue(true),
  isOwner: jest.fn().mockResolvedValue(true),
  affectsBalance: jest.fn().mockReturnValue(true)
}));

describe("Transactions routes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("POST /transactions creates a transaction", async () => {
    prismaMock.transaction.create.mockResolvedValue({
      id: 10,
      accountId: 1,
      amount: -20.5,
      type: "expense",
      description: "coffee",
      category: "Food",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    const res = await request(app)
      .post("/transactions")
      .set("Cookie", authCookie)
      .send({
        accountId: 1,
        amount: -20.5,
        type: "expense",
        description: "coffee"
      });

    expect(res.status).toBe(201);
  });

  it("POST /transactions returns 401 without auth cookie", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({ accountId: 1, amount: -20.5, type: "expense" });

    expect(res.status).toBe(401);
  });

  it("POST /transactions returns 403 when user is not owner", async () => {
    const { isOwner } = require("../src/helpers");
    (isOwner as jest.Mock).mockResolvedValueOnce(false);

    const res = await request(app)
      .post("/transactions")
      .set("Cookie", authCookie)
      .send({ accountId: 1, amount: -20.5, type: "expense" });

    expect(res.status).toBe(403);
  });

  it("GET /transactions/by-account/:id returns list", async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        id: 10,
        accountId: 1,
        amount: -20,
        type: "expense",
        date: new Date()
      } as any
    ]);

    const res = await request(app)
      .get("/transactions/by-account/1")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("PATCH /transactions/:id returns 403 for non-owner", async () => {
    const { isOwner } = require("../src/helpers");
    (isOwner as jest.Mock).mockResolvedValueOnce(false);

    prismaMock.transaction.findUnique.mockResolvedValue({
      id: 10,
      accountId: 1,
      amount: -20,
      type: "expense",
      date: new Date(),
      account: { id: 1, ownerId: 99 }
    } as any);

    const res = await request(app)
      .patch("/transactions/10")
      .set("Cookie", authCookie)
      .send({ description: "updated" });

    expect(res.status).toBe(403);
  });
});
