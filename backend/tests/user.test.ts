// tests/user.test.ts
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";
import bcrypt from "bcrypt";

const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "test_secret");

// Simple manual mock, don't fight TS here
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("User routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /user returns current user profile", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      firstName: "Test",
      lastName: "User",
      createdAt: new Date(),
      updatedAt: new Date(),
      password: "hashed-pass"
    } as any);

    const res = await request(app)
      .get("/user")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      email: "test@example.com",
      firstName: "Test",
      lastName: "User"
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
  });

  it("PATCH /user updates first and last name", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      firstName: "Test",
      lastName: "User",
      createdAt: new Date()
    } as any);

    prismaMock.user.update.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "NewFirst NewLast",
      firstName: "NewFirst",
      lastName: "NewLast",
      createdAt: new Date()
    } as any);

    const res = await request(app)
      .patch("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "NewFirst",
        lastName: "NewLast",
        id: 1
      });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("NewFirst");
    expect(res.body.lastName).toBe("NewLast");

    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);

    const callArg = prismaMock.user.update.mock.calls[0][0];

    expect(callArg.data).toMatchObject({
      firstName: "NewFirst",
      lastName: "NewLast"
    });
  });

  it("PATCH /user rejects when id does not match userId", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      firstName: "Test",
      lastName: "User"
    } as any);

    const res = await request(app)
      .patch("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "NewFirst",
        lastName: "NewLast",
        id: 999
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("user not found");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("PATCH /user rejects when no fields provided", async () => {
    const res = await request(app)
      .patch("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ id: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("no fields to update");
  });

  it("POST /user/change-password succeeds for correct current password and strong new password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      password: "old-hash"
    } as any);

    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue("new-hash");

    prismaMock.user.update.mockResolvedValue({
      id: 1,
      password: "new-hash"
    } as any);

    const res = await request(app)
      .post("/user/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "OldPass1!",
        newPassword: "NewPass1!"
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(mockedBcrypt.compare).toHaveBeenCalledWith("OldPass1!", "old-hash");
    expect(mockedBcrypt.hash).toHaveBeenCalledWith("NewPass1!", 10);
    expect(prismaMock.user.update).toHaveBeenCalled();
  });

  it("POST /user/change-password rejects weak password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      password: "old-hash"
    } as any);

    const res = await request(app)
      .post("/user/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "OldPass1!",
        newPassword: "weak" // too weak for regex
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("POST /user/change-password rejects incorrect current password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      password: "old-hash"
    } as any);

    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await request(app)
      .post("/user/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "WrongOldPass1!",
        newPassword: "NewPass1!"
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(mockedBcrypt.compare).toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});
