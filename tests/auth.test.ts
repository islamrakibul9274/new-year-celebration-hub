import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";

process.env.AUTH_SECRET = process.env.AUTH_SECRET || "unit-test-secret";

describe("JWT session logic", () => {
  const payload = {
    userId: "abc123",
    email: "vip@example.com",
    name: "VIP Tester",
    plan: "silver",
  };

  it("signs and verifies a token round-trip", async () => {
    const { signToken, verifyToken } = await import("@/lib/auth");
    const token = signToken(payload, 60);
    const decoded = verifyToken(token);
    expect(decoded?.userId).toBe("abc123");
    expect(decoded?.plan).toBe("silver");
    expect(decoded?.email).toBe("vip@example.com");
  });

  it("rejects tampered tokens", async () => {
    const { signToken, verifyToken } = await import("@/lib/auth");
    const token = signToken(payload, 60);
    const tampered = `${token.slice(0, -3)}xyz`;
    expect(verifyToken(tampered)).toBeNull();
  });

  it("rejects tokens signed with a different secret", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const foreign = jwt.sign(payload, "someone-elses-secret", { expiresIn: 60 });
    expect(verifyToken(foreign)).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const { signToken, verifyToken } = await import("@/lib/auth");
    const expired = jwt.sign(payload, process.env.AUTH_SECRET as string, { expiresIn: -10 });
    expect(verifyToken(expired)).toBeNull();
  });
});
