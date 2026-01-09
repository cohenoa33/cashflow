import request from "supertest";
import crypto from "crypto";
import bcrypt from "bcrypt";
import app from "../src/app";
import prismaMock from "./__mocks__/prisma";
import { sendEmail, generatePasswordResetEmail } from "../src/utils/email";

jest.mock("../src/utils/email", () => ({
  sendEmail: jest.fn(),
  generatePasswordResetEmail: jest.fn(
    (email: string, token: string, frontendUrl: string) => ({
      to: email,
      subject: "Reset",
      html: `<a href="${frontendUrl}/reset-password?token=${token}">reset</a>`,
      text: "reset"
    })
  )
}));

describe("POST /forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/forgot-password").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns success even when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null as any);

    const res = await request(app)
      .post("/forgot-password")
      .send({ email: "missing@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset link has been sent/i);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("stores token, expiry, and sends email when user exists", async () => {
    const mockTokenBuffer = Buffer.from("token-value");
    jest.spyOn(crypto, "randomBytes").mockReturnValue(mockTokenBuffer as any);

    prismaMock.user.findUnique.mockResolvedValue({ id: 42 } as any);
    prismaMock.user.update.mockResolvedValue({} as any);

    const res = await request(app)
      .post("/forgot-password")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset link has been sent/i);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        resetToken: mockTokenBuffer.toString("hex"),
        resetTokenExpiry: expect.any(Date)
      }
    });

    // Ensure expiry is roughly 15 minutes from now
    const updateArgs = prismaMock.user.update.mock.calls[0][0];
    const expiry: Date = updateArgs.data.resetTokenExpiry as Date;
    const diffMs = expiry.getTime() - Date.now();
    expect(diffMs).toBeGreaterThan(14 * 60 * 1000);
    expect(diffMs).toBeLessThan(16 * 60 * 1000);

    expect(generatePasswordResetEmail).toHaveBeenCalledWith(
      "user@example.com",
      mockTokenBuffer.toString("hex"),
      "http://localhost:3000"
    );
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});

describe("POST /reset-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("returns 400 when token or password missing", async () => {
    const res = await request(app).post("/reset-password").send({});

    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects weak passwords", async () => {
    const res = await request(app)
      .post("/reset-password")
      .send({ token: "abc", newPassword: "weak" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("fails when token is invalid or expired", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null as any);

    const res = await request(app)
      .post("/reset-password")
      .send({ token: "bad", newPassword: "Strong1!" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid or expired/i);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("updates password and clears token when valid", async () => {
    const now = new Date();
    prismaMock.user.findFirst.mockResolvedValue({
      id: 7,
      resetToken: "good",
      resetTokenExpiry: new Date(now.getTime() + 5 * 60 * 1000)
    } as any);

    jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve("hashed-password" as never));
    prismaMock.user.update.mockResolvedValue({} as any);

    const res = await request(app)
      .post("/reset-password")
      .send({ token: "good", newPassword: "Strong1!" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset successfully/i);

    expect(bcrypt.hash).toHaveBeenCalledWith("Strong1!", 10);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        password: "hashed-password",
        resetToken: null,
        resetTokenExpiry: null
      }
    });
  });
});
