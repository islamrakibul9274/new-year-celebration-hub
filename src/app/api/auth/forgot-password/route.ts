import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { isSameOrigin } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/validators";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { passwordResetEmailHtml, sendEmail } from "@/lib/mailer";

function resetUrlFor(rawToken: string): string {
  const base = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/reset-password?token=${rawToken}`;
}

export async function POST(req: Request) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const limit = rateLimit(clientKey(req, "forgot-password"), 3, 15 * 60_000);
    if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

    const body = await req.json().catch(() => null);
    const { email } = body ?? {};

    // Always answer identically so the endpoint can't be used to enumerate accounts
    const genericResponse = NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset link is on its way.",
    });

    if (!isValidEmail(email)) return genericResponse;

    const mongooseConn = await connectToDatabase();
    if (!mongooseConn) return genericResponse;

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail }).select("_id name email");
    if (!user) return genericResponse;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60_000),
    });

    await sendEmail(
      user.email,
      "Reset your New Year Celebration Hub password",
      passwordResetEmailHtml(user.name, resetUrlFor(rawToken)),
    );

    return genericResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to process request. Please try again." }, { status: 500 });
  }
}
